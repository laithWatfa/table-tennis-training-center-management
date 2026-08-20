import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
/**
 * Returned by `useSession`, `auth()`, and received as a prop on the `SessionProvider` React Context
 */
interface Session {
    user: {
    id: string;
    name: string;
    email: string;
    role: Role; // 👈 Add your custom role property here
    } & DefaultSession["user"];
}

/**
 * The shape of the user object returned in the OAuth providers or Credentials authorize callback
 */
interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: Role; // 👈 Add your custom role property here
}
}

declare module "next-auth/jwt" {
/** Returned by the `jwt` callback and accessible in the session callback */
interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: Role; // 👈 Add your custom role property here
}
}
