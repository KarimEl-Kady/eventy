-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "previewImage" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");
