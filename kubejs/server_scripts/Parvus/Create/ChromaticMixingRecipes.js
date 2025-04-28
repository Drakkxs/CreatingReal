// priority: 0
// requires: create
// requires: createcompounds
// @ts-check

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {
    ServerEvents.recipes(event => {
        

        /**
         * Does mixing recipes
         * @param {"superheated"|"heated"|"none"} heat
         * @param {{count?: number, item?: string, tag?: string, 
         * type?: string, fluid?: string, fluid_stack?: string, amount?: number}[]} ingredients 
         * @param {{chance?: number, count?: number, item?: {id: string}, 
         * amount?: number, id?: string, fluid?: string}[]} results 
         */
        function createMixing(heat, ingredients, results) {
            return event.custom({
                "type": "create:mixing",
                "heat_requirement": heat,
                "ingredients": ingredients.reduce((a, b) => {
                    let c = Array(b.count || 1).fill(b).map(b => {
                        // Remove the count property
                        delete b.count || 1;
                        return b
                    })
                    return a.concat(c)
                },[]),
                "results": results
            })
        };

        
        /**
         * Does item application recipes
         * @param {{item: string, tag?: string}} ingredient
         * @param {{item: string, tag?: string}} catalyst
         * @param {boolean} keep_held_item
         * @param {{item: {id: string}}} result 
         */
        function createItemApplication(ingredient, catalyst, keep_held_item, result) {
            return event.custom({
                "type": "create:item_application",
                "ingredients": [catalyst, ingredient],
                "keep_held_item": keep_held_item,
                "results": [result]
            })
        };
        
        // Chromatic Compound =
        // 2 Redstone Dust
        // 2 Amethyst Shard
        // 2 Block of Exp
        // 2 Crying Obsidian
        createMixing("superheated", [
            {count: 2, item: "minecraft:redstone"},
            {count: 2, item: "minecraft:amethyst_shard"},
            {count: 2, item: "create:experience_block"},
            {count: 2, item: "minecraft:crying_obsidian"}
        ], [
            {count: 2, item: {id: "createcompounds:chromatic_compound"}}
        ]);

        // Shadow Steel =
        // 1 Chromatic Compound
        // 1 Sculk Catalyst 
        // 1 Netherite Ingot
        // 1 Crying Obsidian
        createMixing("superheated", [
            {count: 1, item: "createcompounds:chromatic_compound"},
            {count: 1, item: "minecraft:sculk_catalyst"},
            {count: 1, item: "minecraft:netherite_ingot"},
            {count: 1, item: "minecraft:crying_obsidian"}
        ], [
            {count: 1, item: {id: "createcompounds:shadow_steel"}}
        ]);
        
        // Refined Radiance =
        // 1 Chromatic Compound
        // 1 Glowstone Dust
        // 1 Beacon
        // 1 Crying Obsidian 
        createMixing("superheated", [
            {count: 1, item: "createcompounds:chromatic_compound"},
            {count: 1, item: "minecraft:glowstone"},
            {count: 1, item: "minecraft:beacon"},
            {count: 1, item: "minecraft:crying_obsidian"}
        ], [
            {count: 1, item: {id: "createcompounds:refined_radiance"}}
        ]);


        // Shadowsteel Casing
        createItemApplication(
            {item: "createcompounds:shadow_steel"}, 
            {item: "create:brass_casing"}, false, 
            {item: {id: "create:shadow_steel_casing"}
        });

        // Refined Radiance Casing
        createItemApplication(
            {item: "createcompounds:refined_radiance"}, 
            {item: "create:brass_casing"}, false, 
            {item: {id: "create:refined_radiance_casing"}
        });

        /**
         * Duping Recipes
         */
        
        // 2 Nether Star =
        // 1 Shadow Steel
        // 1 Refined Radiance
        // 1 Dragon's Breath
        createMixing("superheated", [
            {count: 1, item: "createcompounds:shadow_steel"},
            {count: 1, item: "createcompounds:refined_radiance"},
            {count: 1, item: "minecraft:dragon_breath"}
        ], [
            {count: 1, item: {id: "minecraft:nether_star"}},
            {chance: 0.25, count: 1, item: {id: "minecraft:nether_star"}}
        ]);


        // Dupe Dye Liquid with Chromatic Compound and Water
        Color.DYE.forEach((value, key) => {
            let color = value.normalize()
            let dyeLiquid = `create_dragons_plus:` + color + `_dye`;
            
            createMixing("superheated", [
                {count: 1, item: "createcompounds:chromatic_compound"},
                {amount: 250, fluid: "minecraft:water", type: "fluid_stack"},
                {amount: 250, fluid: dyeLiquid, type: "fluid_stack"}
            ], [
                {amount: 500, id: dyeLiquid},
                {count: 1, item: {id: "createcompounds:chromatic_compound"}},
            ]);

            
        });

        // Dupe Glowstone Dust with Refined Radiance
        createMixing("superheated", [
            {count: 1, item: "createcompounds:refined_radiance"},
            {count: 1, item: "minecraft:glowstone_dust"}
        ], [
            {count: 2, item: {id: "minecraft:glowstone_dust"}},
            {count: 1, item: {id: "createcompounds:refined_radiance"}},
            {chance: 0.25, count: 2, item: {id: "minecraft:glowstone_dust"}},
        ]);

        // Dupe Glow Berries with Refined Radiance
        createMixing("superheated", [
            {count: 1, item: "createcompounds:refined_radiance"},
            {count: 1, item: "minecraft:glow_berries"}
        ], [
            {count: 1, item: {id: "minecraft:glow_berries"}},
            {count: 1, item: {id: "createcompounds:refined_radiance"}},
            {chance: 0.25, count: 1, item: {id: "minecraft:glow_berries"}}
        ]);

        
        // Dupe Echo Shards with Shadow Steel
        createMixing("superheated", [
            {count: 1, item: "createcompounds:shadow_steel"},
            {count: 1, item: "minecraft:echo_shard"}
        ], [
            {count: 1, item: {id: "minecraft:echo_shard"}},
            {count: 1, item: {id: "createcompounds:shadow_steel"}},
            {chance: 0.25, count: 1, item: {id: "minecraft:echo_shard"}}
        ]);

        // Dupe Netherite Scrap with Shadow Steel and Dragon's Breath
        createMixing("superheated", [
            {count: 1, item: "createcompounds:shadow_steel"},
            {count: 1, item: "minecraft:netherite_scrap"},
            {count: 1, item: "minecraft:dragon_breath"}
        ], [
            {count: 1, item: {id: "minecraft:netherite_scrap"}},
            {count: 1, item: {id: "createcompounds:shadow_steel"}},
            {chance: 0.25, count: 1, item: {id: "minecraft:netherite_scrap"}}
        ]);


    });

})()
