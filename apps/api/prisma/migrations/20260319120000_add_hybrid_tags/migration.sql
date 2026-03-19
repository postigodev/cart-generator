-- CreateEnum
CREATE TYPE "TagScope" AS ENUM ('system', 'user');

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "scope" "TagScope" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTag" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "RecipeTag_pkey" PRIMARY KEY ("recipeId", "tagId")
);

-- CreateIndex
CREATE INDEX "Tag_scope_name_idx" ON "Tag"("scope", "name");

-- CreateIndex
CREATE INDEX "Tag_scope_slug_idx" ON "Tag"("scope", "slug");

-- CreateIndex
CREATE INDEX "Tag_ownerUserId_scope_slug_idx" ON "Tag"("ownerUserId", "scope", "slug");

-- Enforce one system tag per slug.
CREATE UNIQUE INDEX "Tag_system_slug_key"
ON "Tag"("slug")
WHERE "scope" = 'system' AND "ownerUserId" IS NULL;

-- Enforce one user tag per owner and slug.
CREATE UNIQUE INDEX "Tag_user_owner_slug_key"
ON "Tag"("ownerUserId", "slug")
WHERE "scope" = 'user' AND "ownerUserId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "RecipeTag_tagId_idx" ON "RecipeTag"("tagId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTag" ADD CONSTRAINT "RecipeTag_recipeId_fkey"
FOREIGN KEY ("recipeId") REFERENCES "BaseRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTag" ADD CONSTRAINT "RecipeTag_tagId_fkey"
FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill system tags from existing BaseRecipe.tags values.
WITH system_tag_rows AS (
    SELECT DISTINCT
        raw_tag AS "name",
        regexp_replace(
            regexp_replace(lower(trim(raw_tag)), '[^a-z0-9]+', '-', 'g'),
            '(^-|-$)',
            '',
            'g'
        ) AS "slug"
    FROM "BaseRecipe" br,
    LATERAL unnest(br."tags") AS raw_tag
    WHERE br."isSystemRecipe" = true
      AND trim(raw_tag) <> ''
)
INSERT INTO "Tag" (
    "id",
    "ownerUserId",
    "name",
    "slug",
    "scope",
    "createdAt",
    "updatedAt"
)
SELECT
    'tag_sys_' || substr(md5("slug"), 1, 20),
    NULL,
    "name",
    "slug",
    'system'::"TagScope",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM system_tag_rows;

-- Backfill user tags only when there is no equivalent system tag.
WITH user_tag_rows AS (
    SELECT DISTINCT
        br."ownerUserId",
        raw_tag AS "name",
        regexp_replace(
            regexp_replace(lower(trim(raw_tag)), '[^a-z0-9]+', '-', 'g'),
            '(^-|-$)',
            '',
            'g'
        ) AS "slug"
    FROM "BaseRecipe" br,
    LATERAL unnest(br."tags") AS raw_tag
    WHERE br."isSystemRecipe" = false
      AND br."ownerUserId" IS NOT NULL
      AND trim(raw_tag) <> ''
),
missing_user_tags AS (
    SELECT utr.*
    FROM user_tag_rows utr
    LEFT JOIN "Tag" system_tag
      ON system_tag."scope" = 'system'
     AND system_tag."slug" = utr."slug"
    WHERE system_tag."id" IS NULL
)
INSERT INTO "Tag" (
    "id",
    "ownerUserId",
    "name",
    "slug",
    "scope",
    "createdAt",
    "updatedAt"
)
SELECT
    'tag_usr_' || substr(md5("ownerUserId" || ':' || "slug"), 1, 20),
    "ownerUserId",
    "name",
    "slug",
    'user'::"TagScope",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM missing_user_tags;

-- Link system recipes to system tags.
WITH system_recipe_tags AS (
    SELECT
        br."id" AS "recipeId",
        regexp_replace(
            regexp_replace(lower(trim(raw_tag)), '[^a-z0-9]+', '-', 'g'),
            '(^-|-$)',
            '',
            'g'
        ) AS "slug"
    FROM "BaseRecipe" br,
    LATERAL unnest(br."tags") AS raw_tag
    WHERE br."isSystemRecipe" = true
      AND trim(raw_tag) <> ''
)
INSERT INTO "RecipeTag" ("recipeId", "tagId")
SELECT DISTINCT
    srt."recipeId",
    tag."id"
FROM system_recipe_tags srt
JOIN "Tag" tag
  ON tag."scope" = 'system'
 AND tag."slug" = srt."slug";

-- Link user recipes to either a shared system tag or the owner's private tag.
WITH user_recipe_tags AS (
    SELECT
        br."id" AS "recipeId",
        br."ownerUserId",
        regexp_replace(
            regexp_replace(lower(trim(raw_tag)), '[^a-z0-9]+', '-', 'g'),
            '(^-|-$)',
            '',
            'g'
        ) AS "slug"
    FROM "BaseRecipe" br,
    LATERAL unnest(br."tags") AS raw_tag
    WHERE br."isSystemRecipe" = false
      AND br."ownerUserId" IS NOT NULL
      AND trim(raw_tag) <> ''
)
INSERT INTO "RecipeTag" ("recipeId", "tagId")
SELECT DISTINCT
    urt."recipeId",
    COALESCE(system_tag."id", user_tag."id")
FROM user_recipe_tags urt
LEFT JOIN "Tag" system_tag
  ON system_tag."scope" = 'system'
 AND system_tag."slug" = urt."slug"
LEFT JOIN "Tag" user_tag
  ON user_tag."scope" = 'user'
 AND user_tag."ownerUserId" = urt."ownerUserId"
 AND user_tag."slug" = urt."slug"
WHERE COALESCE(system_tag."id", user_tag."id") IS NOT NULL;

-- Drop the legacy array column after backfill to avoid dual sources of truth.
ALTER TABLE "BaseRecipe" DROP COLUMN "tags";
