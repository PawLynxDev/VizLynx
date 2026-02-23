-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "brandKitId" TEXT;

-- CreateTable
CREATE TABLE "BrandKit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoLightUrl" TEXT,
    "logoLightKey" TEXT,
    "logoDarkUrl" TEXT,
    "logoDarkKey" TEXT,
    "colorPrimary" TEXT NOT NULL DEFAULT '#6c63ff',
    "colorSecondary" TEXT NOT NULL DEFAULT '#1a1a2e',
    "colorAccent" TEXT NOT NULL DEFAULT '#ff6b6b',
    "colorBackground" TEXT NOT NULL DEFAULT '#ffffff',
    "colorText" TEXT NOT NULL DEFAULT '#1a1a2e',
    "fontHeading" TEXT NOT NULL DEFAULT 'Inter',
    "fontBody" TEXT NOT NULL DEFAULT 'Inter',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandKit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandKit_userId_idx" ON "BrandKit"("userId");

-- CreateIndex
CREATE INDEX "Project_brandKitId_idx" ON "Project"("brandKitId");

-- AddForeignKey
ALTER TABLE "BrandKit" ADD CONSTRAINT "BrandKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "BrandKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
