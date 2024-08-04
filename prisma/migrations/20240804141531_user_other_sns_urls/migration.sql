/*
  Warnings:

  - You are about to drop the column `threads_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twitter_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "threads_id",
DROP COLUMN "twitter_id",
ADD COLUMN     "other_sns_ids" TEXT;
