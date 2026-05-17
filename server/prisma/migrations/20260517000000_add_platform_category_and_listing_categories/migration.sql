-- CreateTable
CREATE TABLE "PlatformCategory" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "parentExternalId" TEXT,
    "name" TEXT NOT NULL,
    "isLeaf" BOOLEAN NOT NULL DEFAULT false,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformCategory_platform_externalId_key" ON "PlatformCategory"("platform", "externalId");

-- CreateIndex
CREATE INDEX "PlatformCategory_platform_parentExternalId_idx" ON "PlatformCategory"("platform", "parentExternalId");

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "platformCategories" JSONB;
