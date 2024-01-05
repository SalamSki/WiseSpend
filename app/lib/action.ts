"use server";
import {
  amountSchema,
  budgetSchema,
  dateSchema,
  emailSchema,
  passSchema,
  userSchema,
} from "./validation-schemas";
import { User } from "@prisma/client";
import { auth } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { sendVerificationMail } from "./mailer";
import { logout } from "./authenticate";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { monthOrder } from "./utils";

export type State = {
  success: boolean;
  msg?: string;
};

export async function getBudgets() {
  const session = await auth();
  if (!session) return null;

  const res = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: {
      owend: true,
      budgets: true,
    },
  });
  return res ? [...res.owend, ...res.budgets] : [];
}

export async function createBudget(
  prevState: string | undefined,
  input: string,
) {
  const session = await auth();
  if (!session?.user?.id) return "Not signed in!";

  const parsedInput = budgetSchema.safeParse(input);
  if (!parsedInput.success) return "Invalid Input!";

  const budgetName = parsedInput.data;

  const budgetExists =
    (await prisma.budget.count({
      where: {
        ownerId: session.user.id,
        name: { equals: budgetName, mode: "insensitive" },
      },
    })) > 0;
  if (budgetExists) return "Name taken!";

  const createdBudget = await prisma.budget.create({
    data: { name: budgetName, ownerId: session.user.id },
  });

  redirect(`/main/${createdBudget.id}`);
}

export async function addEntry(
  budgetID: string,
  prevState: State,
  formData: {
    date: Date;
    store: string;
    amount: number;
  },
) {
  const session = await auth();
  if (!(session && session.user))
    return { success: false, msg: "Not Signed In!" };

  //RBAC, only owner or contributors are allowed to preform this action.
  const allowedUsers = await prisma.budget.findUnique({
    where: { id: budgetID },
    select: {
      ownerId: true,
      contributors: {
        select: {
          id: true,
        },
      },
    },
  });
  if (
    session.user.id !== allowedUsers?.ownerId &&
    !allowedUsers?.contributors.includes({ id: session.user.id })
  )
    return { success: false, msg: "Action not permitted!" };

  const parsedFields = z
    .object({
      date: dateSchema,
      store: userSchema,
      amount: amountSchema,
    })
    .safeParse(formData);
  if (!parsedFields.success) return { success: false, msg: "Invalid Input!" };

  const { date, store, amount } = parsedFields.data;

  await prisma.entry.create({
    data: {
      budget: {
        connect: { id: budgetID },
      },
      amount,
      date,
      store,
    },
  });
  revalidatePath(`/main/${budgetID}`);
  return {
    success: true,
    msg: `${date.getFullYear()}-${monthOrder[date.getMonth()]}`,
  };
}

export async function deleteEntries(budgetID: string, IDs: string[]) {
  const session = await auth();
  if (!(session && session.user)) return "Not Signed In!";

  //RBAC, only owner or contributors are allowed to preform this action.
  const allowedUsers = await prisma.budget.findUnique({
    where: { id: budgetID },
    select: {
      ownerId: true,
      contributors: {
        select: {
          id: true,
        },
      },
    },
  });
  if (
    session.user.id !== allowedUsers?.ownerId &&
    !allowedUsers?.contributors.includes({ id: session.user.id })
  )
    return "Action not permitted!";

  await prisma.entry.deleteMany({
    where: {
      id: {
        in: IDs,
      },
    },
  });

  revalidatePath(`/main/${budgetID}`);
  return "";
}

//account temp functions:
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

  revalidatePath("/account");
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

  redirect("/");
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
