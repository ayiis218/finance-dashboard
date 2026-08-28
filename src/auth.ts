import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user }) {
      if (!ALLOWED_EMAIL) return true;
      return user.email === ALLOWED_EMAIL;
    },
  },
  pages: {
    signIn: "/login",
  },
});
