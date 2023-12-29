import SideNav from "../UI/sidenav";
import VerifyPage from "../UI/verify";
import { getUserByID } from "../lib/action";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col-reverse md:flex-row">
      <SideNav />
      <main className="flex max-h-screen grow flex-col items-center overflow-y-auto px-4 md:py-12">
        {children}
      </main>
    </div>
  );
}
