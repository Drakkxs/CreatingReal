// priority: 0
// requires: bblcore
// @ts-check
// Recipe for the upgrade base

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let upgradeBase = "bblcore:upgrade_base"

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

        // If there is already a recipe that outputs the Upgrade Base skip adding a recipe.
        if (event.findRecipes({ output: upgradeBase }).size()) return;

        event.shaped(upgradeBase, [
            " M ",
            "MCM",
            " M "
        ], {
            M: getVariantItem("minecraft:copper_ingot"),
            C: getVariantItem("minecraft:iron_ingot")
        })
    })
})()
