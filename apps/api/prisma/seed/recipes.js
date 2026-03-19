const { systemRecipes } = require("./data/system-recipes");
const { userRecipes } = require("./data/user-recipes");

async function upsertRecipe(prisma, recipe, ownership) {
  const existing = await prisma.baseRecipe.findFirst({
    where: {
      name: recipe.name,
      ownerUserId: ownership.ownerUserId ?? null,
      isSystemRecipe: ownership.isSystemRecipe,
    },
    select: { id: true },
  });

  const data = {
    ownerUserId: ownership.ownerUserId ?? null,
    isSystemRecipe: ownership.isSystemRecipe,
    name: recipe.name,
    cuisine: recipe.cuisine,
    description: recipe.description,
    servings: recipe.servings,
    tags: recipe.tags,
    ingredients: {
      deleteMany: existing ? {} : undefined,
      create: recipe.ingredients,
    },
    steps: {
      deleteMany: existing ? {} : undefined,
      create: recipe.steps,
    },
  };

  if (existing) {
    await prisma.baseRecipe.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.baseRecipe.create({ data });
}

async function seedRecipes(prisma, devUserId) {
  await prisma.baseRecipe.updateMany({
    where: {
      isSystemRecipe: true,
    },
    data: {
      ownerUserId: null,
    },
  });

  await prisma.baseRecipe.deleteMany({
    where: {
      ownerUserId: null,
      isSystemRecipe: false,
      name: {
        in: systemRecipes.map((recipe) => recipe.name),
      },
    },
  });

  for (const recipe of systemRecipes) {
    await upsertRecipe(prisma, recipe, {
      ownerUserId: null,
      isSystemRecipe: true,
    });
  }

  for (const recipe of userRecipes) {
    await upsertRecipe(prisma, recipe, {
      ownerUserId: devUserId,
      isSystemRecipe: false,
    });
  }
}

module.exports = {
  seedRecipes,
};
