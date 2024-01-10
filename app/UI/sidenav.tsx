"use client";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../lib/authenticate";
import { useEffect, useState } from "react";
import { revalidateURL } from "../lib/action";

const links = [
  { name: "Budgets", href: ["/", "/main"], icon: ChartPieIcon },
  { name: "Account", href: ["/account"], icon: UserIcon },
];

export default function SideNav({
  verified,
  invites,
}: {
  verified: boolean;
  invites: number;
}) {
  const path = usePathname();
  const refreshRateInSec = 60;
  const [refreshCounter, setRefreshCounter] = useState(refreshRateInSec);
  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshCounter > 0) setRefreshCounter(refreshCounter - 1);
      else {
        setRefreshCounter(refreshRateInSec);
        revalidateURL(path);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshCounter, path]);

  return (
    <header className="flex w-full flex-none flex-col px-4 py-2 max-md:border-b max-md:border-dark-300 md:h-full md:w-64 md:py-12">
      {/* Logo */}
      <div className="hidden border-b py-8 sm:p-8 md:flex md:justify-center ">
        <p className="text-center text-2xl md:text-4xl">Wise Spend</p>
      </div>

      <div className="flex grow flex-row space-x-2 rounded max-md:justify-around md:mt-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href[0]}
            className={`relative flex h-[48px] items-center justify-center gap-2 p-3  transition-colors hover:bg-dark-200 max-md:rounded-full max-md:hover:bg-dark-300 md:flex-none md:justify-start md:px-3 md:py-2 ${
              link.href.includes(path) ? "max-md:bg-dark-200" : ""
            }`}
          >
            <link.icon className={`h-6 w-6`} />
            <p className="hidden md:block">{link.name}</p>
            {link.href[0] === "/account" && verified && invites > 0 ? (
              <p className="rounded-full bg-red-500 px-2 max-md:absolute max-md:-right-2 max-md:top-0">
                {invites > 99 ? "99+" : invites}
              </p>
            ) : (
              <></>
            )}
            {link.href.includes(path) ? (
              <ChevronLeftIcon className="ml-auto hidden h-6 w-6 md:block" />
            ) : null}
          </Link>
        ))}

        <form action={logout}>
          <button className="flex h-[48px] w-full items-center justify-center gap-2 p-3 text-primary-600 transition-colors hover:bg-dark-200 hover:text-primary-400 max-md:rounded-full max-md:hover:bg-dark-300 md:flex-none md:justify-start md:px-3 md:py-2">
            <ArrowLeftOnRectangleIcon className="hidden h-6 w-6 md:block" />
            <p className="hidden md:block">Log out</p>
            <ArrowRightOnRectangleIcon className="block h-6 w-6 md:hidden" />
          </button>
        </form>
      </div>
    </header>
  );
}
