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
        input: [
            "modular_machinery_reborn:inputbus_tiny",
            "modular_machinery_reborn:inputbus_small",
            "modular_machinery_reborn:inputbus_normal",
            "modular_machinery_reborn:inputbus_reinforced",
            "modular_machinery_reborn:inputbus_big",
            "modular_machinery_reborn:inputbus_huge",
            "modular_machinery_reborn:inputbus_ludicrous"
        ],
        output: [
            "modular_machinery_reborn:outputbus_tiny",
            "modular_machinery_reborn:outputbus_small",
            "modular_machinery_reborn:outputbus_normal",
            "modular_machinery_reborn:outputbus_reinforced",
            "modular_machinery_reborn:outputbus_big",
            "modular_machinery_reborn:outputbus_huge",
            "modular_machinery_reborn:outputbus_ludicrous"
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
        let outputHatch = resultHatch.replace("input", "output")

        let outputKey = {}
        for (let ingredient in key) {
            // Check if the ingredient is a input hatch
            if (hatch.input.find(i => i == key[ingredient])) {
                // Replace the input hatch with the corresponding output hatch
                outputKey[ingredient] = String(key[ingredient]).replace("input", "output")
            }
            else {
                outputKey[ingredient] = key[ingredient]
            }
        }
        // Create the recipe using the event object
        // Use the mapTags function to convert the keys to unified tags
        return {
            i: event.shaped(resultHatch, pattern, mapTags(key)),
            o: event.shaped(outputHatch, pattern.reverse(), mapTags(outputKey))
        }
    }

    // Input to Output conversion recipe
    

    // Normal Tier
    createHatchRecipe(
        Item.of(hatch.input[2], 1),
        [
            'rmr',
            'ici',
            'rir'
        ],
        {
            i: 'modular_machinery_reborn:casing_plain',
            m: "minecraft:hopper",
            c: hatch.input[1],
            r: 'minecraft:chest'
        }
    )

    // Reinforced Tier
    createHatchRecipe(
        Item.of(hatch.input[3], 1),
        [
            'rmr',
            'ici',
            'rir'
        ],
        {
            i: 'modular_machinery_reborn:casing_reinforced',
            m: "minecraft:hopper_minecart",
            c: hatch.input[2],
            r: 'minecraft:chest',
        }
    )

    // Big Tier
    createHatchRecipe(
        Item.of(hatch.input[4], 1),
        [
            'rmr',
            'ici',
            'rir'
        ],
        {
            i: 'modular_machinery_reborn:casing_reinforced',
            m: hatch.input[0],
            c: hatch.input[3],
            r: 'minecraft:chest_minecart',
        }
    )

    // Huge Tier
    createHatchRecipe(
        Item.of(hatch.input[5], 1),
        [
            'rmr',
            'ici',
            'rir'
        ],
        {
            i: 'modular_machinery_reborn:casing_gearbox',
            m: hatch.input[1],
            c: hatch.input[4],
            r: 'modular_machinery_reborn:casing_reinforced',
        }
    )

    // Ludicrous Tier
    createHatchRecipe(
        Item.of(hatch.input[6], 1),
        [
            'rmr',
            'ici',
            'rir'
        ],
        {
            i: hatch.input[2],
            m: hatch.input[5],
            c: hatch.input[3],
            r: 'modular_machinery_reborn:casing_vent',
        }
    )

    // Ultimate Tier (There is no input hatch for this tier)
    // createHatchRecipe(
    //     Item.of(hatch.input[7], 1),
    //     [
    //         'rmr',
    //         'ici',
    //         'rir'
    //     ],
    //     {
    //         i: "minecraft:nether_star",
    //         m: 'modular_machinery_reborn:casing_reinforced',
    //         c: hatch.input[6],
    //         r: 'modular_machinery_reborn:casing_circuitry',
    //     }
    // )


})