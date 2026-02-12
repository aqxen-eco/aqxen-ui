-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_upload_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cover_upload_count" INTEGER NOT NULL DEFAULT 0;
