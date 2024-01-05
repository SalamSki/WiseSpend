import BudgetView from "@/app/UI/budget-view";
import { getBudgets } from "@/app/lib/action";
import prisma from "@/app/lib/prisma";
import { dateToString } from "@/app/lib/utils";
import { Entry } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

export type Purchace = {
  id: string;
  store: string;
  amount: number;
  date: Date;
};

export default async function BudgetPage({
  params,
}: {
  params: { budgetID: string };
}) {
  const budget = (await getBudgets())?.filter(
    (budget) => budget.id === params.budgetID,
  )[0];
  if (!budget) redirect("/main");

  const entries = (
    await prisma.entry.findMany({
      where: {
        budgetId: params.budgetID,
      },
      select: {
        id: true,
        date: true,
        store: true,
        amount: true,
      },
    })
  ).map((entry) => {
    const { amount, date, ...rest } = entry;
    return {
      amount: Number(amount),
      date: new Date(date),
      ...rest,
    };
  });

  const years = (
    await prisma.$queryRaw<{ year: number }[]>`
    SELECT
        date_part('year', "date") as year
    FROM public."Entry"
    WHERE
        "budgetId" = ${params.budgetID}
    GROUP BY year;
  `
  ).map((entry) => entry.year);

  return (
    <div className="flex h-full w-full flex-col space-y-12 xl:flex-row">
      <BudgetView budget={budget} entries={entries} years={years.sort()} />
    </div>
  );
}
