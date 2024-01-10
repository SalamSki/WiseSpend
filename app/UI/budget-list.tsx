"use client";
import Link from "next/link";
import AddBudget from "./create-budget-form";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function BudgetList({
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const closeModal = () => setAddModalOpen(false);
  return (
    <>
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center md:text-2xl">
          <span className="text-primary-500">Welcome to WiseSpend!</span>
          <span>Start tracking your expenses by creating a budget.</span>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-col max-md:space-y-4 max-md:p-4 md:grid md:grid-cols-3 md:gap-8">
        {budgets.length > 0 ? (
          //TODO add pagination to budget list.
          <>
            {budgets.map((budget) => (
              <Link
                className="flex select-none flex-col items-center justify-center rounded-md bg-dark-200 px-4 py-8 text-center shadow-md hover:bg-dark-300"
                href={`/main/${budget.id}`}
                key={budget.id}
              >
                <p className="text-lg">{budget.name}</p>
                {budget.ownerId !== myID ? (
                  <p className="text-sm text-dark-600">
                    Owner: {budget.owner.username}
                  </p>
                ) : (
                  <></>
                )}
              </Link>
            ))}
          </>
        ) : (
          <></>
        )}
        <div
          onClick={() => setAddModalOpen(true)}
          className="flex cursor-pointer select-none flex-col items-center justify-center rounded-md bg-dark-200 px-4 py-8 text-center shadow-md hover:bg-dark-300"
        >
          <PlusIcon className="h-6 w-6" />
        </div>
      </div>
      {addModalOpen ? (
        <div className="fixed inset-0 z-10 flex h-[calc(100%-1rem)] max-h-full items-center justify-center bg-dark-100 bg-opacity-50">
          <div
            onClick={() => setAddModalOpen(false)}
            className="fixed inset-0 z-20 h-[calc(100%-1rem)] max-h-full"
          />
          <AddBudget classNames="z-30" closeModal={closeModal} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
