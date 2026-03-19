import { RecipeRepository } from './recipe.repository';
import { UserContextService } from '../user/user-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecipeRepository visibility', () => {
  let repository: RecipeRepository;
  let prisma: {
    baseRecipe: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let userContextService: {
    resolveActorUser: jest.Mock;
    resolveOptionalActorUser: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      baseRecipe: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    userContextService = {
      resolveActorUser: jest.fn(),
      resolveOptionalActorUser: jest.fn(),
    };

    repository = new RecipeRepository(
      prisma as unknown as PrismaService,
      userContextService as unknown as UserContextService,
    );
  });

  it('lists system and owned recipes for user A', async () => {
    userContextService.resolveOptionalActorUser.mockResolvedValue({ id: 'user-a' });

    await repository.findMany('user-a');

    expect(prisma.baseRecipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ isSystemRecipe: true }, { ownerUserId: 'user-a' }],
        },
      }),
    );
  });

  it('lists system and owned recipes for user B', async () => {
    userContextService.resolveOptionalActorUser.mockResolvedValue({ id: 'user-b' });

    await repository.findMany('user-b');

    expect(prisma.baseRecipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ isSystemRecipe: true }, { ownerUserId: 'user-b' }],
        },
      }),
    );
  });

  it('lists system and owned recipes for admin', async () => {
    userContextService.resolveOptionalActorUser.mockResolvedValue({ id: 'admin-1' });

    await repository.findMany('admin-1');

    expect(prisma.baseRecipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ isSystemRecipe: true }, { ownerUserId: 'admin-1' }],
        },
      }),
    );
  });

  it('lists only global system recipes for unauthenticated access', async () => {
    userContextService.resolveOptionalActorUser.mockResolvedValue(null);

    await repository.findMany();

    expect(prisma.baseRecipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isSystemRecipe: true,
          ownerUserId: null,
        },
      }),
    );
  });

  it('finds a recipe by id with the same visibility rules for unauthenticated access', async () => {
    userContextService.resolveOptionalActorUser.mockResolvedValue(null);

    await repository.findById('recipe-1');

    expect(prisma.baseRecipe.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'recipe-1',
          isSystemRecipe: true,
          ownerUserId: null,
        },
      }),
    );
  });
});
