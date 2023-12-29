-- CreateTable
CREATE TABLE "_BudgetToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BudgetToUser_AB_unique" ON "_BudgetToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BudgetToUser_B_index" ON "_BudgetToUser"("B");

-- AddForeignKey
ALTER TABLE "_BudgetToUser" ADD CONSTRAINT "_BudgetToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BudgetToUser" ADD CONSTRAINT "_BudgetToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
