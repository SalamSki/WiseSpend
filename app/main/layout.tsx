import SideNav from "../UI/sidenav";
import VerifyPage from "../UI/verify";
import { getUserByID } from "../lib/action";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserByID({ id: true, isVerified: true });
  const verified = !!user?.isVerified;
  return (
    <div className="mx-auto flex h-screen flex-col lg:container md:flex-row md:overflow-hidden 2xl:max-w-screen-xl">
      <SideNav verified={verified} />
      <main className="flex grow flex-col px-4 md:py-12">
        {verified ? children : <VerifyPage user_id={user?.id} />}
      </main>
    </div>
  );
}
