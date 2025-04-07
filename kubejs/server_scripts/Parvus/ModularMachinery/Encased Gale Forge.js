// priority: 0
// requires: create
// requires: modular_machinery_reborn
// @ts-check
// A upgrade to create's encased fan.

let $ParseResults = Java.loadClass("com.mojang.brigadier.ParseResults");


// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = true

    /**
     * Attempts to clean up a item id string.
     * @param {string} string - The string to clean up
     */
    function toResouce(string) {
        return string.replace(/([0-9]x)|[^a-zA-Z:_#]/g, "")
    }

    /**
     * Converts an ingredient string into an array of objects containing the item ID and count.
     * @param {string} id - The ingredient string to convert.
     * @param {number} [count] - The count of the ingredient. Defaults to 1 if not provided.
     * @returns {{item: string, count: number}[]} - The array of objects containing the item ID and count.
     */
    function getIngredients(id, count) {
        count = count || 1
        if (debug) console.log(`Converting id: ${id} with count: ${count}`);
        
        // Remove any numerical prefix (e.g., "1x") from the ingredient string
        let strIngredient = toResouce(id);
        if (debug) console.log(`Processed ingredient string: ${strIngredient}`);

        // Get an array of item IDs from the ingredient string using the Ingredient API
        let arrIngredients = Ingredient.of(strIngredient).getItemIds().toArray().map(id => String(id))
        if (debug) console.log(`Item IDs obtained: ${arrIngredients}`);
        if (arrIngredients.length === 0) throw new Error(`No item IDs found for the input: ${strIngredient}`);

        /**
         * Map the item IDs into an array of objects with item ID and specified count
         * @type {{item: string, count: number}[]}
         */
        let results = [] 
        arrIngredients.forEach(itemID => {
            results.push({
                item: itemID,
                count: count
            })
        });

        if (debug) console.log(`Resulting item objects: ${results.map(obj => `${obj.item}, ${obj.count}`)}`);

        // Return the array of item objects with IDs and counts
        return results;
    }

    /** 
     * Basic functions to interact with the recipe map
     * They don't have much input validation, so be careful.
     */
    let recipeMapHelper = {
        
        /**
         * Retrieves the recipe map for a specified machine.
         * Throws an error if the coreRecipes object is not initialized or if no recipe map is found for the machine.
         * @param {string} machine - The machine ID.
         * @returns {Map<string, {results: {item: string, count: number}[], xp: number, time: number}>} - The recipe map.
         * @throws Will throw an error if the coreRecipes object is not initialized or if the machine has no recipe map.
         */
        getRecipeMap(machine) {
            // Ensure the coreRecipes object is initialized
            if (!coreRecipes) throw new Error('Recipes are not initialized');
            
            // Retrieve the recipe map for the specified machine
            let map = coreRecipes[machine];
            
            // Throw an error if no recipe map is found for the machine
            if (!map) throw new Error(`No recipe map found for machine: ${machine}`);
            
            // Return the retrieved recipe map
            return map;
        },

        /**
         * Checks if the given input is a key in the recipe map.
         * @param {string} machine - The machine ID.
         * @param {string} input - The input item string.
         * @returns {boolean} - Returns true if the input is not present in the recipe map; otherwise, false.
         */
        isInputNew(machine, input) {
            // Retrieve the recipe map for the specified machine
            let liveRecipes = this.getRecipeMap(machine);
            
            // Check if the given input is not a key in the recipe map
            return !liveRecipes.has(input);
        },

        /**
         * Adds an output to an existing recipe for a given machine.
         * If the recipe already has outputs, the new output will be appended to the existing list.
         * @param {string} machine - The machine ID.
         * @param {string} input - The input item string.
         * @param {string} result - The output item string to add.
         * @param {number} [count] - The count of the output item. Defaults to 1 if not provided.
         */
        addOutput(machine, input, result, count) {
            // Retrieve the current recipe map for the specified machine
            let liveRecipes = this.getRecipeMap(machine);

            if (debug) {
                console.log(`Input: ${input}, Output: ${result} count: ${count ?? 1}`);
            }
            
            // Add the new output to the existing results array of the recipe
            let recipe = liveRecipes.get(input);
            if (debug) {
                console.log(`Current recipe: ${input} has ${recipe.results.length} results`);
                console.log(`Result: ${JSON.stringify(recipe.results)}`);
            }
            
            console.log(`Appending output: ${result} with count: ${count ?? 1} to recipe results.`);

            recipe.results = recipe.results.concat([{ item: result, count: count ?? 1}]);

            console.log(`Final recipe results: ${recipe.results.length}`);
            liveRecipes.set(input, recipe);
            if (debug) {
                console.log(`Updated recipe: ${input} has ${recipe.results.length} results`);
                console.log(`Result: ${JSON.stringify(recipe.results)}`);
            }
        }
    }

    

    /**
     * Modular Machinery will process only the first recipe to the input and output.
     * Since we have multiple recipes, we need to combine the ones that are already in the recipe map.
     * Recipes that have the same outputs will be favored by who produces more outputs.
     * This function handles adding a recipe to the recipe map even if it already exists.
     * @param {string} machine - The machine ID
     * @param {string} unInput - The input item string
     * @param {{item: string, count: number}} unOutput - The output item string
     * @param {number} [xp] - The experience points for the recipe
     * @param {number} [time] - The time in ticks for the recipe
     */
    function addRecipe(machine, unInput, unOutput, xp, time) {

        /** Current data */
        let live = {
            recipeMap: recipeMapHelper.getRecipeMap(machine)
        }

        /** Checks */
        if (!(xp || time)) {
            xp = 0
            time = 0
        }

        /** Incoming data */
        let draft = {
            inputs: getIngredients(unInput),
            outputs: getIngredients(unOutput.item, unOutput.count),
            xp: xp,
            time: time
        }

        // Check if any of the variables are empty
        let keys = Object.keys(draft).concat(Object.keys(live));
        let isEmpty = !keys.every(key => key);
        if (isEmpty) {
            throw new Error(`Missing recipe data for key: ${keys.find(key => !draft[key] || !live[key])}`);
        }

        for (let forInput of draft.inputs.map(input => input.item)) {
            /** If the input is new, add it */
            if (recipeMapHelper.isInputNew(machine, forInput)) {
                if (debug) console.log(`Adding new recipe for input: ${forInput}`);
                live.recipeMap.set(forInput, {
                    results: draft.outputs,
                    xp: draft.xp,
                    time: draft.time
                })
                // Return true to indicate that the recipe was added
                return true;
            }

            draft.outputs.forEach(output => {
                

                let isNew = live.recipeMap.get(forInput).results.every(result => result.item !== output.item);

                /** If the output is new */
                if (isNew) {
                    console.log(`=== ADDING OUTPUT: ${machine} ${output.item} === `);
                    recipeMapHelper.addOutput(machine, forInput, output.item, output.count);
                    // Return true to indicate that the recipe was added
                    return true;
                }

                /** If the output is not new */
                if (!isNew) {
                    console.log(`=== UPDATING OUTPUT: ${machine} ${output.item} === `);
                    let recipe = live.recipeMap.get(forInput)

                    recipe.results.map(result => {
                        let newResult = {item: result.item, count: result.count}
                        if (result && result.item === output.item) {
                            if (debug) {
                                console.log(`Found existing output: ${result.item} with count: ${result.count}`);
                            }
                            newResult.count = Math.max(result.count, output.count);
                            console.log(`New output: ${newResult.item} with count: ${newResult.count}`);
                            return newResult
                        }
                        return result
                    })

                    if (debug) {
                        console.log(`Updated recipe: ${forInput} has ${JSON.stringify(recipe.results)} results`);
                    }
                    live.recipeMap.set(forInput, recipe)
                    
                    // Return true to indicate that the recipe was updated
                    return true;
                }
            })
        }
    }
    
    /**
     * A map of recipes for modular machines
     */
    let coreRecipes = {

        /** The maximum number of results per recipe subtracted by 1 */
        maxResults: 17,

        /**
         * A map of recipes for the Encased GaleForge (EGF) machine.
         * The key is the input item for the recipe and the value is an object containing the recipe details.
         * The recipe details object contains the following properties:
         *   results: An array of objects with the following properties:
         *     item: The item ID of the output item
         *     count: The count of the output item
         *   xp: The amount of experience points gained when the recipe is processed
         *   time: The amount of time it takes to process the recipe in ticks
         * @type {Map<string, {results: {item: string, count: number}[], xp: number, time: number}>}
         */
        EGF: new Map()
    }

    /**
     * Constructs an object with methods to calculate real and center values based on input and offset.
     */
    let construct = {
        /**
         * Creates a structure with real and center calculation methods.
         * @param {number} structValue - The initial value.
         * @param {number} structOffset - The offset value.
         * @returns- The structure with methods.
         */
        struct: (structValue, structOffset) => ({

            /**
             * Calculates the real value as the maximum of (v - o) and o
             * @returns {number} - The calculated real value.
             */
            real() { return Math.max(structValue - structOffset, structOffset); },

            /**
             * Calculates the center value as half of the real value, floored.
             * @returns {number} - The calculated center value.
             */
            center() { return Math.floor(this.real() / 2); },

            /**
             * Adjust the height of the UI dynamically based on how many items are in it.
             * @param {number} neededSlots - The number of slots that need to be displayed.
             * @param {number} tilesize - The size of the tile.
             * @param {number} x - The real x position of the UI.
             * @param {number} reservedRows - The number of reserved rows.
             */
            adjustHeight(neededSlots, tilesize, x, reservedRows) {
                if (debug) console.log(`Adjusting height of UI for ${neededSlots} slots.`)
                let columns = Math.ceil(x / tilesize)
                let neededRows = Math.ceil(neededSlots / columns) + reservedRows
                let totalHeight = neededRows * tilesize
                if (debug) console.log(`Needed rows: ${neededRows}, total height: ${totalHeight}`)

                // Clamp the height to the current minimum or increase it
                let y = Math.min(Math.max(90, totalHeight), 256)
                if (debug) console.log(`The new height of the UI is ${y} pixels.`)
                return y
            },
        }),

        /**
         * Creates a structure using the given value and offset.
         * @param {number} value - The initial value.
         * @param {number} offset - The offset value.
         * @returns - The structure with methods.
         */
        x: function (value, offset) { return this.struct(value, offset); },

        /**
         * Creates a structure using the maximum of the given value and 90, and the offset.
         * @param {number} value - The initial value.
         * @param {number} offset - The offset value.
         * @returns - The structure with methods.
         */
        y: function (value, offset) { return this.struct(value, offset); }
    };

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

        /**
         * Processes all recipes for the Encased GaleForge (EGF) machine.
         * Iterates over each recipe in the EGF map and executes the doEFG function.
         * @param {{results: {item: string, count: number}[], xp: number, time: number}} recipe - The recipe object.
         * @param {string} input - The input item string.
         */
        function doEFG(input, recipe) {
            /** The results of the recipe */
            let results = recipe.results
            /** The time it takes to process the recipe */
            let time = recipe.time || 20
            /** The amount of experience points gained when the recipe is processed */
            let xp = recipe.xp || 0
            /** The machine properties object */
            let machine = event.recipes.modular_machinery_reborn.machine_recipe("mmr:encased_galeforge", time)

            /** A measurment of how taxing this recipe is on the machine. */
            let processImpact = (5 * results.length)
            
            /** A array of reserved slots
             * @type {Array<{x: number, y: number}>}
             */
            let reserved = []

            let ui = {
                tilesize: 20,
                x: construct.x(150, 0),

                y: construct.y(90, 14),
                /**
                 * Calculates the number of columns in the UI grid based on the tile width.
                 * @param {number} tileWidith - The width of the tile.
                 * @returns {number} - The number of columns.
                 */
                columns (tileWidith) { return Math.ceil(ui.x.real() / tileWidith) },

                /**
                 * Calculates the number of rows in the UI grid based on the tile height.
                 * @param {number} tileHeight - The height of the tile.
                 * @returns {number} - The number of rows.
                 */
                rows (tileHeight) { return Math.ceil(ui.y.real() / tileHeight) },

                /**
                 * Reserves a specified position in the UI grid.
                 * Adds the position to the reserved list to prevent other elements from being placed at the same coordinates.
                 * @param {number} x - The x-coordinate of the position to reserve.
                 * @param {number} y - The y-coordinate of the position to reserve.
                 */
                reserve (x, y) {
                    reserved.push({x: x, y: y })
                    if (debug) console.log(`Reserved position: ${[x, y]}`)
                },

                /**
                 * Controls a grid structure for the UI.
                 * This function takes an index and a tile size and returns the x and y position of the tile.
                 * The grid is structured as follows:
                 * - Each row is a multiple of the tile size.
                 * - The number of columns is the minimum number of columns needed to fit all the tiles.
                 * - The tiles are arranged in order of increasing index, with the first tile at the top left and the last tile at the bottom right.
                 * @param {number} index - The index of the tile.
                 * @param {number} tileWidith - The width of the tile.
                 * @param {number} [tileHeight] - Will be set to the same value as tileWidith if not provided.
                 * @returns {{x: number, y: number}} - The x and y position of the tile.
                 */
                getTilePosition(index, tileWidith, tileHeight) {
                    tileHeight = tileHeight ?? tileWidith
                    let columns = this.columns(tileWidith)
                    let rows = this.rows(tileHeight)

                    let x = (index % columns) * tileWidith
                    let y = Math.floor(index / columns) * tileHeight

                    // Find next available position
                    while (reserved.some(pos => pos.x === x && pos.y === y)) {
                        index++
                        x = (index % columns) * tileWidith
                        y = Math.floor(index / columns) * tileWidith
                    }

                    // Reserve this position
                    this.reserve(x, y)

                    return {x: x, y: y }
                }
            }


            if (debug) {
            console.log(`===RECIPE=== EGF`)
            console.log(`Processing recipe for: ${input}`)
            console.log(`The recipe object is: ${Object.getOwnPropertyNames(recipe)}`)
            console.log(`The results of the recipe are: ${JSON.stringify(recipe.results)}`)
            console.log(`The time it takes to process the recipe is: ${time} ticks`)
            console.log(`The amount of experience points gained when the recipe is processed is: ${xp}`)
            }

            results = results.filter((_, index) => index < coreRecipes.maxResults)
            
            // The energy bar is 3 tiles high and 1 tile wide
            // We need to reserve three slots for the energy bar
            for (let i = 0; i < 3; i++) {
                ui.reserve(0, 0 + i * ui.tilesize)
            }
            machine.requireEnergy(processImpact, 0, 0)
            machine.renderProgress(true)

            // The top row and first column of the UI is reserved for special UI elements.
            for (let i = 1; i < ui.columns(ui.tilesize); i++) {
                ui.reserve(i * ui.tilesize, 0)
            }
            for (let i = 3; i < ui.rows(ui.tilesize); i++) {
                ui.reserve(0, 0 + i * ui.tilesize)
            }
            machine.requireItem(input, 20, 0)

            results.forEach((result, index) => {
                let pos = ui.getTilePosition(index, ui.tilesize)
                if (debug) console.log(`Producing item: ${result.item} with count: ${result.count} at position: ${[pos.x, pos.y]}`);
                machine.produceItem(`${result.count}x ${result.item}`, pos.x, pos.y)
            })

            machine.progressX(40)
            machine.progressY(0)
            machine.width(Math.max(90, (Math.min(ui.x.real() + (results.length), 256))))
            // Adjust the height of the UI dynamically
            machine.height(ui.y.adjustHeight(results.length, ui.tilesize, ui.x.real(), Math.ceil(reserved.length / ui.columns(ui.tilesize))))
        }

        addRecipe("EGF", "1x minecraft:gold_ingot", {item: "minecraft:iron_ingot", count: 1})
        addRecipe("EGF", "1x minecraft:gold_ingot", {item: "minecraft:copper_ingot", count: 12})
        addRecipe("EGF", "1x minecraft:gold_ingot", {item: "minecraft:netherite_ingot", count: 18})
        addRecipe("EGF", "1x minecraft:gold_ingot", {item: "minecraft:copper_ingot", count: 12})
        addRecipe("EGF", "1x minecraft:gold_ingot", {item: "#c:ingots", count: 2})

        coreRecipes.EGF.forEach((recipe, input) => {doEFG(input, recipe)})
    })
})();