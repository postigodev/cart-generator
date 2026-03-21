import type { BaseRecipe, Cart, UserStats } from "@cart/shared";
import { SectionShell } from "./section-shell";
import type { DashboardCartDraft } from "./drafts-and-carts-section";

type PlanningItem =
  | {
      id: string;
      kind: "draft";
      title: string;
      subtitle: string;
      updatedAt: string;
    }
  | {
      id: string;
      kind: "cart";
      title: string;
      subtitle: string;
      updatedAt: string;
    };

function TypeBadge(props: { kind: PlanningItem["kind"] }) {
  const tone =
    props.kind === "draft"
      ? "border-[color:var(--olive)]/20 bg-[color:var(--olive)]/10 text-[color:var(--forest-strong)]"
      : "border-[color:var(--clay)]/18 bg-[color:var(--clay)]/10 text-[color:var(--clay)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone}`}
    >
      {props.kind}
    </span>
  );
}

export function RecentWorkSection(props: {
  planningItems: PlanningItem[];
  recipes: BaseRecipe[];
  stats: UserStats;
  formatDate: (iso: string) => string;
}) {
  const statItems = [
    {
      label: "Owned recipes",
      value: props.stats.owned_recipe_count,
    },
    {
      label: "Drafts + carts",
      value: props.stats.cart_draft_count + props.stats.cart_count,
    },
    {
      label: "Shopping carts",
      value: props.stats.shopping_cart_count,
    },
    {
      label: "Preference picks",
      value:
        props.stats.preferred_cuisine_count + props.stats.preferred_tag_count,
    },
  ];

  return (
    <SectionShell
      title="Recent work"
      eyebrow="Resume-able"
      note=""
    >
      <div id="recent-work" className="grid gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--forest-strong)]">
              Planning queue
            </h3>
            <span className="mt-1 inline-block text-xs uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
              drafts and carts
            </span>
          </div>

          <div className="w-full max-w-xl rounded-[1.25rem] border border-[color:var(--line)] bg-[color:var(--paper)]/72 px-4 py-3 sm:w-auto sm:min-w-[30rem]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statItems.map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--olive)]">
                    {item.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[color:var(--forest-strong)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {props.planningItems.length > 0 ? (
            <div className="grid gap-3">
              {props.planningItems.map((item) => (
                <article
                  key={`${item.kind}-${item.id}`}
                  className="rounded-[1.45rem] border border-[color:var(--line)] bg-[color:var(--paper)]/76 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <TypeBadge kind={item.kind} />
                      <h4 className="mt-3 truncate text-lg font-semibold text-[color:var(--forest-strong)]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 pt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--olive)]">
                      {props.formatDate(item.updatedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.45rem] border border-dashed border-[color:var(--line)] bg-white/46 px-4 py-5 text-sm leading-6 text-[color:var(--ink-soft)]">
              Nothing is in progress yet. The next planning run will show up
              here as soon as you build a draft or persist a cart.
            </div>
          )}
        </div>

        <div id="recipe-library">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-[color:var(--forest-strong)]">
              Recipe shelf
            </h3>
            <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
              recent visible recipes
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {props.recipes.map((recipe) => (
              <article
                key={recipe.id}
                className="flex min-h-[18rem] flex-col rounded-[1.55rem] border border-[color:var(--line)] bg-white/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--olive)]">
                      {recipe.cuisine.label}
                    </div>
                    <div className="mt-2 text-sm text-[color:var(--ink-soft)]">
                      {recipe.servings} servings
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-9 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]/72 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)] opacity-70"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-9 items-center rounded-full border border-[color:var(--clay)]/14 bg-[color:var(--clay)]/7 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--clay)] opacity-70"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-6 min-w-0">
                  <h4 className="line-clamp-2 font-display text-[2rem] leading-[0.95] text-[color:var(--forest-strong)]">
                    {recipe.name}
                  </h4>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                    {recipe.description?.trim() ||
                      "No description yet. This recipe is ready for planning, but still needs a short summary."}
                  </p>
                </div>

                <div className="mt-auto grid gap-4 pt-6">
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.length > 0 ? (
                      recipe.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full border border-[color:var(--olive)]/18 bg-[color:var(--olive)]/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--forest-strong)]"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-soft)]">
                        No tags
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                    <span
                      className={`rounded-full border px-3 py-1 ${
                        recipe.is_system_recipe
                          ? "border-[color:var(--line)] bg-[color:var(--paper)]/70 text-[color:var(--ink-soft)]"
                          : "border-[color:var(--olive)]/18 bg-[color:var(--olive)]/8 text-[color:var(--forest-strong)]"
                      }`}
                    >
                      {recipe.is_system_recipe ? "System" : "Mine"}
                    </span>
                    <span className="text-[color:var(--olive)]">
                      {props.formatDate(recipe.updated_at)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function buildPlanningItems(
  drafts: DashboardCartDraft[],
  carts: Cart[],
): PlanningItem[] {
  const normalizedDrafts: PlanningItem[] = drafts.map((draft) => ({
    id: draft.id,
    kind: "draft",
    title: draft.name ?? "Untitled draft",
    subtitle: `${draft.selections.length} selections · ${draft.retailer}`,
    updatedAt: draft.updated_at,
  }));

  const normalizedCarts: PlanningItem[] = carts.map((cart) => ({
    id: cart.id ?? `cart-${cart.updated_at ?? cart.created_at ?? "unknown"}`,
    kind: "cart",
    title: cart.name ?? "Unnamed cart",
    subtitle: `${cart.selections.length} selections · ${cart.dishes.length} dishes`,
    updatedAt: cart.updated_at ?? cart.created_at ?? new Date().toISOString(),
  }));

  return [...normalizedDrafts, ...normalizedCarts]
    .toSorted(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, 6);
}
