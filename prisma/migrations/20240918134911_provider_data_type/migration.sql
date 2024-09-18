/*
  Warnings:

  - The `provider` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT DEFAULT 'email';

-- DropEnum
DROP TYPE "AuthType";
