-- DropForeignKey
ALTER TABLE "public"."Portal" DROP CONSTRAINT "Portal_clientId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Portal" ADD CONSTRAINT "Portal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
