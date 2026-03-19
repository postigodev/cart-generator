CREATE TABLE "UserPreferredCuisine" (
    "userId" TEXT NOT NULL,
    "cuisineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreferredCuisine_pkey" PRIMARY KEY ("userId","cuisineId")
);

CREATE TABLE "UserPreferredTag" (
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreferredTag_pkey" PRIMARY KEY ("userId","tagId")
);

CREATE INDEX "UserPreferredCuisine_cuisineId_idx" ON "UserPreferredCuisine"("cuisineId");
CREATE INDEX "UserPreferredTag_tagId_idx" ON "UserPreferredTag"("tagId");

ALTER TABLE "UserPreferredCuisine"
ADD CONSTRAINT "UserPreferredCuisine_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPreferredCuisine"
ADD CONSTRAINT "UserPreferredCuisine_cuisineId_fkey"
FOREIGN KEY ("cuisineId") REFERENCES "Cuisine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPreferredTag"
ADD CONSTRAINT "UserPreferredTag_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPreferredTag"
ADD CONSTRAINT "UserPreferredTag_tagId_fkey"
FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
