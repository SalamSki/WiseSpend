"use server";
const nodemailer = require("nodemailer");
import otpAsciiChars, { resetEmailHTML, verificationEmailHTML } from "./utils";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { emailSchema } from "./validation-schemas";
import { randomUUID } from "crypto";

const generateOTP = () => {
  const possibleAsciiChars = otpAsciiChars;
  const randomizedAsciiChars = [...Array(5).keys()].map(
    () =>
      possibleAsciiChars[Math.floor(Math.random() * possibleAsciiChars.length)],
  );
  return String.fromCharCode(...randomizedAsciiChars);
};

const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMPT_LOGIN,
    pass: process.env.SMPT_KEY,
  },
});

export async function sendVerificationMail(user_id: string) {
  const where = {
    id: user_id,
  };

  //Make sure the time intervales between requests are at least 1min long.
  const userById = await prisma.user.findUnique({
    where: where,
    select: {
      isVerified: true,
      verifyDate: true,
      email: true,
      username: true,
    },
  });
  if (!userById || userById.isVerified)
    return {
      msg: "Failed to send email!",
      success: false,
    };

  const verifyDate = userById.verifyDate;
  const currTime = new Date().getTime();
  if (verifyDate && currTime - verifyDate.getTime() < 60000) {
    const timeToWait = Math.ceil(
      (60000 - currTime + verifyDate.getTime()) / 1000,
    );
    return {
      msg: "Wait before sending again...",
      timeToWait: timeToWait,
      success: false,
    };
  }

  //Generate OTP and update DB with hash+date.
  const otp = generateOTP();
  try {
    await prisma.user.update({
      where: where,
      data: {
        verifyToken: await bcrypt.hash(otp, 5),
        verifyDate: new Date(),
      },
    });

    transporter.sendMail({
      from: `"Account Template" <${process.env.SMPT_LOGIN}>`,
      to: userById.email,
      subject: `Account Template | ${otp}`,
      text: `Hello ${userById.username}
      \nWelcome To Account Template.
      \nHere is your verification code:
      \n${otp}
      `,
      html: verificationEmailHTML(userById.username, otp),
    });

    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      msg: "Failed to send email!",
      success: false,
    };
  }
}

export async function sendResetMail(input: string) {
  const parsedFields = emailSchema.safeParse(input);
  if (!parsedFields.success) return;

  const email = parsedFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { resetDate: true, resetToken: true, username: true },
  });

  //send once per min.
  if (
    !user ||
    (user.resetDate && new Date().getTime() - user.resetDate.getTime() < 60000)
  )
    return;

  const token = randomUUID()
    .replaceAll("-", "")
    .concat(randomUUID().replaceAll("-", ""));

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetDate: new Date() },
  });

  transporter.sendMail({
    from: `"Account Template" <${process.env.SMPT_LOGIN}>`,
    to: email,
    subject: `Account Template | Reset link`,
    text: `Hello ${user.username}
      \nWelcome To Account Template.
      \nHere is your password reset link:
      \n${process.env.HOST}/reset/${token}
      `,
    html: resetEmailHTML(user.username, `${process.env.HOST}/reset/${token}`),
  });

  return;
}
