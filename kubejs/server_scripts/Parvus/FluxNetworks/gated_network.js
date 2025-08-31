// priority: 0
// requires: mekanism
// requires: pipez
// @ts-check
// Flux networks is very powerful. Let's gate it.

ServerEvents.recipes(event => {

    /**
     * Returns the variant item ID for the given item if it is a valid ingredient,
     * otherwise returns the original item.
     *
     * @param {string} item - The item identifier to check for a variant.
     * @returns {string} The variant item ID if valid, or the original item.
     */
    function getVariantItem(item) {
        let a = AlmostUnified.getVariantItemTarget(item).idLocation.toString()
        return !Ingredient.of(a).isEmpty() ? a : item;
    }

    let mechanismPipeMappings = new Map([
        ["fluxnetworks:flux_core", "powah:ender_core"]
    ])
    let uniquePipeKeys = new Set(mechanismPipeMappings.keys())

    event.forEachRecipe({
        or: [{ type: "minecraft:crafting_shaped" }, { type: "minecraft:crafting_shapeless" }],
        mod: "fluxnetworks"
    }, recipe => {
        let recipeResult = { stack: recipe.originalRecipeResult, string: String(recipe.originalRecipeResult.item) }
        if (!(uniquePipeKeys.has(recipeResult.string))) return
        let mappedMechanismPipe = mechanismPipeMappings.get(recipeResult.string)

        // Replace redstone (the usual core ingredient) with the Mekanism base pipe, but redstone may still be required elsewhere.
        recipe.replaceInput({ match: getVariantItem("minecraft:ender_eye") }, mappedMechanismPipe)
    })
})