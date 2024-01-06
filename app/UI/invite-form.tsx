"use client";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { acceptInvite, rejectInvite } from "../lib/action";
import { useFormState } from "react-dom";

export default function InviteForms({ budgetID }: { budgetID: string }) {
  const [acceptRes, acceptDispatch] = useFormState(
    acceptInvite.bind(null, budgetID),
    null,
  );
  const [rejectRes, rejectDispatch] = useFormState(
    rejectInvite.bind(null, budgetID),
    null,
  );
  return (
    <div className="flex items-center justify-around p-2">
      <form action={acceptDispatch}>
        <button>
          <CheckIcon className="h-8 w-8 text-primary-500 hover:text-primary-600" />
        </button>
      </form>
      <form action={rejectDispatch}>
        <button>
          <XMarkIcon className="h-8 w-8 text-primary-500 hover:text-primary-600" />
        </button>
      </form>
    </div>
  );
}
