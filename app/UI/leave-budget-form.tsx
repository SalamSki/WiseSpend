import {
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { leaveBudget } from "../lib/action";

export default function LeaveBudgetForm({ budgetID }: { budgetID: string }) {
  const [wantToLeave, setWantToLeave] = useState(false);
  return (
    <div className="my-2 flex items-center justify-center">
      {wantToLeave ? (
        <div className="flex w-full justify-between">
          <p>Are you sure?</p>
          <div className="flex items-center justify-center space-x-4">
            <form action={leaveBudget.bind(null, budgetID)} className="flex">
              <button>
                <ArrowRightOnRectangleIcon className="h-8 w-8 text-primary-500 hover:text-red-500" />
              </button>
            </form>
            <button onClick={() => setWantToLeave(false)}>
              <XMarkIcon className="h-8 w-8 text-primary-500 hover:text-primary-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full justify-between">
          <p className="text-primary-500">Leave budget</p>
          <button onClick={() => setWantToLeave(true)}>
            <ArrowRightOnRectangleIcon className="h-8 w-8 text-primary-500 hover:text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
