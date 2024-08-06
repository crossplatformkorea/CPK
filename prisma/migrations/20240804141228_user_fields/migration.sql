/*
  Warnings:

  - You are about to drop the column `description` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "description",
DROP COLUMN "organization",
ADD COLUMN     "affiliation" TEXT,
ADD COLUMN     "introduction" TEXT;
