-- AlterTable
ALTER TABLE "post" ADD COLUMN     "gpa_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "par_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rpa_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "upa_score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "beam_give" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "giver_actor" TEXT NOT NULL,
    "recipient_actor" TEXT NOT NULL,
    "badge_symbol" TEXT NOT NULL,
    "org_account" TEXT NOT NULL,
    "par_amount" INTEGER NOT NULL,
    "upa_emitted" INTEGER NOT NULL,
    "gpa_emitted" DOUBLE PRECISION NOT NULL,
    "xyz_emitted" INTEGER NOT NULL,
    "rpa_emitted" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beam_give_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unique_giver" (
    "id" TEXT NOT NULL,
    "recipient_actor" TEXT NOT NULL,
    "giver_actor" TEXT NOT NULL,

    CONSTRAINT "unique_giver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_unique_giver" (
    "id" TEXT NOT NULL,
    "recipient_actor" TEXT NOT NULL,
    "giver_actor" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,

    CONSTRAINT "season_unique_giver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_emission_total" (
    "id" TEXT NOT NULL,
    "user_actor" TEXT NOT NULL,
    "org_account" TEXT NOT NULL,
    "beam_badge_symbol" TEXT NOT NULL,
    "par_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "upa_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gpa_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xyz_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rpa_emitted_total" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_emission_total_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reputation_score" (
    "id" TEXT NOT NULL,
    "user_actor" TEXT NOT NULL,
    "org_account" TEXT NOT NULL,
    "par_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "upa_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gpa_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rpa_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_reputation_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_giver_recipient_actor_giver_actor_key" ON "unique_giver"("recipient_actor", "giver_actor");

-- CreateIndex
CREATE UNIQUE INDEX "season_unique_giver_recipient_actor_giver_actor_season_id_key" ON "season_unique_giver"("recipient_actor", "giver_actor", "season_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_emission_total_user_actor_org_account_beam_badge_symbo_key" ON "user_emission_total"("user_actor", "org_account", "beam_badge_symbol");

-- CreateIndex
CREATE UNIQUE INDEX "user_reputation_score_user_actor_org_account_key" ON "user_reputation_score"("user_actor", "org_account");

-- AddForeignKey
ALTER TABLE "beam_give" ADD CONSTRAINT "beam_give_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
