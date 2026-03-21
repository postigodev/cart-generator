CREATE TYPE "TagKind" AS ENUM ('general', 'dietary_badge');

ALTER TABLE "Tag"
ADD COLUMN "kind" "TagKind" NOT NULL DEFAULT 'general';

CREATE INDEX "Tag_scope_kind_name_idx" ON "Tag"("scope", "kind", "name");
