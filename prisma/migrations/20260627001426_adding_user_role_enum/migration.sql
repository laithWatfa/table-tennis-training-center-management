-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Player');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Player';
