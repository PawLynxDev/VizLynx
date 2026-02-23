-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Promotion',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "userId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "sourceImageUrl" TEXT NOT NULL,
    "sourceImageKey" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "sourceFileSize" INTEGER NOT NULL,
    "sourceMimeType" TEXT NOT NULL,
    "fluxPrompt" TEXT,
    "marketingHeadline" TEXT,
    "marketingSubline" TEXT,
    "marketingCta" TEXT,
    "productAnalysis" TEXT,
    "fluxImageUrl" TEXT,
    "fluxImageKey" TEXT,
    "fluxSeed" INTEGER,
    "finalImageUrl" TEXT,
    "finalImageKey" TEXT,
    "finalWidth" INTEGER,
    "finalHeight" INTEGER,
    "videoUrl" TEXT,
    "videoKey" TEXT,
    "videoStatus" TEXT NOT NULL DEFAULT 'idle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionExport" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_userId_idx" ON "Promotion"("userId");

-- CreateIndex
CREATE INDEX "Promotion_brandKitId_idx" ON "Promotion"("brandKitId");

-- CreateIndex
CREATE INDEX "PromotionExport_promotionId_idx" ON "PromotionExport"("promotionId");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "BrandKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionExport" ADD CONSTRAINT "PromotionExport_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
