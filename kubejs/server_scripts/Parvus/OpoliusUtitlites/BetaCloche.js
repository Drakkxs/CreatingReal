// priority: 0
// requires: opolisutilities
// requires: cloche
// @ts-check
// Recipe for the Beta Cloche and a better recipe for the Released Cloche

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let releaseCloche = "cloche:cloche"
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
        if (event.findRecipes({ output: betaClocheId, type: "minecraft:crafting_shaped" }).size()) return;
        
        // Remove existing recipe for the Release Cloche
        event.remove({ output: releaseCloche, type: "minecraft:crafting_shaped" });

        event.shaped(betaClocheId, [
            "MMM",
            "ICI",
            "MMM"
        ], {
            M: getVariantItem("minecraft:copper_ingot"),
            C: getVariantItem("minecraft:dirt"),
            I: getVariantItem("minecraft:water_bucket")
        })

        event.shaped(releaseCloche, [
            "MMM",
            "ICI",
            "MMM"
        ], {
            M: getVariantItem("minecraft:iron_ingot"),
            C: betaClocheId,
            I: getVariantItem("minecraft:water_bucket")
        })

        // Combine with a piece of redstone to switch between the varaints.
        event.shapeless(releaseCloche, [betaClocheId, getVariantItem("minecraft:redstone")])
        event.shapeless(betaClocheId, [releaseCloche, getVariantItem("minecraft:redstone")])
    })
})()
