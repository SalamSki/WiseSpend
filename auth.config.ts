import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const noneLoggedInPages =
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/reset") ||
        request.nextUrl.pathname === "/signup";

      if (isLoggedIn) {
        if (noneLoggedInPages)
          return NextResponse.rewrite(new URL("/main", request.nextUrl));
      } else {
        if (!noneLoggedInPages)
          return NextResponse.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },

    async session({ token, session }: { session: any; token: any }) {
      delete session.user;
      session.user = { id: token.sub };
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
  trustHost: true,
} satisfies NextAuthConfig;
