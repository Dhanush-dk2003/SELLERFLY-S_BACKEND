/*
  Warnings:

  - You are about to drop the column `panNumber` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "panNumber",
ADD COLUMN     "gstCertificateNumber" TEXT;
