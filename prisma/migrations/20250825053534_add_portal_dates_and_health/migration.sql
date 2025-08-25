-- CreateEnum
CREATE TYPE "public"."PortalHealth" AS ENUM ('GOOD', 'BAD', 'NEEDS_IMPROVEMENT');

-- AlterTable
ALTER TABLE "public"."Portal" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "portalHealth" "public"."PortalHealth",
ADD COLUMN     "startDate" TIMESTAMP(3);
