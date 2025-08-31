// priority: 0
// @ts-check
// Convert Fluid Hoppers to normal hoppers.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let fluidHopper = "utilitarian:fluid_hopper"
    let itemHopper = "minecraft:hopper" // Item Hopper

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

    ServerEvents.recipes(event => {

        const recipeHopperItem = event.findRecipes({ output: itemHopper, input: fluidHopper }).size()
        const recipeFluidHopper = event.findRecipes({ output: fluidHopper, input: itemHopper }).size()

        // If there is already a recipe that converts an item hopper to a fluid hopper, skip adding a recipe.
        if (!recipeFluidHopper) {
            // Convert an item hopper to a fluid hopper
            event.shapeless(fluidHopper, [
                getVariantItem("minecraft:bucket"),
                getVariantItem("minecraft:white_dye"),
                itemHopper
            ])
        }

        // If there is already a recipe that converts a fluid hopper to an item hopper, skip adding a recipe.
        if (!recipeHopperItem) {
            // Convert a fluid hopper to an item hopper
            event.shapeless(itemHopper, [
                "#minecraft:logs",
                "#minecraft:logs",
                fluidHopper
            ])

            event.shapeless(itemHopper, [
                getVariantItem("minecraft:chest"),
                fluidHopper
            ])
        }
    })
})()
