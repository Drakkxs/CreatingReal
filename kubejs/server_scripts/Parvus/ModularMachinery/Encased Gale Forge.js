// priority: 0
// requires: create
// requires: modular_machinery_reborn
// @ts-check
// A upgrade to create's encased fan.


// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = true

    MMREvents.machines(event => {
        event.create("mmr:encased_galeforge").name("Encased GaleForge")
            .color("#FF4d4d4d")
            .structure(
                MMRStructureBuilder.create()
                    .pattern(
                        [
                            ["aaa", "ecd", "aba"],
                            ["ama", "aaa", "aaa"],
                            ["f f", "   ", "f f"]
                        ]
                    )
                    .keys(
                        {
                            "a": ["modular_machinery_reborn:casing_plain"],
                            "b": ["#modular_machinery_reborn:energyinputhatch"],
                            "c": ["modular_machinery_reborn:casing_firebox"],
                            "d": ["#modular_machinery_reborn:inputbus"],
                            "e": ["#modular_machinery_reborn:outputbus"],
                            "f": ["modular_machinery_reborn:casing_vent"]
                        }
                    )
            )
    })

    ServerEvents.recipes(event => {
        event.printExamples("minecraft:smelting")

        let recipes = {
            GaleForge: new Map([["", {results: [{item: "", count: 0}], xp: 0}]]) 
        }

        /**
         * Adds a recipe to the GaleForge.
         * @param {Special.Item} input The input item.
         * @param {import("net.minecraft.world.item.ItemStack").ItemWithCount} output The output items.
         */
        function addEGFRecipe(input, output) {
            let mmr = event.recipes.modular_machinery_reborn.machine_recipe("mmr:encased_galeforge", 20)
            let construct = {
                struct: (/** @type {number} */ v, /** @type {number} */ o) => ({
                    real() { return Math.max(v - o, o); },
                    center() { return Math.floor(this.real() / 2); }
                }),
                x: function (/** @type {number} */ value, /** @type {number} */ offset) { return this.struct(value, offset); },
                y: function (/** @type {number} */ value, /** @type {number} */ offset) { return this.struct(Math.max(value, 90) , offset); }
            };
    
            let Menu = {
                x: construct.x(150, 0),
                y: construct.y(90, 14)
            }

            //TODO: Track the outputs and inputs. Combine similar recipes.
            let recipes = new Map([[input, output]])
                
                
            mmr.requireEnergy(20, 0, 0)
            mmr.renderProgress(false)
            mmr.requireItem(input, Menu.x.center(), 0)
            mmr.produceItem(output, Menu.x.center(), 20)
            
            
            mmr.progressX(Menu.x.center())
            mmr.progressY(Menu.y.center())
            mmr.width(Menu.x.real()) 
            mmr.height(Menu.y.real())
        }

        addEGFRecipe("1x minecraft:gold_ingot", {item: "minecraft:iron_ingot", count: 1})
        addEGFRecipe("1x minecraft:gold_ingot", {item: "minecraft:iron_ingot", count: 20})

        /**
         * Retrieves an array of item IDs associated with the given ingredient.
         * @param {string} ingredient - The ingredient to retrieve item IDs for.
         * @returns {string[]} An array of item IDs.
         */
        function getIngredients(ingredient) {
            // Convert the items associated with the Ingredient into an array of item IDs
            return Ingredient.of(ingredient).getItemIds().toArray();
        }

        /**
         * Normalizes a given recipe.
         * @param {string} input The input. There can only be one, or a tag.
         * @param {string[]} outputs A array of outputs. Can be a tag.
         */
        function normalizeRecipe(input, outputs) {
            // Collect matching input ingredients
            let ingredients = getIngredients(input)

            //TODO: FIGURE OUT HOW REDUCE WORKS?
            // Collect matching results
            let results = outputs.reduce((prvValue, currentValue, index, array) => {
                return getIngredients(currentValue)
            }, "")
            if (!ingredients || !results) return;


        }
    })

})();