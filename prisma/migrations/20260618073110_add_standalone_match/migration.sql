-- Add teamId as nullable first, make eventId nullable
ALTER TABLE "Match" ADD COLUMN "teamId" TEXT;
ALTER TABLE "Match" ALTER COLUMN "eventId" DROP NOT NULL;

-- Backfill teamId from event
UPDATE "Match" m SET "teamId" = (SELECT e."teamId" FROM "Event" e WHERE e."id" = m."eventId");

-- Make teamId NOT NULL
ALTER TABLE "Match" ALTER COLUMN "teamId" SET NOT NULL;

-- Add foreign key for teamId
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
