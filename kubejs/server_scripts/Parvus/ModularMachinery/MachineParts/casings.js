// priority: 0
// requires: modular_machinery_reborn
// Recipes for machine parts.

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
            result[key] = (!Ingredient.of(value).isEmpty()) ? getUnifiedTag(value) : value;
        }
        return result
    }
    // Machine Blueprint
    event.shapeless(
        Item.of("modular_machinery_reborn:blueprint", 1),
        ['minecraft:paper', 'modular_machinery_reborn:modularium']
        .map(i => getUnifiedTag(i)),
    )
    // Tier 1 Part
    event.shaped(
        Item.of("modular_machinery_reborn:casing_gearbox", 2),
        [
            'rmr',
            'c c',
            'rir'
        ],
        mapTags({
            i: 'minecraft:iron_ingot',
            m: 'minecraft:chiseled_copper',
            c: "modular_machinery_reborn:casing_reinforced",
            r: 'minecraft:redstone'
        })
    )
    // Tier 2 Part
    event.shaped(
        Item.of("modular_machinery_reborn:casing_vent", 2), // arg 1: output
        [
            'rir',
            'cmc', // arg 2: the shape (array of strings)
            'rir'   
        ],
        mapTags({
            i: 'modular_machinery_reborn:casing_firebox', // arg 3: the mapping for 'a'
            m: '#minecraft:wool',
            c: "modular_machinery_reborn:casing_gearbox",
            r: 'minecraft:redstone'
        })
    )
    // Tier 3 Part
    event.shaped(
        Item.of("modular_machinery_reborn:casing_circuitry", 2),
        [
            'rmr',
            'c c',
            'rir'
        ],
        mapTags({
            i: 'minecraft:comparator',
            m: "minecraft:copper_bulb",
            c: "modular_machinery_reborn:casing_vent",
            r: "modular_machinery_reborn:casing_gearbox"
        })
    )
})