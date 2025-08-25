-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "brandRegistryDoc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "currentAccountDoc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gstDoc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardedDate" TIMESTAMP(3),
ADD COLUMN     "panDoc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trademarkDoc" BOOLEAN NOT NULL DEFAULT false;
