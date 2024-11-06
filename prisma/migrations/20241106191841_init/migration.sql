-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT,
    "name" TEXT,
    "rarity_counts" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);
