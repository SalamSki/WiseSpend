import AccountForms from "@/app/UI/account-forms";
import { getInvites, getUserByID } from "@/app/lib/action";
import { EnvelopeOpenIcon, UserIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import InviteForms from "../UI/invite-form";

export default async function AccountPage() {
  const user = await getUserByID({
    username: true,
    email: true,
    isVerified: true,
  });
  const verified = !!user?.isVerified;
  const invites = await getInvites();

  return (
    <div className="flex w-full flex-col xl:flex-row">
      <div className="xl:w-1/2">
        <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
          <UserIcon className="h-8 w-8" />
          <p>Manage your account</p>
        </h1>
        <AccountForms
          currEmail={user?.email || ""}
          currUser={user?.username || ""}
        />
      </div>
      {verified ? (
        <div className="flex flex-col items-center xl:w-1/2">
          <h1 className="relative my-8 flex items-center justify-center space-x-4 text-center text-2xl sm:m-8 md:text-4xl">
            <EnvelopeOpenIcon className="h-8 w-8" />
            <p>Received invitations</p>
            {invites && invites.length > 0 ? (
              <p className="absolute -right-8 top-0 rounded-full bg-red-500 px-2 text-base">
                {invites.length > 99 ? "99+" : invites.length}
              </p>
            ) : (
              <></>
            )}
          </h1>
          {invites && invites.length > 0 ? (
            <div className="grid w-full grid-cols-3 gap-4 p-2 text-center text-lg">
              <p className="p-2 text-primary-500">Budget</p>
              <p className="p-2 text-primary-500">Owner</p>
              <span></span>
              {invites.map((inv) => (
                <Fragment key={inv.budgetId}>
                  <p className="p-2">{inv.budget.name}</p>
                  <p className="p-2">{inv.budget.owner.username}</p>
                  <InviteForms budgetID={inv.budgetId} />
                </Fragment>
              ))}
            </div>
          ) : (
            <p>No invites yet!</p>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
