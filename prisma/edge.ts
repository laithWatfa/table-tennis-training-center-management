import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prismaEdge = new PrismaClient().$extends(withAccelerate());
