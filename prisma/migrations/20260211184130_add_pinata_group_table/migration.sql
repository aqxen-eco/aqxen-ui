-- CreateTable
CREATE TABLE "pinata_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pinata_group_id" TEXT NOT NULL,
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinata_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pinata_group_name_key" ON "pinata_group"("name");
