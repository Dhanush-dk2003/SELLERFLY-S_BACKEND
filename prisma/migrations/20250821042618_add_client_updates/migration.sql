/*
  Warnings:

  - You are about to drop the column `cancelChequeLink` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `gstCertificateLink` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `pancardLink` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `signatureLink` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `trademarkCertificateLink` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "cancelChequeLink",
DROP COLUMN "gstCertificateLink",
DROP COLUMN "pancardLink",
DROP COLUMN "signatureLink",
DROP COLUMN "trademarkCertificateLink",
ADD COLUMN     "aPlus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brandWebstore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "documentsLink" TEXT;
