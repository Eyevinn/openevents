-- Account deletion lifecycle: soft-delete, confirmation/grace tokens, and anonymization timestamp
ALTER TABLE "users"
  ADD COLUMN "deletionRequestedAt" TIMESTAMP(3),
  ADD COLUMN "deletionConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "deletionScheduledFor" TIMESTAMP(3),
  ADD COLUMN "deletionConfirmationToken" TEXT,
  ADD COLUMN "deletionConfirmationExpiresAt" TIMESTAMP(3),
  ADD COLUMN "deletionCancellationToken" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "anonymizedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_deletionConfirmationToken_key" ON "users"("deletionConfirmationToken");
CREATE UNIQUE INDEX "users_deletionCancellationToken_key" ON "users"("deletionCancellationToken");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");
CREATE INDEX "users_deletionScheduledFor_idx" ON "users"("deletionScheduledFor");
