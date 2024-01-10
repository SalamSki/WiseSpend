import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { removeContributor } from "../lib/action";
import { useState } from "react";

export default function RemoveContributor({
  budgetID,
  user,
}: {
  budgetID: string;
  user: {
    id: string;
    username: string;
  };
}) {
  const [wantToRemove, setWantToRemove] = useState(false);
  return wantToRemove ? (
    <div className="flex items-center justify-between">
      <p>Are you sure?</p>
      <div className="flex items-center justify-center space-x-4">
        <form
          action={async () => removeContributor(budgetID, user.id)}
          className="flex"
        >
          <button>
            <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-600" />
          </button>
        </form>

        <button onClick={() => setWantToRemove(false)}>
          <XMarkIcon className="h-6 w-6 text-primary-500 hover:text-primary-600" />
        </button>
      </div>
    </div>
  ) : (
    <div key={user.username} className="flex items-center justify-between">
      <p>{user.username}</p>
      <button onClick={() => setWantToRemove(true)}>
        <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-600" />
      </button>
    </div>
  );
}
