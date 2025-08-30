// priority: 0
// requires: mekanism
// requires: createaddition
// @ts-check
// Allow crafting upwards from BioFuel to Biomass Pallets.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {

    let bioFuel = "mekanism:block_bio_fuel"
    let biomassPallet = "createaddition:biomass_pellet_block"

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
    
    let ingot = getVariantItem("minecraft:copper_ingot");
    ServerEvents.recipes(event => {

        // Allow crafting upwards from BioFuel to Biomass Pallets.
        event.shapeless(biomassPallet, Array(9).fill(bioFuel))
    })
})()
