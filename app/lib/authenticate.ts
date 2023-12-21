"use server";
import { emailSchema, passSchema, userSchema } from "./validation-schemas";
import { sendVerificationMail } from "./mailer";
import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getUserByID } from "./action";

export async function createUser(
  prevState: string | undefined,
  formData: { username: string; email: string; pass: string },
) {
  const parsedFields = z
    .object({
      username: userSchema,
      email: emailSchema,
      pass: passSchema,
    })
    .safeParse(formData);

  if (!parsedFields.success) return "Invalid Input!";

  const { email, username, pass } = parsedFields.data;

  try {
    const emailExists = (await prisma.user.count({ where: { email } })) > 0;
    if (emailExists) return "Username or Email taken!";

    const userNameExists =
      (await prisma.user.count({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      })) > 0;
    if (userNameExists) return "Username or Email taken!";

    const hashedPass = await bcrypt.hash(pass, 5);
    const user = await prisma.user.create({
      data: { email, pass: hashedPass, username },
    });

    await signIn("credentials", { id: user.id, redirect: false });

    await sendVerificationMail(user.id);
  } catch (error) {
    console.log(error);
    return "Failed to Create Account.";
  }
  redirect("/");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const input = Object.fromEntries(formData);
  const err = "Invalid Credentials!";

  //default to email
  let type = 0;
  let parsedIdentifier = emailSchema.safeParse(input.identifier);

  if (!parsedIdentifier.success) {
    //if not email, fallback to username
    type = 1;
    parsedIdentifier = userSchema.safeParse(input.identifier);
    if (!parsedIdentifier.success) return err;
  }

  const parsedPass = passSchema.safeParse(input.pass);
  if (!parsedPass.success) return err;

  const identifier = parsedIdentifier.data;
  const pass = parsedPass.data;

  //Fetch user if it exists
  let user = null;
  if (type === 0) {
    user = await prisma.user.findUnique({
      where: { email: identifier },
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        username: {
          equals: identifier,
          mode: "insensitive",
        },
      },
    });
  }
  if (!user) return err;

  //Check if password correct
  const match = await bcrypt.compare(pass, user.pass);
  if (!match) return err;
  try {
    await signIn("credentials", { id: user.id, redirect: false });
  } catch (error) {
    if ((error as Error).message.includes("credentialssignin")) return err;
  }
  redirect("/");
}

export async function validateUser(otp: string) {
  const session = await auth();
  if (!(session && session.user)) return { msg: "Not Signed In!" };

  const where = {
    id: session.user.id,
  };
  const err = { msg: "Code expired!" };

  try {
    const user = await getUserByID({
      isVerified: true,
      verifyDate: true,
      verifyToken: true,
    });

    if (!(user && !user.isVerified && user.verifyDate && user.verifyToken))
      return err;

    const expiryDate = user.verifyDate.getTime() + 300000;
    const currTime = new Date().getTime();
    if (currTime > expiryDate) return err;

    const parsedOtp = z
      .string()
      .regex(new RegExp("^[A-Z0-9]{5}$"))
      .safeParse(otp);
    if (
      !(
        parsedOtp.success &&
        (await bcrypt.compare(parsedOtp.data, user.verifyToken))
      )
    )
      return err;

    await prisma.user.update({
      where: where,
      data: {
        isVerified: true,
        verifyDate: null,
        verifyToken: null,
      },
    });
  } catch (error) {
    console.log(error);
    return err;
  }
  revalidatePath("/");
}

export async function resetPass(
  id: string,
  prevState: string,
  formData: FormData,
) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { pass: true },
  });
  if (!user) return "Invalid Input!";

  const parsedPasswords = z
    .object({
      newPass: passSchema,
      confirmPass: passSchema,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsedPasswords.success) return "Invalid Input!";

  const { newPass, confirmPass } = parsedPasswords.data;

  if (newPass !== confirmPass) return "The passwords don't match!";

  if (await bcrypt.compare(newPass, user.pass))
    return "Cannot change to an old password!";

  await prisma.user.update({
    where: { id },
    data: {
      pass: await bcrypt.hash(newPass, 5),
      resetDate: null,
      resetToken: null,
    },
  });

  redirect("/");
}

export async function logout() {
  await signOut({ redirect: true, redirectTo: "/" });
}
