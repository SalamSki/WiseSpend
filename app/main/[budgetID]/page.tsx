import { getBudgets } from "@/app/lib/action";
import { ChartPieIcon } from "@heroicons/react/24/solid";
import { notFound } from "next/navigation";

export default async function BudgetPage({
  params,
}: {
  params: { budgetID: string };
}) {
  const budget = (await getBudgets())?.filter(
    (budget) => budget.id === params.budgetID,
  )[0];
  if (!budget) notFound();

  return (
    <div className="w-full">
      <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
        <ChartPieIcon className="h-8 w-8" />
        <p>{budget.name}</p>
      </h1>
    </div>
  );
}
