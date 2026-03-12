-- AlterTable
ALTER TABLE "beam_give" ADD COLUMN     "delta_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tracking_deltas" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "par_amount" SET DEFAULT 0,
ALTER COLUMN "upa_emitted" SET DEFAULT 0,
ALTER COLUMN "gpa_emitted" SET DEFAULT 0,
ALTER COLUMN "xyz_emitted" SET DEFAULT 0,
ALTER COLUMN "rpa_emitted" SET DEFAULT 0;
