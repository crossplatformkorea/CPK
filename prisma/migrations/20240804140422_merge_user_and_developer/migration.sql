/*
  Warnings:

  - You are about to drop the `_DeveloperToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `developers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_DeveloperToTag" DROP CONSTRAINT "_DeveloperToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperToTag" DROP CONSTRAINT "_DeveloperToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "developers" DROP CONSTRAINT "developers_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "desired_connection" TEXT,
ADD COLUMN     "future_expectations" TEXT,
ADD COLUMN     "github_id" TEXT,
ADD COLUMN     "meetup_id" TEXT,
ADD COLUMN     "motivation_for_event_participation" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'Unknown',
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "threads_id" TEXT,
ADD COLUMN     "twitter_id" TEXT;

-- DropTable
DROP TABLE "_DeveloperToTag";

-- DropTable
DROP TABLE "developers";

-- CreateTable
CREATE TABLE "_TagToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD CONSTRAINT "_TagToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD CONSTRAINT "_TagToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
