import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prismaEdge = new PrismaClient()

// export const prismaEdge = new PrismaClient();