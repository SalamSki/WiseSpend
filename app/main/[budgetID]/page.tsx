import BudgetView from "@/app/UI/budget-view";
import { getBudget } from "@/app/lib/action";
import prisma from "@/app/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  const session = await auth();
  const budget = await getBudget(params.budgetID);
  if (!budget || !session?.user?.id) redirect("/main");

  const { id, name, ownerId, entries, owner, contributors } = budget;

  const mappedEntries: Purchace[] = entries.map((entry) => {
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
    <div className="flex h-full w-full flex-col max-md:space-y-12 xl:flex-row">
      <BudgetView
        budget={{ id, name, ownerId, owner }}
        entries={mappedEntries}
        contributors={contributors}
        years={years.sort()}
        myID={session.user.id}
      />
    </div>
  );
}
