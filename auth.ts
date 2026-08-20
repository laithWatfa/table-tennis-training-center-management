// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma"; // Your standard working pool connection file!
import { compare } from "bcryptjs";
import { authConfig } from "./auth.config";
import { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma), // Perfectly safe from Edge runtime bugs here
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const isValid = await compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.fullName , role: user.role };
      },
    }),
  ],
  callbacks: {
async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role; // 👈 Passes role from User object to JWT
    }
    return token;
  },
  async session({ session, token }) {
    if (token?.id) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role; // 👈 Passes role from JWT to Session object
    }
    return session;
  },

  },
});
