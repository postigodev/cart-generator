import type {
  BaseRecipe,
  Cart,
  CartSelection,
  ShoppingCartHistorySummary,
  User,
} from "@cart/shared";
import { logoutAction } from "./actions";
import {
  fetchAuthedCollection,
  fetchAuthedResource,
  fetchCollection,
} from "@/lib/api";

type DashboardCartDraft = {
  id: string;
  user_id?: string;
  name?: string;
  selections: CartSelection[];
  retailer: string;
  created_at: string;
  updated_at: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
        ok
          ? "border-emerald-900/15 bg-emerald-950/8 text-emerald-950"
          : "border-[color:var(--clay)]/20 bg-[color:var(--clay)]/10 text-[color:var(--clay)]"
      }`}
    >
      {label}
    </span>
  );
}

function SectionShell(props: {
  title: string;
  eyebrow: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--line)] bg-white/60 p-6 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--olive)]">
            {props.eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-none text-[color:var(--forest-strong)]">
            {props.title}
          </h2>
        </div>
        <p className="max-w-xs text-right text-sm text-[color:var(--ink-soft)]">
          {props.note}
        </p>
      </div>
      {props.children}
    </section>
  );
}

export default async function Home() {
  const recipesPromise = fetchCollection<BaseRecipe>("/recipes");
  const mePromise = fetchAuthedResource<User>("/me");
  const draftsPromise =
    fetchAuthedCollection<DashboardCartDraft>("/cart-drafts");
  const cartsPromise = fetchAuthedCollection<Cart>("/carts");
  const shoppingHistoryPromise =
    fetchAuthedCollection<ShoppingCartHistorySummary>(
      "/shopping-carts/history",
    );

  const [recipes, me, drafts, carts, shoppingHistory] = await Promise.all([
    recipesPromise,
    mePromise,
    draftsPromise,
    cartsPromise,
    shoppingHistoryPromise,
  ]);

  const totalSelections = drafts.data.reduce(
    (sum, draft) => sum + draft.selections.length,
    0,
  );

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--forest)] px-6 py-8 text-[color:var(--paper)] shadow-[var(--shadow)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,240,228,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(161,77,49,0.28),transparent_30%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[color:var(--paper-strong)]/80">
                Internal v1 Control Room
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] sm:text-6xl">
                Recipes become meal-plan carts. Carts become shopping carts.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--paper-strong)]/82 sm:text-lg">
                The web app now authenticates against the live{" "}
                <code>/api/v1</code> contract using bearer tokens stored in
                HTTP-only cookies. Public recipes stay readable, while drafts,
                carts, and shopping-cart history now load through the real auth
                path.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--paper-strong)]/72">
                  Signed in
                </div>
                <div className="mt-2 text-lg font-semibold text-[color:var(--paper)]">
                  {me.data?.name ?? "Unknown user"}
                </div>
                <div className="mt-1 text-sm text-[color:var(--paper-strong)]/78">
                  {me.data?.email ?? "Missing profile"}
                </div>
                <form action={logoutAction} className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--paper)] transition hover:bg-white/16"
                  >
                    Sign out
                  </button>
                </form>
              </div>

              {[
                {
                  label: "Visible recipes",
                  value: recipes.data.length,
                  tone: "text-[color:var(--paper)]",
                },
                {
                  label: "Draft selections",
                  value: totalSelections,
                  tone: "text-[color:var(--paper)]",
                },
                {
                  label: "Persisted carts",
                  value: carts.data.length,
                  tone: "text-[color:var(--paper)]",
                },
                {
                  label: "Shopping carts",
                  value: shoppingHistory.data.length,
                  tone: "text-[color:var(--paper)]",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.5rem] border border-white/12 bg-white/8 p-4 backdrop-blur-sm"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--paper-strong)]/72">
                    {metric.label}
                  </div>
                  <div className={`mt-2 text-4xl font-semibold ${metric.tone}`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

          <SectionShell
            eyebrow="Authenticated read"
            title="Drafts and Carts"
            note="These internal resources now resolve through the authenticated session instead of the temporary dev actor header."
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusPill ok={drafts.ok} label="Drafts" />
              <StatusPill ok={carts.ok} label="Carts" />
            </div>

            <div className="grid gap-3">
              {drafts.data.slice(0, 3).map((draft) => (
                <article
                  key={draft.id}
                  className="rounded-[1.35rem] border border-[color:var(--line)] bg-white/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--forest-strong)]">
                        {draft.name ?? "Untitled draft"}
                      </h3>
                      <p className="text-sm text-[color:var(--ink-soft)]">
                        {draft.selections.length} selections / {draft.retailer}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--olive)]">
                      {formatDate(draft.updated_at)}
                    </span>
                  </div>
                </article>
              ))}

              {carts.data.slice(0, 3).map((cart) => (
                <article
                  key={cart.id}
                  className="rounded-[1.35rem] border border-[color:var(--line)] bg-[color:var(--paper)]/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--forest-strong)]">
                        {cart.name ?? "Unnamed cart"}
                      </h3>
                      <p className="text-sm text-[color:var(--ink-soft)]">
                        {cart.selections.length} selections / {cart.dishes.length} dishes
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--olive)]">
                      {formatDate(cart.updated_at ?? new Date().toISOString())}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </SectionShell>
        </section>

        <SectionShell
          eyebrow="Retail layer"
          title="Shopping Cart History"
          note="These snapshots sit on the retailer-facing side of the new model. Matching stays deterministic today and can swap from mock data to Walmart behind this boundary."
        >
          <div className="mb-4 flex items-center justify-between">
            <StatusPill
              ok={shoppingHistory.ok}
              label={shoppingHistory.ok ? "History ready" : "History issue"}
            />
            {!shoppingHistory.ok && shoppingHistory.error ? (
              <span className="text-sm text-[color:var(--clay)]">
                {shoppingHistory.error}
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {shoppingHistory.data.slice(0, 6).map((shoppingCart) => (
              <article
                key={shoppingCart.id}
                className="rounded-[1.5rem] border border-[color:var(--line)] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(239,229,210,0.76))] p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--olive)]">
                  {shoppingCart.retailer}
                </p>
                <h3 className="mt-2 font-display text-3xl text-[color:var(--forest-strong)]">
                  {formatMoney(shoppingCart.estimated_subtotal)}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                  Cart {shoppingCart.cart_id}
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <div className="space-y-1 text-sm text-[color:var(--ink-soft)]">
                    <div>{shoppingCart.overview_count} overview items</div>
                    <div>{shoppingCart.matched_item_count} matched items</div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--olive)]">
                    {formatDate(shoppingCart.updated_at)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>
    </main>
  );
}
