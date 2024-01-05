import Link from "next/link";

export default async function BudgetList({
  budgets,
  myID,
}: {
  budgets: ({
    owner: {
      username: string;
    };
  } & {
    id: string;
    name: string;
    ownerId: string;
  })[];
  myID: string;
}) {
  return (
    //TODO add pagination to budget list.
    <div className="flex flex-col max-md:space-y-4 max-md:p-4 md:grid md:grid-cols-3 md:gap-8">
      {budgets.map((budget) => (
        <Link
          className="flex select-none flex-col items-center justify-center rounded-md bg-dark-200 px-4 py-8 text-center shadow-md hover:bg-dark-300"
          href={`/main/${budget.id}`}
          key={budget.id}
        >
          <p className="text-lg">{budget.name}</p>
          {budget.ownerId !== myID ? (
            <p className="text-sm text-dark-600">{budget.owner.username}</p>
          ) : (
            <></>
          )}
        </Link>
      ))}
    </div>
  );
}
