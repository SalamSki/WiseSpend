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

export async function revalidateURL(url: string) {
  revalidatePath(url);
}

export async function leaveBudget(budgetID: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      budgets: {
        where: { id: budgetID },
        select: { id: true },
      },
    },
  });
  if (!user || user.budgets.length !== 1) return null;

  await prisma.budget.update({
    where: {
      id: user.budgets[0].id,
    },
    data: {
      contributors: {
        disconnect: {
          id: session.user.id,
        },
      },
    },
  });

  redirect("/main");
}

export async function acceptInvite(budgetID: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const invite = await prisma.invite.findUnique({
    where: {
      invitedId_budgetId: {
        budgetId: budgetID,
        invitedId: session.user.id,
      },
    },
  });
  if (!invite || new Date().getTime() - invite.invDate.getTime() > 259200000)
    return null;

  await prisma.budget.update({
    where: {
      id: invite.budgetId,
    },
    data: {
      contributors: {
        connect: {
          id: invite.invitedId,
        },
      },
    },
  });

  await prisma.invite.delete({
    where: {
      invitedId_budgetId: {
        budgetId: budgetID,
        invitedId: session.user.id,
      },
    },
  });

  revalidatePath("/account");
  return null;
}

export async function rejectInvite(budgetID: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const invite = await prisma.invite.findUnique({
    where: {
      invitedId_budgetId: {
        budgetId: budgetID,
        invitedId: session.user.id,
      },
    },
  });
  if (!invite) return null;

  await prisma.invite.delete({
    where: {
      invitedId_budgetId: {
        budgetId: budgetID,
        invitedId: session.user.id,
      },
    },
  });

  revalidatePath("/account");
  return null;
}

export async function getInvites() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await prisma.invite.findMany({
    where: {
      invitedId: session.user.id,
    },
    select: {
      budgetId: true,
      invDate: true,
      budget: {
        select: {
          name: true,
          owner: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
}

export async function removeContributor(
  budgetID: string,
  contributorID: string,
) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const budget = await prisma.budget.findUnique({
    where: {
      id: budgetID,
      contributors: {
        some: {
          id: contributorID,
        },
      },
      ownerId: session.user.id,
    },
    select: { id: true },
  });
  if (!budget) return null;

  await prisma.budget.update({
    where: {
      id: budget.id,
    },
    data: {
      contributors: {
        disconnect: {
          id: contributorID,
        },
      },
    },
  });
  revalidatePath(`/main/${budgetID}`);
}

export async function inviteUserToBudget(
  budgetID: string,
  prevState: State,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, msg: "Not signed in!" };

  //Check if current user is owner of budget.
  const budget = await prisma.budget.findUnique({
    where: {
      id: budgetID,
    },
    include: {
      contributors: {
        select: {
          id: true,
        },
      },
    },
  });
  if (budget?.ownerId !== session.user.id || budget.contributors.length >= 5)
    return { success: false, msg: "Action not permitted!" };

  const input = Object.fromEntries(formData);

  //default to email
  let type = 0;
  let parsedIdentifier = emailSchema.safeParse(input.identifier);

  if (!parsedIdentifier.success) {
    //if not email, fallback to username
    type = 1;
    parsedIdentifier = userSchema.safeParse(input.identifier);
    if (!parsedIdentifier.success)
      return { success: false, msg: "No such user." };
  }

  const identifier = parsedIdentifier.data;
  //Fetch user if it exists
  let invited = null;
  if (type === 0) {
    invited = await prisma.user.findUnique({
      where: { email: identifier },
      select: {
        id: true,
        username: true,
      },
    });
  } else {
    invited = await prisma.user.findFirst({
      where: {
        username: {
          equals: identifier,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
  }
  if (!invited) return { success: false, msg: "No such user." };

  if (invited.id === session.user.id)
    return { success: false, msg: "Can't invite yourself..." };

  if (budget.contributors.map((user) => user.id).includes(invited.id))
    return { success: false, msg: "User already has access." };

  const existingInvite = await prisma.invite.findUnique({
    where: {
      invitedId_budgetId: {
        budgetId: budgetID,
        invitedId: invited.id,
      },
    },
  });
  if (existingInvite) return { success: false, msg: "User already invited." };

  await prisma.invite.create({
    data: {
      invDate: new Date(),
      budget: { connect: { id: budgetID } },
      invited: { connect: { id: invited.id } },
    },
  });
  return { success: true, msg: invited.username };
}

export async function getBudget(budgetID: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await prisma.budget.findUnique({
    where: {
      id: budgetID,
      OR: [
        { ownerId: session.user.id },
        {
          contributors: {
            some: {
              id: session.user.id,
            },
          },
        },
      ],
    },
    include: {
      entries: {
        select: {
          id: true,
          date: true,
          store: true,
          amount: true,
        },
      },
      owner: {
        select: {
          username: true,
        },
      },
      contributors: {
        select: {
          username: true,
          id: true,
        },
      },
    },
  });
}

export async function getBudgets() {
  const session = await auth();
  if (!session) return null;
  return await prisma.budget.findMany({
    where: {
      OR: [
        { ownerId: session.user?.id },
        {
          contributors: {
            some: {
              id: session.user?.id,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          username: true,
        },
      },
    },
  });
}

export async function createBudget(prevState: State, input: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, msg: "Not signed in!" };

  const parsedInput = budgetSchema.safeParse(input);
  if (!parsedInput.success) return { success: false, msg: "Invalid Input!" };

  const budgetName = parsedInput.data;

  const budgetExists =
    (await prisma.budget.count({
      where: {
        ownerId: session.user.id,
        name: { equals: budgetName, mode: "insensitive" },
      },
    })) > 0;
  if (budgetExists) return { success: false, msg: "Name taken!" };

  await prisma.budget.create({
    data: { name: budgetName, ownerId: session.user.id },
  });

  revalidatePath(`/main`);
  return { success: true };
}

export async function changeBudgetName(
  budgetID: string,
  prevState: State,
  input: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, msg: "Not signed in!" };

  const parsedInput = budgetSchema.safeParse(input);
  if (!parsedInput.success) return { success: false, msg: "Invalid Input!" };

  const budgetName = parsedInput.data;

  const budgetExists =
    (await prisma.budget.count({
      where: {
        ownerId: session.user.id,
        name: { equals: budgetName, mode: "insensitive" },
        id: {
          not: budgetID,
        },
      },
    })) > 0;
  if (budgetExists) return { success: false, msg: "Name taken!" };

  await prisma.budget.update({
    where: {
      id: budgetID,
    },
    data: {
      name: budgetName,
    },
  });

  revalidatePath(`/main/${budgetID}`);
  return { success: true };
}

export async function deleteBudget(budgetID: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  await prisma.budget.delete({
    where: {
      id: budgetID,
      ownerId: session.user.id,
    },
  });

  redirect("/main");
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
    !allowedUsers?.contributors.map((user) => user.id).includes(session.user.id)
  )
    return { success: false, msg: "Action not permitted!" };
  const parsedFields = z
    .object({
      date: dateSchema,
      store: budgetSchema,
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
    !allowedUsers?.contributors.map((user) => user.id).includes(session.user.id)
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
