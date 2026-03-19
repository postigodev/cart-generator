-- CreateTable
CREATE TABLE "CartDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "selections" JSONB NOT NULL,
    "retailer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedCart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cartDraftId" TEXT,
    "retailer" TEXT NOT NULL,
    "dishes" JSONB NOT NULL,
    "overview" JSONB NOT NULL,
    "matchedItems" JSONB NOT NULL,
    "estimatedSubtotal" DOUBLE PRECISION NOT NULL,
    "estimatedTotal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartDraft_userId_createdAt_idx" ON "CartDraft"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedCart_userId_createdAt_idx" ON "GeneratedCart"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedCart_cartDraftId_idx" ON "GeneratedCart"("cartDraftId");

-- AddForeignKey
ALTER TABLE "CartDraft" ADD CONSTRAINT "CartDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedCart" ADD CONSTRAINT "GeneratedCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedCart" ADD CONSTRAINT "GeneratedCart_cartDraftId_fkey" FOREIGN KEY ("cartDraftId") REFERENCES "CartDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
