/*
  Warnings:

  - You are about to drop the column `package` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "package",
ADD COLUMN     "budget" DOUBLE PRECISION;
