-- AlterTable
ALTER TABLE "post" ADD COLUMN     "is_announcement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "on_chain_post_id" BIGINT;
