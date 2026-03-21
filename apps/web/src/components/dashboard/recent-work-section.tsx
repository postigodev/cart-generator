"use client";

import { useState } from "react";
import Link from "next/link";
import type { BaseRecipe } from "@cart/shared";
import type { PlanningItem } from "./recent-work.utils";

function TypeBadge(props: { kind: PlanningItem["kind"] }) {
  const tone =
    props.kind === "draft"
      ? "border-[color:var(--olive)]/20 bg-[color:var(--olive)]/10 text-[color:var(--forest-strong)]"
      : "border-[color:var(--clay)]/18 bg-[color:var(--clay)]/10 text-[color:var(--clay)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone}`}
    >
      {props.kind}
    </span>
  );
}

export function RecentWorkSection(props: {
  planningItems: PlanningItem[];
  recipes: BaseRecipe[];
}) {
  const [query, setQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));

  const tagMap = new Map<string, string>();
  for (const recipe of props.recipes) {
    for (const tag of recipe.tags) {
      tagMap.set(tag.id, tag.name);
    }
  }

  const availableTags = Array.from(tagMap.entries())
    .map(([id, name]) => ({ id, name }))
    .toSorted((left, right) => left.name.localeCompare(right.name));

  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 8);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = props.recipes.filter((recipe) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      recipe.name.toLowerCase().includes(normalizedQuery) ||
      recipe.description?.toLowerCase().includes(normalizedQuery) ||
      recipe.cuisine.label.toLowerCase().includes(normalizedQuery) ||
      recipe.tags.some((tag) => tag.name.toLowerCase().includes(normalizedQuery));
    const matchesTag =
      selectedTag === null || recipe.tags.some((tag) => tag.id === selectedTag);

    return matchesQuery && matchesTag;
  });

  return (
    <section className="rounded-[2rem] border border-[color:var(--line)] bg-white/60 p-6 shadow-[var(--shadow)] backdrop-blur-sm">
      <div id="recent-work" className="grid gap-8">
        <div>
          {props.planningItems.length > 0 ? (
            <div className="grid gap-3">
              {props.planningItems.map((item) => (
                <article
                  key={`${item.kind}-${item.id}`}
                  className="rounded-[1.45rem] border border-[color:var(--line)] bg-[color:var(--paper)]/68 px-4 py-4 transition hover:border-[color:var(--olive)]/26 hover:bg-[color:var(--paper)]/82"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <TypeBadge kind={item.kind} />
                      <h3 className="mt-3 truncate text-lg font-semibold text-[color:var(--forest-strong)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 pt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--olive)]">
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.55rem] border border-dashed border-[color:var(--line)] bg-[color:var(--paper)]/52 px-5 py-6">
              <div className="text-lg font-semibold text-[color:var(--forest-strong)]">
                Start a new draft
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--ink-soft)]">
                Pick a dish from the shelf below and use it to kick off the next
                planning run.
              </p>
              <div className="mt-4">
                <Link
                  href="#recipe-library"
                  className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--forest)] px-4 text-sm font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--forest-strong)]"
                >
                  New draft
                </Link>
              </div>
            </div>
          )}
        </div>

        <div id="recipe-library" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl leading-none text-[color:var(--forest-strong)]">
              Recipe shelf
            </h2>
            <label className="w-full max-w-sm sm:w-auto sm:min-w-[19rem]">
              <span className="sr-only">Search recipes</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dishes"
                className="min-h-11 w-full rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]/82 px-4 text-sm text-[color:var(--forest-strong)] outline-none transition placeholder:text-[color:var(--ink-soft)]/72 focus:border-[color:var(--olive)] focus:bg-white"
              />
            </label>
          </div>

          {availableTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                  selectedTag === null
                    ? "border-[color:var(--forest)] bg-[color:var(--forest)] text-[color:var(--paper)]"
                    : "border-[color:var(--line)] bg-[color:var(--paper)]/72 text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)]"
                }`}
              >
                All tags
              </button>
              {visibleTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTag((current) =>
                      current === tag.id ? null : tag.id,
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    selectedTag === tag.id
                      ? "border-[color:var(--olive)] bg-[color:var(--olive)]/14 text-[color:var(--forest-strong)]"
                      : "border-[color:var(--line)] bg-[color:var(--paper)]/72 text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)]"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {availableTags.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAllTags((current) => !current)}
                  className="rounded-full border border-[color:var(--line)] bg-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--olive)] transition hover:bg-[color:var(--paper)]/62"
                >
                  {showAllTags ? "Show less" : "Show all"}
                </button>
              ) : null}
            </div>
          ) : null}

          {filteredRecipes.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="flex min-h-[16.5rem] flex-col overflow-hidden rounded-[1.45rem] border border-[color:var(--line)] bg-white/42"
                >
                  {recipe.cover_image_url ? (
                    <div className="relative h-28 overflow-hidden border-b border-[color:var(--line)] bg-[color:var(--paper)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={recipe.cover_image_url}
                        alt={recipe.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,35,29,0.02),rgba(24,35,29,0.18))]" />
                    </div>
                  ) : (
                    <div className="relative h-28 overflow-hidden border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(115,135,101,0.12),rgba(245,240,228,0.4)),radial-gradient(circle_at_top_left,rgba(161,77,49,0.12),transparent_34%)]">
                      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(24,35,29,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(24,35,29,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
                      <div className="relative flex h-full flex-col justify-end p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--olive)]">
                          {recipe.cuisine.label}
                        </div>
                        <div className="mt-1 max-w-[10rem] font-display text-[1.4rem] leading-[0.92] text-[color:var(--forest-strong)]">
                          {recipe.name}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--olive)]">
                          {recipe.cuisine.label}
                        </div>
                        <div className="mt-1 text-xs text-[color:var(--ink-soft)]">
                          {recipe.servings} servings
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled
                          className="inline-flex min-h-8 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]/72 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-soft)] opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled
                          className="inline-flex min-h-8 items-center rounded-full border border-[color:var(--clay)]/14 bg-[color:var(--clay)]/7 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--clay)] opacity-70"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 min-w-0">
                      <h3 className="line-clamp-2 font-display text-[1.45rem] leading-[0.96] text-[color:var(--forest-strong)]">
                        {recipe.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-5 text-[color:var(--ink-soft)]">
                        {recipe.description?.trim() ||
                          "No description yet. This recipe is ready for planning, but still needs a short summary."}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.tags.length > 0 ? (
                          recipe.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-[color:var(--olive)]/18 bg-[color:var(--olive)]/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--forest-strong)]"
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
                            No tags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.45rem] border border-dashed border-[color:var(--line)] bg-[color:var(--paper)]/48 px-4 py-5 text-sm leading-6 text-[color:var(--ink-soft)]">
              No recipes match this search yet. Try another tag or query.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
