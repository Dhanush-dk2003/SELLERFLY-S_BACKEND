-- AlterTable
ALTER TABLE "PermissionRequest" ADD COLUMN     "receiverDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderDeleted" BOOLEAN NOT NULL DEFAULT false;
