import type { BaseRecipe } from "@cart/shared";
import type { Loadable } from "@/lib/api";
import { SectionShell } from "./section-shell";
import { StatusPill } from "./status-pill";

export function RecipesSection(props: { recipes: Loadable<BaseRecipe[]> }) {
  const { recipes } = props;

  return (
    <SectionShell
      eyebrow="Public read"
      title="Recipes"
      note="These calls remain public and expose the visible recipe catalog without requiring user context in the web app."
    >
      <div className="mb-4 flex items-center justify-between">
        <StatusPill ok={recipes.ok} label={recipes.ok ? "Connected" : "Issue"} />
        {!recipes.ok && recipes.error ? (
          <span className="text-sm text-[color:var(--clay)]">
            {recipes.error}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {recipes.data.slice(0, 6).map((recipe) => (
          <article
            key={recipe.id}
            className="rounded-[1.4rem] border border-[color:var(--line)] bg-[color:var(--paper)]/65 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl text-[color:var(--forest-strong)]">
                  {recipe.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  {recipe.cuisine.label} / {recipe.servings} servings
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--forest)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--paper)]">
                {recipe.is_system_recipe ? "system" : "user"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-[color:var(--line)] px-2.5 py-1 text-xs text-[color:var(--ink-soft)]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
