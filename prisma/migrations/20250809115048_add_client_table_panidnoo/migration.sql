/*
  Warnings:

  - You are about to drop the column `clientId` on the `Client` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Client_clientId_key";

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "clientId",
ADD COLUMN     "pancardLink" TEXT;
