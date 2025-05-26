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
            result[key] = (Item.isItem(value)) ? getUnifiedTag(value) : value;
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
        instrument: [
            "modular_machinery_reborn:time_counter",
            "modular_machinery_reborn:height_meter",
            "modular_machinery_reborn:weather_sensor",
            "modular_machinery_reborn:biome_reader",
            "modular_machinery_reborn:dimensional_detector",
            "modular_machinery_reborn:chunkloader"

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

    // Time Counter
    createHatchRecipe(
        Item.of(hatch.instrument[0], 1),
        [
            'rmr',
            'ici',
            'rmr'
        ],
        {
            i: "minecraft:chiseled_copper",
            m: "minecraft:clock",
            c: hatch.energy[0][0],
            r: hatch.casing[0],
        }
    )


    // Height Meter
    createHatchRecipe(
        Item.of(hatch.instrument[1], 1),
        [
            'rmr',
            'ici',
            'rmr'
        ],
        {
            i: "minecraft:ladder",
            m: "minecraft:scaffolding",
            c: hatch.energy[0][0],
            r: hatch.casing[0],
        }
    )

    // Weather Sensor
    createHatchRecipe(
        Item.of(hatch.instrument[2], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],  
        {
            i: "minecraft:chiseled_tuff",
            m: "minecraft:cauldron",
            c: hatch.energy[1][0],
            r: hatch.casing[0],
            g: "minecraft:lightning_rod",
        }
    )

    // Biome Reader
    createHatchRecipe(
        Item.of(hatch.instrument[3], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],  
        {
            i: "minecraft:chiseled_deepslate",
            m: "modular_machinery_reborn:weather_sensor",
            c: "minecraft:comparator",
            r: hatch.casing[0],
            g: "modular_machinery_reborn:height_meter",
        }
    )

    // Dimensional Detector
    createHatchRecipe(
        Item.of(hatch.instrument[4], 1),
        [
            'rcr',
            'ici',
            'rgr'
        ],  
        {
            i: "minecraft:chiseled_nether_bricks",
            c: "minecraft:ender_eye",
            r: hatch.casing[1],
            g: "modular_machinery_reborn:biome_reader",
        }
    )

    // Chunkloader
    createHatchRecipe(
        Item.of(hatch.instrument[5], 1),
        [
            'rgr',
            'ici',
            'rmr'
        ],  
        {
            i: "minecraft:chiseled_deepslate",
            m: "modular_machinery_reborn:dimensional_detector",
            c: hatch.energy[1][0],
            r: hatch.casing[2],
            g: "minecraft:anvil",
        }
    )


})