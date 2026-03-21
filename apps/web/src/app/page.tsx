import type {
  BaseRecipe,
  Cart,
  User,
  UserStats,
  ShoppingCartHistorySummary,
} from "@cart/shared";
import { redirect } from "next/navigation";
import { logoutAction } from "./actions";
import {
  fetchAuthedCollection,
  fetchAuthedResource,
  fetchCollection,
} from "@/lib/api";
import { DashboardActionPanel } from "@/components/dashboard/dashboard-action-panel";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { DashboardCartDraft } from "@/components/dashboard/drafts-and-carts-section";
import {
  buildPlanningItems,
  RecentWorkSection,
} from "@/components/dashboard/recent-work-section";

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

export default async function Home() {
  const recipesPromise = fetchCollection<BaseRecipe>("/recipes");
  const mePromise = fetchAuthedResource<User>("/me");
  const statsPromise = fetchAuthedResource<UserStats>("/me/stats");
  const draftsPromise =
    fetchAuthedCollection<DashboardCartDraft>("/cart-drafts");
  const cartsPromise = fetchAuthedCollection<Cart>("/carts");
  const shoppingHistoryPromise =
    fetchAuthedCollection<ShoppingCartHistorySummary>(
      "/shopping-carts/history",
    );

  const [recipes, me, stats, drafts, carts, shoppingHistory] = await Promise.all([
    recipesPromise,
    mePromise,
    statsPromise,
    draftsPromise,
    cartsPromise,
    shoppingHistoryPromise,
  ]);

  if (!me.data) {
    redirect("/login");
  }

  if (!me.data.onboarding_completed_at) {
    redirect("/onboarding");
  }

  const latestDraft = drafts.data
    .toSorted(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
    )[0];
  const latestCart = carts.data
    .toSorted(
      (left, right) =>
        new Date(
          right.updated_at ?? right.created_at ?? new Date().toISOString(),
        ).getTime() -
        new Date(
          left.updated_at ?? left.created_at ?? new Date().toISOString(),
        ).getTime(),
    )[0];
  const planningItems = buildPlanningItems(drafts.data, carts.data);
  const latestPlanningItem =
    latestDraft &&
    (!latestCart ||
      new Date(latestDraft.updated_at).getTime() >=
        new Date(
          latestCart.updated_at ?? latestCart.created_at ?? new Date().toISOString(),
        ).getTime())
      ? {
          kind: "draft" as const,
          title: latestDraft.name ?? "Untitled draft",
          updatedAtLabel: formatDate(latestDraft.updated_at),
          selectionsCount: latestDraft.selections.length,
          retailer: latestDraft.retailer,
        }
      : latestCart
        ? {
            kind: "cart" as const,
            title: latestCart.name ?? "Unnamed cart",
            updatedAtLabel: formatDate(
              latestCart.updated_at ??
                latestCart.created_at ??
                new Date().toISOString(),
            ),
            selectionsCount: latestCart.selections.length,
            dishesCount: latestCart.dishes.length,
          }
        : null;
  const latestShopping = shoppingHistory.data
    .toSorted(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
    )[0];
  const safeStats =
    stats.data ?? {
      owned_recipe_count: 0,
      cart_draft_count: 0,
      cart_count: 0,
      shopping_cart_count: 0,
      preferred_cuisine_count: 0,
      preferred_tag_count: 0,
    };

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHeader
          user={me.data}
          logoutAction={logoutAction}
        />

        <DashboardActionPanel
          activePlanningState={latestPlanningItem}
          latestShoppingLabel={
            latestShopping
              ? `${latestShopping.retailer} · ${formatDate(latestShopping.updated_at)}`
              : undefined
          }
          latestShoppingSubtotal={
            latestShopping
              ? formatMoney(latestShopping.estimated_subtotal)
              : undefined
          }
          preferredCuisineCount={safeStats.preferred_cuisine_count}
          preferredTagCount={safeStats.preferred_tag_count}
        />

        <section className="grid gap-6">
          <RecentWorkSection
            planningItems={planningItems}
            recipes={recipes.data
              .toSorted(
                (left, right) =>
                  new Date(right.updated_at).getTime() -
                  new Date(left.updated_at).getTime(),
              )
              .slice(0, 4)}
            stats={safeStats}
            formatDate={formatDate}
          />
        </section>
      </div>
    </main>
  );
}
