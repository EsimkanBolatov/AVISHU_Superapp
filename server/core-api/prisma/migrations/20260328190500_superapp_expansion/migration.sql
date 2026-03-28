-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('standard', 'high', 'vip');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_status', 'order_action', 'staff_action', 'reward', 'crm');

-- CreateEnum
CREATE TYPE "ContentKind" AS ENUM ('journal', 'lookbook', 'campaign', 'collection_story');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('silver', 'gold', 'black');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'cancelled';
ALTER TYPE "OrderStatus" ADD VALUE 'return_requested';
ALTER TYPE "OrderStatus" ADD VALUE 'exchange_requested';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'support';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "exchangeRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "PriorityLevel" NOT NULL DEFAULT 'standard',
ADD COLUMN     "qcChecklist" TEXT,
ADD COLUMN     "returnRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slaHours" INTEGER NOT NULL DEFAULT 48;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandName" TEXT NOT NULL DEFAULT 'AVISHU',
ADD COLUMN     "careInstructions" TEXT NOT NULL DEFAULT 'Dry clean only.',
ADD COLUMN     "collectionName" TEXT NOT NULL DEFAULT 'Core',
ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "crossSellProductIds" TEXT[],
ADD COLUMN     "dropName" TEXT NOT NULL DEFAULT 'Drop 01',
ADD COLUMN     "editorialStory" TEXT NOT NULL DEFAULT 'Editorial story coming soon.',
ADD COLUMN     "fitProfile" TEXT NOT NULL DEFAULT 'relaxed',
ADD COLUMN     "limitedEdition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitedQuantity" INTEGER,
ADD COLUMN     "materials" TEXT[],
ADD COLUMN     "relatedProductIds" TEXT[],
ADD COLUMN     "seasonLabel" TEXT NOT NULL DEFAULT 'SS26',
ADD COLUMN     "sizeGuide" TEXT NOT NULL DEFAULT 'Choose your regular size for a relaxed fit.';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "colorLabel" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyTier" "LoyaltyTier" NOT NULL DEFAULT 'silver',
ADD COLUMN     "segment" TEXT NOT NULL DEFAULT 'new_client';

-- CreateTable
CREATE TABLE "ProductFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPaymentCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPaymentCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "tier" "LoyaltyTier" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentEntry" (
    "id" TEXT NOT NULL,
    "kind" "ContentKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAuditLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorRole" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTag" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "roleTarget" "Role",
    "orderId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFavorite_userId_createdAt_idx" ON "ProductFavorite"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFavorite_userId_productId_key" ON "ProductFavorite"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProductView_userId_createdAt_idx" ON "ProductView"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductView_productId_createdAt_idx" ON "ProductView"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedAddress_userId_isDefault_idx" ON "SavedAddress"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "SavedPaymentCard_userId_isDefault_idx" ON "SavedPaymentCard"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentEntry_kind_locale_publishedAt_idx" ON "ContentEntry"("kind", "locale", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentEntry_slug_locale_key" ON "ContentEntry"("slug", "locale");

-- CreateIndex
CREATE INDEX "OrderAuditLog_orderId_createdAt_idx" ON "OrderAuditLog"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderTag_orderId_createdAt_idx" ON "OrderTag"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_roleTarget_createdAt_idx" ON "Notification"("roleTarget", "createdAt");

-- CreateIndex
CREATE INDEX "Order_priority_dueAt_idx" ON "Order"("priority", "dueAt");

-- CreateIndex
CREATE INDEX "Product_brandName_idx" ON "Product"("brandName");

-- CreateIndex
CREATE INDEX "Product_collectionName_idx" ON "Product"("collectionName");

-- CreateIndex
CREATE INDEX "Product_seasonLabel_idx" ON "Product"("seasonLabel");

-- CreateIndex
CREATE INDEX "User_segment_idx" ON "User"("segment");

-- AddForeignKey
ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPaymentCard" ADD CONSTRAINT "SavedPaymentCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAuditLog" ADD CONSTRAINT "OrderAuditLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAuditLog" ADD CONSTRAINT "OrderAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTag" ADD CONSTRAINT "OrderTag_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
