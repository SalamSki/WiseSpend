import AccountForms from "@/app/UI/account-forms";
import { getUserByID } from "@/app/lib/action";
import { UserIcon } from "@heroicons/react/24/outline";

export default async function AccountPage() {
  const user = await getUserByID({ username: true, email: true });

  return (
    <div className="w-full">
      <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
        <UserIcon className="h-8 w-8" />
        <p>Manage your account</p>
      </h1>
      <AccountForms
        currEmail={user?.email || ""}
        currUser={user?.username || ""}
      />
    </div>
  );
}
