"use client";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../lib/authenticate";

const links = [
  { name: "Main", href: ["/", "/main"], icon: HomeIcon },
  { name: "Account", href: ["/main/account"], icon: UserIcon },
];

export default function SideNav({ verified }: { verified: boolean }) {
  const path = usePathname();
  return (
    <header className="flex w-full flex-none flex-col p-4 md:h-full md:w-64 md:py-12">
      {/* Logo */}
      <div className="hidden border-b py-8 sm:p-8 md:flex md:justify-center ">
        <p className="text-center text-2xl md:text-4xl">App</p>
      </div>

      <div className=" mt-2 flex grow flex-row space-x-2 rounded md:flex-col  md:space-x-0 md:space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href[0]}
            onClick={(e) => {
              if (!verified) e.preventDefault();
            }}
            className={`hover:bg-dark-200 flex h-[48px] grow items-center justify-center gap-2  p-3 transition-colors md:flex-none md:justify-start md:px-3 md:py-2 ${
              !verified ? "cursor-not-allowed" : null
            }`}
          >
            <link.icon
              className={`h-6 w-6 ${
                link.href.includes(path) ? "max-md:border-b" : null
              }`}
            />
            <p className="hidden md:block">{link.name}</p>
            {link.href.includes(path) ? (
              <ChevronLeftIcon className="ml-auto hidden h-6 w-6 md:block" />
            ) : null}
          </Link>
        ))}

        <form action={logout}>
          <button className="text-primary-600 hover:text-primary-400 hover:bg-dark-200 flex h-[48px] w-full items-center justify-center gap-2 p-3 transition-colors md:flex-none md:justify-start md:px-3 md:py-2">
            <ArrowLeftOnRectangleIcon className="hidden h-6 w-6 md:block" />
            <p className="hidden md:block">Log out</p>
            <ArrowRightOnRectangleIcon className="block h-6 w-6 md:hidden" />
          </button>
        </form>
      </div>
    </header>
  );
}
