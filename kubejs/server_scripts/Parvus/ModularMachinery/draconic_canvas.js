// priority: -10
// requires: create
// requires: createmechanisms
// requires: modular_machinery_reborn
// requires: create_dragons_plus
// @ts-check
// An upgrade to create's encased fan.

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = false;

    /**
     * Constructs an object with methods to calculate real and center values based on input and offset.
     */
    let constructPOS = {
        /**
         * Creates a structure with real and center calculation methods.
         * @param {number} dim - The initial value.
         * @param {number} dimOffset - The offset value.
         * @returns- The structure with methods.
         */
        struct: (dim, dimOffset) => ({

            /**
             * Calculates the real value as the maximum of (v - o) and o
             * @returns {number} - The calculated real value.
             */
            real() { return Math.max(dim - dimOffset, dimOffset); },

            /**
             * Calculates the center value as half of the real value, floored.
             * @returns {number} - The calculated center value.
             */
            center() { return Math.floor(this.real() / 2); }
        }),

        /**
         * Creates a structure using the given value and offset.
         * @param {number} width - The initial value.
         * @param {number} wOffset - The offset value.
         * @returns - The structure with methods.
         */
        width: function (width, wOffset) { return this.struct(width, wOffset); },

        /**
         * Creates a structure using the maximum of the given value and 90, and the offset.
         * @param {number} height - The initial value.
         * @param {number} hOffset - The offset value.
         * @returns - The structure with methods.
         */
        height: function (height, hOffset) { return this.struct(height, hOffset); }
    };


    /**
     * A function to create a structure for the UI.
     * @param {number} [t] - The size of the tile.
     * @param {number} [uiSize] - The maximum size of the UI.
     * @param {number} [width] - The initial x position of the UI.
     * @param {number} [wOffset] - The x offset of the UI.
     * @param {number} [height] - The initial y position of the UI.
     * @param {number} [hOffset] - The y offset of the UI.
     */
    function constuctUI(t, uiSize, width, wOffset, height, hOffset) {
        return {
            /** 
             * The maximum size of the UI is hardcoded to 256
             * However the largest recipe size will influence the JEI Category
             */
            MAX_UI_SIZE: uiSize | 256,
            tilesize: t || 20,
            reservations: [],
            width: constructPOS.width(width || 80, wOffset || 0),
            height: constructPOS.height(height || 60, hOffset || 0),

            /**
             * Calculates the number of columns in the UI grid based on the tile width.
             */
            columns() {
                let numColumns = Math.ceil(this.width.real() / this.tilesize);
                if (debug) console.log(`Calculated columns: ${numColumns}`);
                if (Number.isInteger(numColumns)) return numColumns;
                throw new Error("Invalid number of columns");
            },

            /**
             * Calculates the number of rows in the UI grid based on the tile height.
             */
            rows() {
                let numRows = Math.ceil(this.height.real() / this.tilesize);
                if (debug) console.log(`Calculated rows: ${numRows}`);
                if (Number.isInteger(numRows)) return numRows;
                throw new Error("Invalid number of rows");
            },

            /**
             * Reserves a specified position in the UI grid.
             * Adds the position to the reserved list to prevent other elements from being placed at the same coordinates.
             * @param {number} x - The x-coordinate of the position to reserve.
             * @param {number} y - The y-coordinate of the position to reserve.
             * @param {String[]} party - The identifier for who is reserving the position.
             */
            reservePos(x, y, party) {
                // Check if the position is already reserved
                if (this.reservations.find(pos => pos.x === x && pos.y === y)) return;
                this.reservations.push({ x: x, y: y, party: party });
                if (debug) console.log(`Reserved position for ${this.reservations.slice(-1).map(pos => [pos.x, pos.y, pos.party])[0]}`);
            },

            /**
             * Returns the width and height of reserved positions
             */
            getReservedBoundingBox() {
                let a = Math.min(this.MAX_UI_SIZE, this.tilesize + Math.max.apply(null, this.reservations.map(pos => pos.x)));
                let b = Math.min(this.MAX_UI_SIZE, this.tilesize + Math.max.apply(null, this.reservations.map(pos => pos.y)))
                if (debug) console.log(`UI Size: ${[a, b]}`);
                return { width: a, height: b };
            },

            /**
             * Controls a grid structure for the UI.
             * This function takes an index and a tile size and returns the x and y position of the tile.
             * @param {number} index - The index of the tile.
             * @param {String[]} party - The identifier for who is reserving the position.
             * @param {boolean} [makeReservation]
             * @param {number} [col]
             * @param {number} [row]
             */
            getTilePosition(index, party, makeReservation, col, row) {
                let slot = { x: 0, y: 0 };
                let orgIndex = index;
                if (debug) console.log(`Getting tile position for: ${party}`);

                // Find next available position
                while (this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y)) {
                    index++;
                    slot.x = (index % col) * this.tilesize;
                    slot.y = Math.floor(index / col) * this.tilesize;
                    if ([slot.x, slot.y].some(pos => pos > this.MAX_UI_SIZE)) throw new Error("Too many UI elements");
                }

                // Reserve this position
                if (makeReservation) this.reservePos(slot.x, slot.y, party);

                if (debug) console.log(`Final Pos: ${orgIndex} -> ${index}: ${[slot.x, slot.y]}`);

                return slot;
            },

            /**
             * Holds the initial position.
             */
            intialPos: undefined,
            /**
             * Holds the max column and row size of the UI.
             */
            maxDim: undefined,

            /**
             * Avoids vertically expanding the UI.
             * @param {number} index
             * @param {String[]} party
             * @param {number} [col]
             * @param {number} [row]
             */
            getNewPos(index, party, col, row) {
                // Some things only need to be done once
                if (debug) console.log(`Index: ${index}`);
                if (index == 0) this.intialPos = this.getTilePosition(index, party, false, col, row);
                this.maxDim = this.maxDim || {
                    col: Math.floor(this.MAX_UI_SIZE / this.tilesize),
                    row: Math.floor(this.MAX_UI_SIZE / this.tilesize)
                };
                let max = this.maxDim;
                let slot = this.intialPos;
                // Find next available position
                while (this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y)) {
                    index++;
                    slot.x = (index % max.col) * this.tilesize;
                    slot.y = Math.floor(index / max.col) * this.tilesize;
                    if ([slot.x, slot.y].some(pos => pos > this.MAX_UI_SIZE)) throw new Error("Too many UI elements");
                }

                this.reservePos(slot.x, slot.y, party);
                return slot;
            }
        };
    }

    /**
     * Constructs a recipe object from a JSON object and some parameters.
     * @param {string} MACH_TYPE - The type of the machine.
     * @param {$KubeRecipe_} recipe - The JSON object containing the recipe.
     * @param {number} XP_PER - The number of experience points per experience nugget.
     * @param {number} XP_MULTI - The multiplier for the experience points given by the recipe.
     * @param {string} XP_ID - The ID of the experience nugget item.
     * @param {number} MIN_TIME - The minimum processing time in ticks.
     * @param {number} TIME_MULTI - The multiplier for the processing time to get the boosted time.
     * @param {number} MIN_ENERGY_COST - The minimum energy cost in RF/t.
     */
    function constructRecipe(MACH_TYPE, recipe, XP_PER, XP_MULTI, XP_ID, MIN_TIME, TIME_MULTI, MIN_ENERGY_COST) {

        return {

            recipeJson: recipe.json,

            /** True json element type */
            $JsonElement: {
                element: JsonUtils.copy([])
            },

            /**
             * Converts a JSON string to an item object.
             * @param {string} strItemStack - The JSON string to convert.
             * @returns {{item: string, count: number, chance: number}}
             */
            jsonToItem(strItemStack) {
                /** @type {Object} */
                let raw = {}
                raw = JSON.parse(strItemStack);
                if (debug) console.log(`ORGINANL ITEM: ${strItemStack}`);

                // Check if 'item' or 'id' exists
                if ('item' in raw) {
                    // If 'item' is an object, we extract the 'id'
                    if (typeof raw.item === 'object' && raw.item !== null && 'id' in raw.item) {
                        raw.item = raw.item.id; // Replace the item object with the id
                    }
                } else if ('id' in raw) {
                    // If there's an 'id' but no 'item', assign the id to item
                    raw.item = raw.id;
                    delete raw.id;
                }

                // Fix count and chance
                raw.count = raw.count || 1;
                raw.chance = raw.chance || 1;

                if (debug) console.log(`PARSED ITEM: ${JSON.stringify(raw)}`);
                return raw;
            },

            /**
             * Stops typescript from complaining
             * It doesn't recognize tick duration type can be number
             * @param {number & $TickDuration_} any
             */
            toTick(any) {
                return any
            },

            /**
             * Retrieves the items produced by the recipe as an array of item objects.
             * @param {String[]} searchTerms - Keys to search for in the recipe JSON.
             */
            getItems(searchTerms) {
                let inspectorRecipes = chromaticFAN.machineType.get(MACH_TYPE).inspectorRecipes.get(`${recipe.path}`);
                if (debug) console.log(`Search Terms: ${searchTerms}`)
                // Retrieve raw data by filtering and mapping keys in the recipe JSON
                let rawIng = (
                    this.recipeJson.keySet().toArray()
                        .filter(prop => searchTerms.some(srch => prop.includes(srch)))
                        .map(key => this.recipeJson.get(key))
                        .map(i => Ingredient.of(`${i}`))
                )
                if (debug) console.log(`RawIng: ${rawIng}`)
                // If the machine has a custom retriever, use it
                let inspection = (
                    Object.keys(inspectorRecipes)
                        .filter(key => searchTerms.some(srch => key.includes(srch)))
                        .map(key => {
                            let ing = Ingredient.of(inspectorRecipes[key]);
                            if (ing.empty) {
                                // Search deeper to find the actual ingredient
                                let k = Object.keys(inspectorRecipes[key]).find(v => v.includes(key))
                                ing = Ingredient.of(inspectorRecipes[key][k])
                            }
                            // Return the ingredient as a JSON string
                            return ing
                            // @ts-expect-error Ingredient.of() can handle most types
                        }).map(v => Ingredient.of(v).asIngredient())
                )
                if (debug) console.log(`Inspection: ${inspection}`)
                // If the inspection is defined, use it, otherwise use the raw data
                let raw = inspection ? inspection : rawIng;
                // If no raw data is found, throw an error
                if (raw.some(ing => ing.empty)) {
                    throw new Error(`No items found for search terms: ${searchTerms.join(", ")}`);
                }
                // Return the ingredient
                return raw

            },

            cfgCatalyst() {
                // Retrieve all catalyst as an array of JSON elements
                return this.getItems([
                    "catalyst"
                ])
            },


            cfgIngredients() {
                // Retrieve all ingredients as an array of JSON elements
                return this.getItems([
                    "input",
                    "ingredient"
                ])

            },

            cfgResults() {
                // Retrieve all results as an array of JSON elements
                return this.getItems([
                    "output",
                    "result"
                ])


            },

            /**
             * Returns the number of experience Nuggets that will be created.
             * Also adds the remaining extra.
             * @param {$Ingredient_[]} [results]
             */
            xpNuggets(results) {

                let raw = (
                    this.recipeJson.keySet().toArray()
                        .filter(key => (
                            key.includes("xp") ||
                            key.includes("experience")))
                        .map(key => this.recipeJson.get(key))
                        .find(value => value)
                )

                // We give XP_MULTI the amount of xp here
                let experience = raw ? raw.asNumber * XP_MULTI : 0

                // Nuggets from the recipe
                let recipeNuggets = results.map(v => Ingredient.of(v)).filter(ing => {
                    // A result can only be a xp nugget if every stack if the ingredient matches.
                    // @ts-expect-error We can pass a item stack to Ingredient.of
                    ing.stackArray.every(stacks => Ingredient.of(stacks).test(XP_ID))
                })

                // Convert the recipe experince to nuggets and add them to the count.
                let nugCount = recipeNuggets.length
                nugCount += Math.round(experience / XP_PER)
                if (!nugCount) return []
                let $ItemStackHandler = Java.loadClass("net.neoforged.neoforge.items.ItemStackHandler");
                let handler = new $ItemStackHandler(nugCount); // In case the item only stacks to one
                let stack = Item.of(XP_ID)
                // @ts-expect-error Itemstacks- you know. Why do I keep ts check on?
                handler.insertItem(0, stack, false)
                let nuggets = handler.allItems
                return Array.from(nuggets).filter(i => !i.empty)
            },

            /** 
             * Returns the processing time in ticks for the recipe
             */
            proccessingTime() {
                // MIN_TIME is ticks, a single second.
                let processingTime = MIN_TIME;

                // Find the processing time
                let raw = (
                    this.recipeJson.keySet().toArray()
                        .filter(key => (key.includes("time") || key.includes("duration")))
                        .map(key => this.recipeJson.get(key))
                        .find(value => value)
                )

                if (raw) processingTime = raw.asNumber

                if (debug) console.log(`Processing time: ${processingTime}`)

                return processingTime
            },

            /** 
             * Eight times faster than the processing time
             */
            boostedTime() {
                return this.toTick(Math.round(this.proccessingTime() / TIME_MULTI))
            },

            /**
             * The count is calculated by summing the count of each result object.
             */
            sumItemcount() {
                return this.cfgResults().length
            },

            /**
             * The energy cost of this recipe in RF/t.
             * The cost is calculated by multiplying the number of results by the processing time in ticks.
             * The result count is the actual number of items produced by the recipe.
             * The result is then clamped to a minimum of 1 RF/t.
             * @param {$ItemStack_[]} arrXp
             */
            energyCost(arrXp) {
                let sumXp = arrXp.reduce((a, b) => a + Item.of(b).count, 0);
                let sumCost = this.sumItemcount() + (sumXp * XP_PER);
                if (debug) console.log(`Sum Cost: ${sumCost}, XP per nugget: ${XP_PER}, Sum XP: ${sumXp}`);
                let energyCost = sumCost * this.proccessingTime();
                if (debug) console.log(`Energy Cost: ${energyCost}`);
                // Keep even integers
                return Math.max(MIN_ENERGY_COST, Math.ceil(((energyCost / 20) + MIN_ENERGY_COST) / 2) * 2);
            }
        }
    }

    /**
     * Construcuts the foundation for a machine to accept recipes.
     * @param {string} MACH_ID - The ID of the machine.
     * @param {$RecipesKubeEvent_} MACH_EVENT - The Recipe Event
     */
    function structMACH(MACH_ID, MACH_EVENT) {
        return {

            /**
             * A map of recipes by their path.
             * @type {Map<string, {
             * path: string,
             * XP_ID: string,
             * time: number & $TickDuration_,
             * energy: number,
             * catalysts: $Ingredient_[],
             * nuggets: $ItemStack_[],
             * ingredients: $Ingredient_[],
             * results: $Ingredient_[]
             * }>}
             */
            recipeMap: new Map(),

            /**
             * Create Mod-like check if a recipe can be automated or not.
             * @param {$KubeRecipe_} recipe - The recipe to check.
             */
            canBeAutomated(recipe) {
                return !(recipe.getPath().endsWith("_manual_only"))
            },

            /**
             * Initializes the recipes
             * Returns the input that was collected
             * @param {string} MACH_TYPE - The type of the machine
             * @param {$KubeRecipe_} recipe 
             */
            init(MACH_TYPE, recipe) {
                if (!(this.canBeAutomated(recipe))) return
                if (debug) {
                    console.log(`DOING RECIPE: ${recipe.getId()}`)
                    console.log(`With JSON: ${recipe.json.toString()}`)
                }
                let XP_ID = "create:experience_nugget";
                let cfgRecipe = constructRecipe(MACH_TYPE, recipe, 3, 2, XP_ID, 20, 8, 80);
                let boostedTime = cfgRecipe.boostedTime();
                let catalyst = cfgRecipe.cfgCatalyst();
                let results = cfgRecipe.cfgResults();
                // @ts-expect-error $Ingredient != $Ingredient$$Type
                let arryXPING = cfgRecipe.xpNuggets(results);
                // @ts-expect-error $ItemStack != $ItemStack$$Type
                let energyCost = cfgRecipe.energyCost(arryXPING);
                let data = {
                    catalysts: catalyst,
                    energy: energyCost,
                    ingredients: cfgRecipe.cfgIngredients(),
                    nuggets: arryXPING,
                    path: `${recipe.path}`,
                    results: results,
                    time: boostedTime,
                    XP_ID: XP_ID
                }
                // @ts-expect-error
                this.recipeMap.set(`${recipe.path}`, data)
            },

            /**
             * Iterates over the unifyMap and creates a machine for each entry.
             */
            doRecipes() {
                this.recipeMap.forEach((recipe, key) => {

                    // If any part of the recipe is missing throw error.
                    let badparts = Object.keys(recipe).filter(key => !recipe[key])
                    if (badparts.length) throw new Error
                        (`Parts of this ${key} recipe are missing, Missing: ${badparts}`)

                    let ui = constuctUI();
                    let XP_ID = "create:experience_nugget";

                    let boostedTime = recipe.time
                    let machine = MACH_EVENT.recipes.modular_machinery_reborn.machine_recipe(MACH_ID, boostedTime);

                    let ingredient = recipe.ingredients.map(v => Ingredient.of(v)).find(v => !v.empty)
                    let catalyst = recipe.catalysts.map(v => Ingredient.of(v)).find(v => !v.empty)
                    if (debug) console.log(`Parsing Key: ${JSON.stringify(ingredient)}`)
                    if (!catalyst) throw new Error(`No catalyst found for recipe: ${recipe.path}`)
                    // @ts-expect-error This can handle ingredients despite what ts says
                    machine.requireItem(ingredient, 1, 20, 0);
                    // Add the catalyst ingredients to the UI. IT is not consumed, but it is required.
                    // @ts-expect-error This can handle ingredients despite what ts says
                    machine.requireItem(catalyst, 0, 40, 0);


                    let arryResults = recipe.results

                    let cols = ui.columns();
                    let rows = ui.rows();
                    let specialTopSlots = 4;
                    let specialCols = 1;

                    // For each specialTopSlots
                    for (let colIndex = 0; colIndex < specialTopSlots; colIndex++) {
                        ui.reservePos(colIndex * ui.tilesize, 0, ["Top Row"]);
                    }

                    // For specialCols column.
                    for (let cIndex = 0; cIndex < specialCols; cIndex++) {
                        /**
                         * Reserve all the slots in that column
                         */
                        for (let rIndex = 0; rIndex < rows; rIndex++) {
                            ui.reservePos(cIndex, rIndex * ui.tilesize, [`Column ${cIndex}`]);
                        }
                    }

                    // Add the items to be produced, and their chances to the UI.
                    arryResults
                        // Filter out the XP_ID
                        .forEach((obItem, index) => {
                            // A new position for the item, and then produce the item
                            let pos = ui.getNewPos(index, [`Result ${JSON.stringify(obItem)}`], cols, rows)
                            if (debug) console.log(`Adding item: ${JSON.stringify(obItem)} at ${pos.x}, ${pos.y}`)
                            // @ts-expect-error This can handle ingredients despite what ts says
                            machine.produceItem(obItem, 1, pos.x, pos.y)
                        })

                    machine.requireEnergy(recipe.energy, 0, 0)

                    let dim = ui.getReservedBoundingBox()
                    machine.width(dim.width)
                    machine.height(dim.height)

                    // Placing the progress bar just next to the required item.
                    let posProgress = { x: 55, y: 0 }
                    machine.progressX(posProgress.x)
                    machine.progressY(posProgress.y)

                    // Display the reserved postions
                    if (debug) {
                        console.log('Reserved positions:');
                        console.log(ui.reservations.map(pos => [pos.x, pos.y, pos.party]).join('\n'));
                    }


                });


            }
        }
    };

    /**
     * A front facing function to assign machine recipes
     * @param {$RecipesKubeEvent_} event
     * @param {string} MACH_TYPE
     * @param {$RecipeFilter_} MACH_RECIPE_FILTER
     */
    function recipesMACH(event, MACH_TYPE, MACH_RECIPE_FILTER) {
        let MACH_ID = chromaticFAN.machineType.get(MACH_TYPE).id;
        let fan = structMACH(MACH_ID, event);
        event.forEachRecipe(MACH_RECIPE_FILTER, (recipe) => {
            let isWorthy = chromaticFAN.machineType.get(MACH_TYPE).inspector(event, recipe);
            if (!isWorthy) {
                if (debug) console.log(`Recipe ${recipe.getId()} is not worthy for ${MACH_TYPE}`);
                return;
            }
            fan.init(MACH_TYPE, recipe);
        })
        if (debug) console.log(`Finalizing Unification`)
        let recipe = JSON.stringify(Array.from(fan.recipeMap.entries())[0][1]);
        if (debug) console.log(`A recipe: ${recipe}`)
        fan.doRecipes();
    }

    /**
     * Constructs and returns an object representing a machine builder for Chromatic Fans.
     * @param {string} MACH_ID - The unique identifier for the machine to be built.
     * @param {string} traitItem - The item to be used as a trait for the machine.
     * @returns An object containing machine configurations and a method
     * to build the machine.
     */
    function machBuilder(MACH_ID, traitItem) {

        let bannedBlocks = [""];
        let bannedFluids = [""];
        let bannedItems = [""];
        return {
            baseMachineID: MACH_ID,
            traitItem: traitItem,
            machineType: new Map([
                [
                    "coloring", {
                        id: MACH_ID.concat("_coloring"), name: "Chromatic Encased Fan - Coloring", color: Color.rgba(245, 251, 252, 0.99),
                        coreItem: "#c:buckets/dye", coreBlock: "minecraft:cauldron", model: "minecraft:white_glazed_terracotta",
                        restrictedBlocks: bannedBlocks, restrictedFluids: bannedFluids, restrictedItems: bannedItems.concat(["minecraft:cauldron"]),
                        /**
                         * The filter that is used in the forEachRecipe function.
                         */
                        inspectorFilter: {
                            input: ["#c:dyes", "#c:buckets/dye"],
                            or: [{ type: "minecraft:crafting_shaped" }, { type: "minecraft:crafting_shapeless" }]
                        },
                        /**
                         * A map of generated recipes from the inspector function.
                         * @type {Map<string, {
                         * recipe: $KubeRecipe_,
                         * MACH_TYPE: string,
                         * result: $ItemStack_,
                         * ingredient: $Ingredient_,
                         * catalyst: {
                            * allCatIng: $Ingredient_
                            * dyeCatIng: $Ingredient_
                            * buckCatIng: $Ingredient_
                            * allRecipeIngs(): $Ingredient_[]
                            * recipeIngs: $Ingredient_[]
                            * dyeIngs: $Ingredient_[]
                            * buckNamespace: string
                            * catalystIng: $Ingredient_[]
                         * }
                         * }>}
                         */
                        inspectorRecipes: new Map(),
                        /**
                         * Extra Filtering for recipes.
                         * @param {$RecipesKubeEvent_} event - The event to handle recipes
                         * @param {$KubeRecipe_} recipe - The recipe to handle
                         * @returns - Whether the recipe should be handled by this machine
                         */
                        inspector(event, recipe) {
                            let catalyst = {}
                            catalyst["allCatIng"] = Ingredient.of(["#c:dyes", "#c:buckets/dye"])
                            catalyst["dyeCatIng"] = Ingredient.of("#c:dyes")
                            catalyst["buckCatIng"] = Ingredient.of("#c:buckets/dye")
                            if (recipe.getOriginalRecipeResult().count != 8 && recipe.getOriginalRecipeResult().count != 1) {
                                return false;
                            }
                            
                            /** Minimized Ingredients including dyes */
                            catalyst["allRecipeIngs"] = () => {
                                return {
                                    minimized: () => {
                                        /** A map for the filtering of ingredients */
                                        let combMap = new Set();
                                        return recipe.getOriginalRecipeIngredients().toArray()
                                            .map(i => Ingredient.of(i))
                                            .filter(i => !(i.empty))
                                            .filter(i => {
                                                // Filter out duplicate ingredients
                                                let key = String(i.toJson());
                                                if (combMap.has(key)) return false;
                                                combMap.add(key);
                                                return true;
                                            })
                                    },

                                    normal: () => {
                                        return recipe.getOriginalRecipeIngredients().toArray()
                                            .map(i => Ingredient.of(i))
                                            .filter(i => !(i.empty))
                                    }
                                }
                            };

                            // For normal coloring recipes:
                            // 1 Uncolored + 1 Dye = 2 | 8 Uncolored + 1 Dye = 9
                            // Therfore, there can only be nine or two total ingredients.
                            if (!([2,9].indexOf(catalyst.allRecipeIngs().normal().length) != -1)) return false;


                            /** Minimized Ingredients excluding dyes */
                            catalyst["recipeIngs"] = catalyst.allRecipeIngs().minimized().filter(i => {
                                // For a ingredient to not be a dye, all stacks must fail the DYE_SET test
                                return i.stackArray.every(stack => !(catalyst.allCatIng.test(stack)));
                            })
                            catalyst["dyeIngs"] = catalyst.allRecipeIngs().minimized().filter(i => {
                                // For a ingredient to be a dye, all stacks must pass the DYE_SET test
                                return i.stackArray.every(stack => catalyst.allCatIng.test(stack));
                            })

                            // If more than one dye ingredient is present, we don't handle it
                            if (catalyst.dyeIngs.length > 1) return false;
                            // There can only be one coloured ingredient in the recipe
                            if (catalyst.recipeIngs.length > 1) return false;

                            catalyst["buckNamespace"] = catalyst.buckCatIng.stacks.first.idLocation.namespace
                            // Convert the dye in the recipe to a bucket
                            catalyst["catalystIng"] = catalyst.dyeIngs.map(ing => {
                                // Ingredient is already a bucket
                                let isBucket = ing.stackArray.every(stack => catalyst.buckCatIng.test(stack))
                                let isDYE = ing.stackArray.every(stack => catalyst.dyeCatIng.test(stack))
                                if (isBucket && !isDYE) return
                                // If the ingredient is a tag, we need to convert it to a bucket tag
                                let isTag = `${ing.toJson()}`.includes("{tag:")
                                if (debug) console.log(`Is Bucket: ${isBucket}, Is Dye: ${isDYE}, Is Tag: ${isTag} for ${ing.toJson()}`)
                                // Ingredient is a dye, convert it to a bucket
                                if (isDYE) {
                                    // Convert the dye ingredient to a bucket
                                    let fs = ing.stackArray.map(stack => Fluid.of(`${catalyst.buckNamespace}:${stack.idLocation.path}`))
                                        .map(f => {
                                            // Converting the bucket to a tag or item
                                            let item = (f.asHolder().value().bucket)
                                            let tag = (isTag ? (`#c:buckets/dye/${f.idLocation.path.replace("_dye", "")}`) : null);
                                            let final = (tag ? tag : item);
                                            // Return the ingredient of the bucket
                                            if (debug) console.log(`Tag or Item: ${final}`)
                                            return Ingredient.of(`${final}`)
                                        });
                                    if (debug) console.log(`Converting dye ingredient ${ing.toJson()} to bucket: ${fs.map(f => f.toJson()).join(", ")}`)
                                    return fs.find(v => v)
                                }
                            }).find(v => v)

                            // What recipe is this?
                            if (debug) console.log(`Result: ${recipe.getOriginalRecipeResult().toJson()}`)
                            if (debug) console.log(`Path: ${recipe.path}`)
                            if (debug) console.log(`Ingredients: ${catalyst.allRecipeIngs().minimized().map(i => i.toJson()).join(", ")}
                            Excluded: ${catalyst.recipeIngs.map(i => i.toJson()).join(", ")}
                            DyePresent: ${catalyst.dyeIngs.map(i => i.toJson()).join(", ")}`)

                            if (debug) console.log(`\n`)
                            // Add the recipe to the inspectorRecipes map
                            this.inspectorRecipes.set(`${recipe.path}`, {
                                recipe: recipe,
                                MACH_TYPE: "coloring",
                                // Stil don't know why typescript doesn't like this
                                // @ts-expect-error $ItemStack$$Type != $ItemStack
                                result: recipe.getOriginalRecipeResult(),
                                // @ts-expect-error $Ingredient$$Type != $Ingredient
                                ingredient: catalyst.recipeIngs[0],
                                // This has carefully named properties to avoid collisions when the recipe init wants the catalyst
                                // @ts-expect-error $Ingredient$$Type != $Ingredient inside the object
                                catalyst: catalyst
                            })
                            return true;
                        },
                        gateItem: "createmechanisms:rubber_mechanism"
                    },
                ]
            ]),

            /**
             * Converts a fluid bucket item to its fluid equivalent.
             * @param {string} item - The item ID of the fluid bucket
             * @returns The fluid equivalent of the item, or null if item is not a fluid bucket
             */
            fluidItem(item) {
                let f = Fluid.of(Item.of(item).id.replace("_bucket", ""))
                if (f) return f;
                else return null;
            },

            /**
             * Handles figuring out if something is banned.
             * @param {string} coreFilter - The filter identifier
             * @param {"Blocks" | "Fluids" | "Items"} filterType - The type of filter
             * @param {string} MACH_TYPE - The machine type for special treatment
             * @returns A boolean representing whether something is banned
             */
            isBanned(coreFilter, filterType, MACH_TYPE) {
                let machineType = this.machineType.get(MACH_TYPE)
                return machineType[`restricted${filterType}`].some(banned => banned == coreFilter);
            },

            /**
             * Takes a core block string and returns an array of strings representing valid ingredient IDs.
             * @param {string} coreFilter - The filter identifier
             * @param {string} MACH_TYPE - The machine type for special treatment
             * @returns An array of strings representing valid ingredient IDs
             */
            parseBlocktoItems(coreFilter, MACH_TYPE) {
                let tagFilter = coreFilter.replace("#", "")
                let items =
                    [].concat(Item.getTypeList().stream()
                        .filter(strItem => !this.isBanned(strItem, "Items", MACH_TYPE))
                        .filter(strItem => {
                            let obj = {
                                fluid: this.fluidItem(strItem),
                                stack: Item.of(strItem)
                            }

                            // Filter the item based on wheter its block or fluid has the tag or is the filter.
                            let isValid = () => [
                                Item.of(strItem).hasTag(tagFilter), (obj.stack.id == coreFilter),
                                Item.of(strItem).block && (obj.stack.block.hasTag(tagFilter) || obj.stack.block.id == coreFilter),
                                obj.fluid && (obj.fluid.hasTag(tagFilter) || obj.fluid.id == coreFilter)
                            ].some(check => check)


                            // Return the result
                            return isValid()
                        })
                        .map(a => String(a))
                        .toList()
                    )

                items = Array.from(new Set([].concat(items)))
                return items
            },

            /**
             * Returns fluidstate from a block filter.
             * @param {string} coreFilter - The filter identifier
             * @param {string} MACH_TYPE - The machine type for special treatment
             * @param {boolean} blockOnly - Whether to only return full fluid blocks
             */
            fluidStates(coreFilter, MACH_TYPE, blockOnly) {
                let tagFilter = coreFilter.replace("#", "")
                let fluidBlockstates =
                    [].concat(Fluid.getTypes().stream()
                        .filter(strFluid => !this.isBanned(strFluid, "Fluids", MACH_TYPE))
                        .filter(strFluid => {
                            let fluid = Fluid.of(strFluid)

                            let isValid = () => [
                                fluid.hasTag(tagFilter),
                                fluid.id == coreFilter
                            ].some(check => check)

                            return isValid()
                        })
                        .map(strId => Fluid.of(strId).fluid.defaultFluidState().createLegacyBlock())
                        .map(state => `${state.id}${state.properties.stream().map(p => {
                            if (p.name == "level") return `${p.name}=${blockOnly ? 0 : p.value(state).value()}`
                            return p.value(state)
                        }).toList()}`)
                        .toList()
                    )

                return Array.from(new Set([].concat(fluidBlockstates)))
            },

            /**
             * Returns blockstates from a block filter.
             * Does not respect fixed coordinates
             * @param {string} coreFilter
             * @param {string} MACH_TYPE - The machine type for special treatment
             */
            blockstates(coreFilter, MACH_TYPE) {
                let tagFilter = coreFilter.replace("#", "")
                let blockstates =
                    [].concat(Block.getTypeList().stream()
                        .filter(strBlock => !this.isBanned(strBlock, "Blocks", MACH_TYPE))
                        .filter(strBlock => {
                            let block = Block.getBlock(strBlock)

                            let isValid = () => [
                                block.hasTag(tagFilter),
                                block.id == coreFilter
                            ].some(b => b)

                            return isValid()
                        })
                        .toList()
                    )

                return Array.from(new Set([].concat(blockstates)))
            },

            /**
             * Returns all states from a block filter.
             * @param {string} coreFilter
             * @param {string} MACH_TYPE - The machine type for special treatment
             */
            allBlockStates(coreFilter, MACH_TYPE) {
                let states = [].concat(this.blockstates(coreFilter, MACH_TYPE), this.fluidStates(coreFilter, MACH_TYPE, true))
                if (states.length > 40) throw new Error("Too many states, try a different filter")
                return Array.from(new Set([].concat(states)))
            },

            /**
             * Build a fan machine with a core
             * @param {$MachineBuilderJS$MachineKubeEvent_} MACH_EVENT 
             * @param {string} MACH_TYPE
             */
            buildMACH(MACH_EVENT, MACH_TYPE) {
                let machineType = this.machineType.get(MACH_TYPE)
                let builder = MACH_EVENT.create(machineType.id)
                builder.name(machineType.name)
                let color = machineType.color.createTextColor().toHexString()
                builder.color(color)
                builder.controllerModel(ControllerModel.of(machineType.model))
                builder.structure(
                    MMRStructureBuilder.create()
                        .pattern([
                            // Each array represents a row from left to right, front to back
                            // m is the controller, a space is available space.
                            [" m ", "   ", "   "],
                            ["   ", " a ", "   "],
                            ["   ", "   ", "   "]
                        ])
                        .keys({
                            "a": this.allBlockStates(machineType.coreBlock, MACH_TYPE),
                        })
                );
                // TODO: SOUNDS
                // builder.sound()
            }
        }
    };

    /** The Chromatic Fan */
    let chromaticFAN = machBuilder("mmr:chromatic_fan", "create:encased_fan");

    MMREvents.machines(event => {
        // TODO: CONTROLLER MODEL
        // TODO: MACHINE SOUNDS
        // TODO: MACHINE RECIPE TYPES (BLASTING, HAUNTING, ETC)

        /** All types of chromatic fans */
        chromaticFAN.machineType.forEach((_, typeKey) => {
            chromaticFAN.buildMACH(event, typeKey);
        })
    })

    ServerEvents.recipes(event => {

        chromaticFAN.machineType.forEach((type, typeKey) => {
            recipesMACH(event, typeKey, type.inspectorFilter);
            // ===============
            // Machine Controller =
            // 8 Encased Fan
            // 1 Machine Core (And if fluid, a bucket.)
            // Todo: Get texture for chromatic Compound. Done, it works with CreateCompounds.
            // Todo: Block Models for machine recipe types.

            // Scripts:
            // Todo: Test kubeJS smelting recipes to be grabbed by fan type.
            // Todo: Test coloring (modded) fan processing types.
            // Todo: Sounds, Sounds! Feedback is important.

            // ===============

            event.shaped(
                `modular_machinery_reborn:controller[modular_machinery_reborn:machine="${type.id}"]`, // arg 1: output
                [
                    'aaa',
                    'abc', // arg 2: the shape (array of strings)
                    'aaa'
                ],
                {
                    a: chromaticFAN.traitItem, // The defining trait of the chromatic fan.
                    c: type.gateItem || chromaticFAN.traitItem, // A item that will be used as a gate
                    b: [].concat(type.coreItem, chromaticFAN.parseBlocktoItems(type.coreBlock, typeKey)).filter(a => a),  //arg 3: the mapping object
                }
            )

        })


    });


})();