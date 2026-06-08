/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");
