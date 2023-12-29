import SideNav from "../UI/sidenav";
import VerifyPage from "../UI/verify";
import { getUserByID } from "../lib/action";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <main className="flex grow flex-col items-center px-4 md:py-12">
        {children}
      </main>
    </div>
  );
}
