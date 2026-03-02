ALTER TABLE "discount_codes"
ADD COLUMN "redeemedTicketCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "discount_codes"
SET "redeemedTicketCount" = "usedCount"
WHERE "redeemedTicketCount" < "usedCount";
