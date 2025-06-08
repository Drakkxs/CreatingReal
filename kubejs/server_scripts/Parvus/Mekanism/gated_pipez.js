// priority: 0
// requires: mekanism
// requires: pipez
// @ts-check
// Pipez are very powerful. Let's gate them.

ServerEvents.recipes(event => {
    /**
     * Maps the values of the given object to their unified tags using getUnifiedTag.
     * @param {Object<string, any>} mapping - An object where each key maps to a value to be unified.
     * @returns {Object<string, any>} A new object with the same keys, where each value is the result of getUnifiedTag.
     */
    function mapTags(mapping) {
        let result = {};
        for (let key in mapping) {
            let value = mapping[key];
            // Only call getUnifiedTag if value is a string (item ID), otherwise pass through (e.g., Ingredient)
            result[key] = (Item.isItem(value)) ? getUnifiedTag(value) : value;
        }
        return result
    }

    let pipeMap = new Map([
        ["pipez:item_pipe", "mekanism:ultimate_logistical_transporter"],
        ["pipez:fluid_pipe", "mekanism:ultimate_mechanical_pipe"],
        ["pipez:energy_pipe", "mekanism:ultimate_universal_cable"],
        ["pipez:gas_pipe", "mekanism:ultimate_pressurized_tube"]
    ])
    let pipeKeys = new Set(pipeMap.keys())

    event.forEachRecipe({
        or: [{ type: "minecraft:crafting_shaped" }, { type: "minecraft:crafting_shapeless" }],
        mod: "pipez"
    }, recipe => {
        let result = { stack: recipe.originalRecipeResult, string: String(recipe.originalRecipeResult.item) }
        if (!(pipeKeys.has(result.string))) return
        let replacer = pipeMap.get(result.string)

        // Replace redstone (the usual core ingredient) with the Mekanism base pipe, but redstone may still be required elsewhere.
        recipe.replaceInput({match: "minecraft:redstone"}, replacer)
    })
})