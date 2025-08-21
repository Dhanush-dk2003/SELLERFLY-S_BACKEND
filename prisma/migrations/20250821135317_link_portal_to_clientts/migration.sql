/*
  Warnings:

  - A unique constraint covering the columns `[clientId,portalName,username]` on the table `Portal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Client_companyName_idx" ON "public"."Client"("companyName");

-- CreateIndex
CREATE INDEX "Portal_status_idx" ON "public"."Portal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_clientId_portalName_username_key" ON "public"."Portal"("clientId", "portalName", "username");
