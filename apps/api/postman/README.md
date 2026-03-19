# Postman

Import these files into Postman:

- [cart-generator-api.postman_collection.json](/C:/Users/akuma/repos/cart-generator/apps/api/postman/cart-generator-api.postman_collection.json)
- [cart-generator-local.postman_environment.json](/C:/Users/akuma/repos/cart-generator/apps/api/postman/cart-generator-local.postman_environment.json)

Suggested order:

1. `Auth / Register`
2. `Auth / Login`
3. `Catalog / List Cuisines`
4. `Catalog / List Tags (public)`
5. `Me / Put Me Preferences`
6. `Recipes / List Recipes (public)`
7. `Recipes / Create Recipe`
8. `Tags / Create User Tag`
9. `Carts / Create Cart`
10. `Carts / Create Shopping Cart From Cart`
11. `Negative / ...`

The collection uses these variables:

- `baseUrl`
- `requestId`
- `authEmail`
- `authPassword`
- `accessToken`
- `refreshToken`
- `cuisineId`
- `secondCuisineId`
- `systemTagId`
- `secondSystemTagId`
- `userTagId`
- `systemRecipeId`
- `recipeId`
- `cartId`
- `shoppingCartId`

Tests inside the requests update tokens and ids automatically when responses include them.

Notes:

- the collection targets the current `/api/v1` contract
- authenticated requests use `Authorization: Bearer {{accessToken}}`
- `Negative / Put Preferences With User Tag -> 403` assumes `Tags / Create User Tag` has already run
