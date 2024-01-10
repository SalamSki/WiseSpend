import { ChartPieIcon } from "@heroicons/react/24/outline";
import BudgetList from "../UI/budget-list";
import { getBudgets } from "../lib/action";
import { auth } from "@/auth";

export default async function MainPage() {
  const session = await auth();
  const budgets = await getBudgets();

  return (
    <div className="w-full max-w-screen-xl">
      <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
        <ChartPieIcon className="h-8 w-8" />
        <p>Budgets</p>
      </h1>

      <BudgetList budgets={budgets || []} myID={session?.user?.id || ""} />
    </div>
  );
}
