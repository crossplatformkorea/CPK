/*
  Warnings:

  - The primary key for the `follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `follows` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "follows" DROP CONSTRAINT "follows_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");
