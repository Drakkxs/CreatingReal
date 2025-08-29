// priority: 0
// requires: minecraft
// @ts-check
// Rotten Flesh to Leather smelting

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

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

    let rottenFlesh = getVariantItem("minecraft:rotten_flesh");
    let leather = getVariantItem("minecraft:leather");
    /** @type number & $TickDuration_, */
    let cookingTime = 200;
    ServerEvents.recipes(event => {

        // If there is already a recipe that outputs leather using rotten flesh, skip adding this
        if (event.findRecipes({ output: leather, input: rottenFlesh }).size()) return;
        event.smelting(leather, rottenFlesh).xp(0.1).cookingTime(cookingTime);
    })
})()
