"use server";
import { emailSchema, passSchema, userSchema } from "./validation-schemas";
import { User } from "@prisma/client";
import { auth } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { sendVerificationMail } from "./mailer";
import { logout } from "./authenticate";
import { z } from "zod";
import bcrypt from "bcrypt";

export type State = {
  success: boolean;
  msg?: string;
};

export async function getUserByID(
  filter: Partial<{ [key in keyof User]: boolean }>,
) {
  const session = await auth();
  if (!session) return null;
  return await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: filter,
  });
}

export async function changeUsername(prevState: State, input: string) {
  const session = await auth();
  if (!(session && session.user))
    return { success: false, msg: "Not Signed In!" };

  const parsedFields = userSchema.safeParse(input);
  if (!parsedFields.success) return { success: false, msg: "Invalid Input!" };

  const newUsername = parsedFields.data;

  const userNameExists =
    (await prisma.user.count({
      where: {
        username: {
          equals: newUsername,
          mode: "insensitive",
        },
      },
    })) > 0;
  if (userNameExists) return { success: false, msg: "Username taken!" };

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      username: newUsername,
    },
  });

  revalidatePath("/main/account");
  return { success: true, msg: "Username changed!" };
}

export async function changeEmail(prevState: State, input: string) {
  const session = await auth();
  if (!(session && session.user))
    return { success: false, msg: "Not Signed In!" };

  const parsedFields = emailSchema.safeParse(input);
  if (!parsedFields.success) return { success: false, msg: "Invalid Input!" };

  const email = parsedFields.data;

  const emailExists = (await prisma.user.count({ where: { email } })) > 0;
  if (emailExists) return { success: false, msg: "Email taken!" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email, isVerified: false },
  });

  await sendVerificationMail(session.user.id);

  revalidatePath("/main/account");
  return { success: true };
}

export async function changePass(prevState: State, formData: FormData) {
  const session = await auth();
  if (!(session && session.user))
    return { success: false, msg: "Not Signed In!" };

  const parsedPasswords = z
    .object({
      currPass: passSchema,
      newPass: passSchema,
      confirmPass: passSchema,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsedPasswords.success)
    return { success: false, msg: "Invalid Input!" };

  const { currPass, newPass, confirmPass } = parsedPasswords.data;

  if (currPass === newPass)
    return { success: false, msg: "Cannot change to your current password!" };

  if (newPass !== confirmPass)
    return { success: false, msg: "The passwords don't match!" };

  const storedHash = (await getUserByID({ pass: true }))?.pass || "";
  if (!(await bcrypt.compare(currPass, storedHash)))
    return { success: false, msg: "The current password is wrong!" };

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      pass: await bcrypt.hash(newPass, 5),
    },
  });
  return { success: true, msg: "Password changed!" };
}

export async function deleteAccount() {
  const session = await auth();
  if (!(session && session.user)) return;

  await prisma.user.delete({ where: { id: session.user.id } });

  await logout();
}
