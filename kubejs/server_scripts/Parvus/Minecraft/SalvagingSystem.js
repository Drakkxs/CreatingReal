// priority: 0
// @ts-check
// Salvage items

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    
    /**
     * Retrieves the item ID associated with a given tag using AlmostUnified.
     *
     * @param {string} tagKJS - The tag string, possibly prefixed with '#'.
     * @returns {string} The item ID location as a string, or an empty string if not found or on error.
     */
    function getTagItem(tagKJS) {
        try {
            let a = AlmostUnified.getTagTargetItem(tagKJS.replace("#", ""));
            return a && a.idLocation ? String(a.idLocation) : "";
        }
        catch (e) { console.log(`Error getting tag target item for ${tagKJS}: ${e}`); return ""; }
    }

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

        // Smash a hopper to get iron
        event.shapeless(`3x ${getVariantItem("minecraft:iron_ingot")}`, [
            getVariantItem("minecraft:hopper"), "#minecraft:pickaxes"
        ]).damageIngredient(1);


    })
})()
