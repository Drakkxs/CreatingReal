// priority: 0
// requires: minecraft
// @ts-check
// Recipe for the Beta Cloche and a better recipe for the Basic Cloche

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let basicCloche = "cloche:cloche"
    let betaClocheId = "opolisutilities:cloche" // Beta Cloche

    /**
     * Returns the variant item ID for the given item if it is a valid ingredient,
     * otherwise returns the original item.
     *
     * @param {string} item - The item identifier to check for a variant.
     * @returns {string} The variant item ID if valid, or the original item.
     */
    function getVariantItem(item) {
        let a = AlmostUnified.getVariantItemTarget(item).idLocation.toString()
        return Ingredient.isIngredient(a) ? a : item;
    }

    ServerEvents.recipes(event => {

        // If there is already a recipe that outputs the Beta Cloche skip adding a recipe.
        if (event.findRecipes({ output: betaClocheId }).size()) return;

        // Remove existing recipe for the Basic Cloche
        event.remove({ output: basicCloche, type: "minecraft:crafting_shaped" });

        event.shaped(basicCloche, [
            "MMM",
            "ICI",
            "MMM"
        ], {
            M: getVariantItem("minecraft:copper_ingot"),
            C: getVariantItem("minecraft:dirt"),
            I: getVariantItem("minecraft:water_bucket")
        })

        event.shaped(betaClocheId, [
            "MMM",
            "ICI",
            "MMM"
        ], {
            M: getVariantItem("minecraft:iron_ingot"),
            C: basicCloche,
            I: getVariantItem("minecraft:water_bucket")
        })
    })
})()
