import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedRes = z.object({ id: z.string() }).safeParse({
          id: credentials.id,
        });
        if (!parsedRes.success) return null;
        return parsedRes.data;
      },
    }),
  ],
});
