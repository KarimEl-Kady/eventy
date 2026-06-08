-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "weddingTime" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
