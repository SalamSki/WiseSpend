import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { deleteBudget } from "../lib/action";

export default function DeleteBudgetForm({
  budgetID,
  scrollRef,
}: {
  budgetID: string;
  scrollRef: React.MutableRefObject<null>;
}) {
  const [wantToDelete, setWantToDelete] = useState(false);
  return (
    <div ref={scrollRef} className="my-2 flex items-center justify-center">
      {wantToDelete ? (
        <div className="flex w-full justify-between">
          <p>Are you sure?</p>
          <div className="flex items-center justify-center space-x-4">
            <form action={deleteBudget.bind(null, budgetID)} className="flex">
              <button>
                <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-600" />
              </button>
            </form>
            <button onClick={() => setWantToDelete(false)}>
              <XMarkIcon className="h-6 w-6 text-primary-500 hover:text-primary-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full justify-between">
          <p>Delete budget</p>
          <button onClick={() => setWantToDelete(true)}>
            <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}
