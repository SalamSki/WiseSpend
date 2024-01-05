-- CreateTable
CREATE TABLE "Invite" (
    "invDate" TIMESTAMP(3) NOT NULL,
    "invitedId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_invitedId_budgetId_key" ON "Invite"("invitedId", "budgetId");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
