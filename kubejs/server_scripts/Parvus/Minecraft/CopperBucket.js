// priority: 0
// @ts-check
// Iron bucket from a copper bucket.

// Immediately Invoked Function Expression to prevent polluting the global namespace
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
        return !Ingredient.of(a).isEmpty() ? a : item;
    }
    ServerEvents.recipes(event => {

        let ingot = getVariantItem("minecraft:copper_ingot");

        // If there is already a recipe that outputs a bucket using copper ingots, override it.
        event.remove({ output: "minecraft:bucket", type: "minecraft:crafting_shaped", input: ingot });
        event.shaped("minecraft:bucket", [
            "C C",
            " C "
        ], {
            C: ingot
        })
    })
})()
