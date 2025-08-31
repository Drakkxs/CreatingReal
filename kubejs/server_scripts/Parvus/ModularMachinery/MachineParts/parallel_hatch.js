// priority: 0
// requires: modular_machinery_reborn
// Recipes for machine parts.
// @ts-check


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

    /** Hatches */
    let hatch = {
        parallel: [
            "modular_machinery_reborn:parallel_hatch_basic",
            "modular_machinery_reborn:parallel_hatch_medium",
            "modular_machinery_reborn:parallel_hatch_advanced",
            "modular_machinery_reborn:parallel_hatch_ultimate",
            "modular_machinery_reborn:parallel_hatch_max"
        ],
        casing: [
            "modular_machinery_reborn:casing_plain",
            "modular_machinery_reborn:casing_reinforced",
            "modular_machinery_reborn:casing_gearbox",
            "modular_machinery_reborn:casing_vent",
            "modular_machinery_reborn:casing_circuitry",
        ],
        energy: [
            ["modular_machinery_reborn:energyinputhatch_tiny", "modular_machinery_reborn:energyoutputhatch_tiny"],
            ["modular_machinery_reborn:energyinputhatch_small", "modular_machinery_reborn:energyoutputhatch_small"],
            ["modular_machinery_reborn:energyinputhatch_normal", "modular_machinery_reborn:energyoutputhatch_normal"],
            ["modular_machinery_reborn:energyinputhatch_reinforced", "modular_machinery_reborn:energyoutputhatch_reinforced"],
            ["modular_machinery_reborn:energyinputhatch_big", "modular_machinery_reborn:energyoutputhatch_big"],
            ["modular_machinery_reborn:energyinputhatch_huge", "modular_machinery_reborn:energyoutputhatch_huge"],
            ["modular_machinery_reborn:energyinputhatch_ludicrous", "modular_machinery_reborn:energyoutputhatch_ludicrous"],
            ["modular_machinery_reborn:energyinputhatch_ultimate", "modular_machinery_reborn:energyoutputhatch_ultimate"],
        ],
        item: [
            ["modular_machinery_reborn:inputbus_tiny", "modular_machinery_reborn:outputbus_tiny"],
            ["modular_machinery_reborn:inputbus_small", "modular_machinery_reborn:outputbus_small"],
            ["modular_machinery_reborn:inputbus_normal", "modular_machinery_reborn:outputbus_normal"],
            ["modular_machinery_reborn:inputbus_reinforced", "modular_machinery_reborn:outputbus_reinforced"],
            ["modular_machinery_reborn:inputbus_big", "modular_machinery_reborn:outputbus_big"],
            ["modular_machinery_reborn:inputbus_huge", "modular_machinery_reborn:outputbus_huge"],
            ["modular_machinery_reborn:inputbus_ludicrous", "modular_machinery_reborn:outputbus_ludicrous"]
        ]
    }

    /**
     * Creates a shaped recipe for a hatch item input and output.
     * @param {import('net.minecraft.world.item.ItemStack').$ItemStack} result - The output item or item stack for the recipe.
     * @param {string[]} pattern - An array of strings representing the crafting grid pattern.
     * @param {Object<string, any>} key - An object mapping single-character keys in the pattern to item tags or items.
     */
    function createHatchRecipe(result, pattern, key) {
        let resultHatch = result.id
        return event.shaped(resultHatch, pattern, mapTags(key))
    }

    // Basic Tier
    createHatchRecipe(
        Item.of(hatch.parallel[0], 1),
        [
            'rir',
            'ici',
            'rmr'
        ],
        {
            i: hatch.casing[1],
            m: hatch.item[2],
            c: hatch.energy[3],
            r: hatch.casing[0],
        }
    )

    // Medium Tier
    createHatchRecipe(
        Item.of(hatch.parallel[1], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],
        {
            i: hatch.casing[2],
            m: hatch.item[3],
            c: hatch.energy[4],
            r: hatch.casing[1],
            g: hatch.parallel[0],
        }
    )

    // Advanced Tier
    createHatchRecipe(
        Item.of(hatch.parallel[2], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],
        {
            i: hatch.casing[3],
            m: hatch.item[4],
            c: hatch.energy[5],
            r: hatch.casing[2],
            g: hatch.parallel[1],
        }
    )

    // Ultimate Tier
    createHatchRecipe(
        Item.of(hatch.parallel[3], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],
        {
            i: hatch.casing[4],
            m: hatch.item[5],
            c: hatch.energy[6],
            r: hatch.casing[3],
            g: hatch.parallel[2],
        }
    )

    // Max Tier
    createHatchRecipe(
        Item.of(hatch.parallel[4], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],
        {
            i: "minecraft:nether_star",
            m: hatch.item[6],
            c: hatch.energy[7],
            r: hatch.casing[4],
            g: hatch.parallel[3],
        }
    )


})