/*
  Warnings:

  - You are about to drop the column `updated_at` on the `developers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "developers" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);
