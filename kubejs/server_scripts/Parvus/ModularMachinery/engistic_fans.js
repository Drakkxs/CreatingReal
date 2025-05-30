// priority: -10
// requires: create
// requires: createmechanisms
// requires: modular_machinery_reborn
// @ts-check
// An upgrade to create's encased fan.


// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = false

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

                if (debug) console.log(`Final Pos: ${orgIndex} -> ${index}: ${[ slot.x, slot.y ]}`);

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
     * @param {$KubeRecipe_} recipe - The JSON object containing the recipe.
     * @param {number} XP_PER - The number of experience points per experience nugget.
     * @param {number} XP_MULTI - The multiplier for the experience points given by the recipe.
     * @param {string} XP_ID - The ID of the experience nugget item.
     * @param {number} MIN_TIME - The minimum processing time in ticks.
     * @param {number} TIME_MULTI - The multiplier for the processing time to get the boosted time.
     * @param {number} MIN_ENERGY_COST - The minimum energy cost in RF/t.
     */
    function constructRecipe(recipe, XP_PER, XP_MULTI, XP_ID, MIN_TIME, TIME_MULTI, MIN_ENERGY_COST) {
        
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
         * @param {String[]} keys - Keys to search for in the recipe JSON.
         */
        getItems(keys) {
            // Retrieve raw data by filtering and mapping keys in the recipe JSON
            let raw = (
                this.recipeJson.keySet().toArray()
                .filter(prop => keys.some(srch => prop.includes(srch)))
                .map(key => this.recipeJson.get(key))
                .find(value => value)
            );

            if (debug) console.log(`Raw Results for ${keys}: ${raw.toString()}`);

            let json;
            // Determine if the raw data is a JSON Array or Object
            if (raw.isJsonArray()) {
                json = Array.of(raw.asJsonArray.asList().toArray()).reduce((a, b) => a.concat(b), []);
            } else if (raw.isJsonObject()) {
                json = [raw.asJsonObject];
            };

            if (debug) console.log(`JSON Elements: ${json.toString()}`);

            // Map the JSON elements to item objects
            let final = json.map(element => {
                let objITEM = this.jsonToItem(element.toString());
                if (debug) console.log(`Mapped Item: ${JSON.stringify(objITEM)}`);
                return objITEM;
            }).reduce((acc, oriItem) => {
                let stacks = Ingredient.of(oriItem).stacks.toArray()
                    .map(stack => this.jsonToItem(stack.toJson().toString()))
                    // Assign chance
                    .map(stack => {
                        return {
                            item: stack.item,
                            count: stack.count,
                            chance: oriItem.chance
                        }
                    });
                if (debug) console.log(`Stacks: ${stacks.toString()}`);

                return acc.concat(stacks);
            }, []);

            if (debug) console.log(`Final Found: ${JSON.stringify(final)}`);
            if (!final.length) throw new Error("No final found");
            return final;


        },


        arrayIngredients() {
            // Retrieve all ingredients as an array of JSON elements
            return this.getItems([
                "input",
                "ingredient"
            ]);
            
            
        },

        arrayResults() {
            // Retrieve all results as an array of JSON elements
            return this.getItems([
                "output",
                "result"
            ]);


        },

        /**
         * Returns the number of experience Nuggets that will be created.
         * Also adds the remaining extra.
         * @param {{chance: number, item: string, count: number}[]} [results]
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

            // We give double the amount of xp here to compete with the crushers
            let experience = raw ? raw.asNumber * XP_MULTI : 0

            // Nuggets from the recipe
            let recipeNuggets = results.filter(item => item.item === XP_ID)
            

            // Caluclated experience does not include recipe nuggets
            if (debug && experience) console.log(`Calculated Experience: ${experience}`)
            if (debug && recipeNuggets.length) console.log(`Recipe Nuggets: ${JSON.stringify(recipeNuggets)}`)
            // One create experince nugget gives XP_PER xp points
            let nuggets = [
                // The amount of guaranteed nuggets
                {chance: 1, item: XP_ID, count: Math.floor(experience / XP_PER)},

                // The chance of extra nuggets
                {chance: Math.round(((experience % XP_PER) / XP_PER) * 100) / 100, item: XP_ID, count: 1}
            ].map((nugget, i) => {

                // If this is the first nugget
                if (i == 0) {
                    // Add the recipe nuggets that are guaranteed
                    nugget.count += (
                        recipeNuggets
                        .filter((nugget) => nugget.chance && nugget.chance === 1)
                        .reduce((acc, xp) => acc + xp.count, 0)
                    )
                }

                return nugget
            }).concat(
                // Add the recipe nuggets that have a chance of being created
                recipeNuggets
                    .filter((nugget) => nugget.chance && nugget.chance < 1)
            )
            
            // Finally, filter out the nuggets that won't be created
            .filter((nugget) => (nugget.chance && nugget.count))

            if (debug && nuggets.length) console.log(`Made ${nuggets.length} nuggets`)

            // Return the array of nuggets
            return nuggets
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
            return (
                this.arrayResults()
                .reduce((a, b) => a + b.count, 0)
            )
        },
        
        /**
         * The energy cost of this recipe in RF/t.
         * The cost is calculated by multiplying the number of results by the processing time in ticks.
         * The result count is the actual number of items produced by the recipe.
         * The result is then clamped to a minimum of 1 RF/t.
         * @param {Array} arrXp
         */
        energyCost(arrXp) {
            let sumXp = arrXp.reduce((a, b) => a + b.count, 0);
            let sumCost = this.sumItemcount() + (sumXp * XP_PER);
            if (debug) console.log(`Sum Cost: ${sumCost}, XP per nugget: ${XP_PER}, Sum XP: ${sumXp}`);
            let energyCost = sumCost * this.proccessingTime();
            if (debug) console.log(`Energy Cost: ${energyCost}`);
            // Keep even integers
            return Math.max(MIN_ENERGY_COST, Math.ceil(((energyCost / 20) + MIN_ENERGY_COST) / 2) * 2);
        }
    }}

    /**
     * Construcuts the foundation for a machine to accept recipes.
     * @param {string} MACH_ID - The ID of the machine.
     * @param {$RecipesKubeEvent_} MACH_EVENT - The Recipe Event
     */
    function structMACH(MACH_ID, MACH_EVENT) {return {

        /**
         * A map of recipes by their input. The keys are the input items or tags as strings.
         * @type {Map<string, {
         * time: number & $TickDuration_,
         * energy: number,
         * inputCount: number,
         * inputChance: number,
         * results: {item: string, count: number, chance: number}[]}>}
         */
        unifyMap: new Map(),

        /**
         * Create Mod-like check if a recipe can be automated or not.
         * @param {$KubeRecipe_} recipe - The recipe to check.
         */
        canBeAutomated(recipe) {
            return !(recipe.getPath().endsWith("_manual_only"))
        },

        /**
         * Sets the value for the given ingredient in the unifyMap.
         * If the key does not exist, it creates a new entry.
         * If the key does exist, it adds the values given to the existing entry.
         * @param {{item: string, count: number, chance: number}} ingredient - The ingredient to set in the unifyMap
         * @param {number & $TickDuration_} [time] - The time to add to the existing entry
         * @param {number} [energy] - The energy to add to the existing entry
         * @param {{item: string, count: number, chance: number}[]} [results] - The array of results to add to the existing entry
         */
        setMap(ingredient, time, energy, results) {
            if (debug) console.log(`Key to parse: ${JSON.stringify(ingredient)}`)
            let newTime = time || 0
            let newEnergy = energy || 0
            let newCount = ingredient.count
            let newResults = results || []

            if (typeof ingredient.item !== "string") throw new Error
            (`Why is ItemID not a string? ${ingredient.item} is a ${typeof ingredient.item}`)

            let oriMap = this.unifyMap.get(ingredient.item)
            let newMap;
            if (!oriMap) {
                if (debug) console.log(`Creating new map for ${ingredient.item}`)
                newMap = {
                    time: newTime,
                    energy: newEnergy,
                    inputCount: newCount,
                    inputChance: ingredient.chance,
                    results: newResults,
                };
            } else if (oriMap) {
                if (debug) console.log(`Updating existing map for ${ingredient.item}`) 
                
                // Create a new map of results with the same item combined
                let cleanResults = oriMap.results.concat(newResults).reduce((map, res) => {
                    if (debug) console.log(`Cleaning result: ${JSON.stringify(res)}`)
                    // If this isn't a valid item, ignore it
                    if (!Ingredient.of(res.item)) {
                        throw new Error(`Item |${res.item}| is not a valid item.`)
                    }


                    // Get the existing item with the same id or create a new one
                    let oriItem = map.get(res.item);
                    let newItem;
                    if (!oriItem) {
                        // If the item doesn't exist in the map, add it as is
                        newItem = res
                    } else if (oriItem.item === res.item) {
                        // If the item does exist, take the maximum of each value
                        newItem = {
                        item: res.item,
                        count: Math.max(oriItem.count, res.count),
                        chance: Math.max(oriItem.chance, res.chance)
                        }
                    }

                    // Add the new (or updated) item to the map
                    map.set(res.item, newItem)
                    return map;
                }, new Map());

                newMap = {
                    time: newTime + oriMap.time,
                    energy: newEnergy + oriMap.energy,
                    inputCount: Math.max(ingredient.count || 0, oriMap.inputCount),
                    inputChance: Math.max(ingredient.chance || 0, oriMap.inputChance),
                    results: Array.from(cleanResults.values()),
                };
            }
            
            // Update map
            this.unifyMap.set(ingredient.item, newMap);

            // Check
            if (debug) {
                if (!(this.unifyMap.has(ingredient.item))) throw new Error
                (`Could not find key: ${ingredient.item}, For: ${JSON.stringify(ingredient)}`)
                console.log(`Finished: ${ingredient.item} Map: ${Array.from(this.unifyMap.keys()).filter(key => key === ingredient.item).join(", ")}`)
            }

        },

        /**
         * Initializes the recipes
         * Returns the input that was collected
         * @param {$KubeRecipe_} recipe 
         */
        init(recipe) {
            if(!(this.canBeAutomated(recipe))) return
            if (debug) {
                console.log(`DOING RECIPE: ${recipe.getId()}`)
                console.log(`With JSON: ${recipe.json.toString()}`)
            }
            const XP_ID = "create:experience_nugget";
            let cfgRecipe = constructRecipe(recipe, 3, 2, XP_ID, 20, 8, 80);
            let boostedTime = cfgRecipe.boostedTime();


            let arryResults = cfgRecipe.arrayResults();
            let arryXpNuggets = cfgRecipe.xpNuggets(arryResults);
            let energyCost = cfgRecipe.energyCost(arryXpNuggets);

            for (let keyIngredient of cfgRecipe.arrayIngredients()) {

                // Add processing time
                this.setMap(keyIngredient, boostedTime);

                // Add the experience to the UI.
                arryXpNuggets
                .forEach((obXp) => {
                    // Add the item to the map
                    this.setMap(keyIngredient, null, null, [obXp])
                })

                // Add the items to be produced, and their chances to the UI.
                arryResults
                // Filter out the XP_ID
                .filter(obItem => obItem.item !== XP_ID)    
                .forEach((obItem, index) => {
                    // Add the item to the map
                    this.setMap(keyIngredient, null, null, [obItem])
                })
                this.setMap(keyIngredient, null, energyCost, null);

            }

        },

        /**
         * Iterates over the unifyMap and creates a machine for each entry.
         */
        doUnify() {
            this.unifyMap.forEach((recipe, key) => {

                // If any part of the recipe is missing throw error.
                let badparts = Object.keys(recipe).filter(key => !recipe[key])
                if (badparts.length) throw new Error
                (`Parts of this ${key} recipe are missing, Missing: ${badparts}`)

                let ui = constuctUI();
                let XP_ID = "create:experience_nugget";
                
                let boostedTime = recipe.time
                let machine = MACH_EVENT.recipes.modular_machinery_reborn.machine_recipe(MACH_ID, boostedTime);

                let inputIngredient = {item: key, count: recipe.inputCount, chance: recipe.inputChance}
                if (debug) console.log(`Parsing Key: ${JSON.stringify(inputIngredient)}`)

                machine.requireItem(inputIngredient, inputIngredient.chance, 20, 0);

                let arryResults = recipe.results
                let arryXpNuggets = recipe.results.filter(result => result.item === XP_ID)

                let cols = ui.columns();
                let rows = ui.rows();
                let specialTopSlots = 3;
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
                }}

                // Add the experience to the UI.
                arryXpNuggets
                .forEach((obXp, index) => {
                    let pos = ui.getNewPos(index, [`XP_ID ${JSON.stringify(obXp)}`], cols, rows)
                    if (debug) console.log(`Adding nugget: ${JSON.stringify(obXp)} with chance: ${obXp.chance} at ${pos.x}, ${pos.y}`)
                    machine.produceItem(`${obXp.count}x ${obXp.item}`, obXp.chance, pos.x, pos.y)

                })

                // Add the items to be produced, and their chances to the UI.
                arryResults
                // Filter out the XP_ID
                .filter(obItem => obItem.item !== XP_ID)
                .forEach((obItem, index) => {
                    
                    // A new position for the item, and then produce the item
                    let pos = ui.getNewPos(index, [`Result ${JSON.stringify(obItem)}`], cols, rows)
                    if (debug) console.log(`Adding item: ${JSON.stringify(obItem)} with chance: ${obItem.chance} at ${pos.x}, ${pos.y}`)
                    machine.produceItem(`${obItem.count}x ${obItem.item}`, obItem.chance, pos.x, pos.y)

                })

                machine.requireEnergy(recipe.energy, 0, 0)

                let dim = ui.getReservedBoundingBox()
                machine.width(dim.width)
                machine.height(dim.height)

                // Placing the progress bar just next to the required item.
                let posProgress = {x: 35, y: 0}
                machine.progressX(posProgress.x)
                machine.progressY(posProgress.y)

                // Display the reserved postions
                if (debug) {
                    console.log('Reserved positions:');
                    console.log(ui.reservations.map(pos => [pos.x, pos.y, pos.party]).join('\n'));
                }


            });


        }
    }};

    /**
     * A front facing function to assign machine recipes
     * @param {$RecipesKubeEvent_} event
     * @param {string} MACH_ID
     * @param {string[]} MACH_TYPES
     */
    function recipesMACH(event, MACH_ID, MACH_TYPES) {
        let fan = structMACH(MACH_ID, event);
        MACH_TYPES.forEach((value) => {
            event.forEachRecipe({type: value}, (recipe) => {
                fan.init(recipe)})
        });

        if (debug) console.log(`Finalizing Unification`)
        let recipe = JSON.stringify(Array.from(fan.unifyMap.entries())[0][1]);
        if (debug) console.log(`A recipe: ${recipe}`)
        fan.doUnify();
    }

    /**
     * Constructs and returns an object representing a machine builder for Engistic Fans.
     * @param {string} MACH_ID - The unique identifier for the machine to be built.
     * @param {string} traitItem - The item to be used as a trait for the machine.
     * @returns An object containing machine configurations and a method
     * to build the machine.
     */
    function machBuilder(MACH_ID, traitItem){
        
        let bannedBlocks = [
            "create:blaze_burner", 
            "create:lit_blaze_burner",
            "createaddition:liquid_blaze_burner",
            "create_enchantment_industry:blaze_forger",
            "create_enchantment_industry:blaze_enchanter"];
        let bannedFluids = [""];
        let bannedItems = ["create:empty_blaze_burner",];
        return {
        baseMachineID: MACH_ID,
        traitItem: traitItem,
        machineType: new Map([
            [
                "blasting", {
                    id: MACH_ID.concat("_blasting"), name: "Engistic Encased Fan - Blasting", color: Color.rgba(52, 56, 62, 0.99),
                    coreItem: null, coreBlock: "#create:fan_processing_catalysts/blasting", model: "minecraft:black_glazed_terracotta",
                    restrictedBlocks: bannedBlocks, restrictedFluids: bannedFluids, restrictedItems: bannedItems,
                    recipeType: ["immersiveengineering:coke_oven", "minecraft:blasting", "minecraft:smelting"],
                    gateItem: "createmechanisms:heat_mechanism"
                },
            ],
            [
                "smoking", {
                    id: MACH_ID.concat("_smoking"), name: "Engistic Encased Fan - Smoking", color: Color.rgba(164, 118, 76, 0.99),
                    coreItem: null, coreBlock: "#create:fan_processing_catalysts/smoking", model: "minecraft:brown_glazed_terracotta",
                    restrictedBlocks: bannedBlocks, restrictedFluids: bannedFluids, restrictedItems: bannedItems,
                    recipeType: ["minecraft:smoking", "minecraft:campfire_cooking"],
                    gateItem: "createmechanisms:zinc_mechanism"
                },
            ],
            [
                "splashing", {
                    id: MACH_ID.concat("_splashing"), name: "Engistic Encased Fan - Splashing", color: Color.rgba(44, 46, 143, 0.99),
                    coreItem: null, coreBlock: "#create:fan_processing_catalysts/splashing", model: "minecraft:blue_glazed_terracotta",
                    restrictedBlocks: bannedBlocks, restrictedFluids: bannedFluids, restrictedItems: bannedItems,
                    recipeType: ["create:splashing"],
                    gateItem: "createmechanisms:rubber_mechanism"
                },
            ],
            [
                "haunting", {
                    id: MACH_ID.concat("_haunting"), name: "Engistic Encased Fan - Haunting", color: Color.rgba(99, 23, 148, 0.99),
                    coreItem: null, coreBlock: "#create:fan_processing_catalysts/haunting", model: "minecraft:purple_glazed_terracotta",
                    restrictedBlocks: bannedBlocks, restrictedFluids: bannedFluids, restrictedItems: bannedItems,
                    recipeType: ["create:haunting"],
                    gateItem: "createmechanisms:heat_mechanism"
                },
            ],
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
            let tagFilter = coreFilter.replace("#","")
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
            let tagFilter = coreFilter.replace("#","")
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
                    if (p.name == "level") return `${p.name}=${blockOnly ? 0: p.value(state).value()}`
                    return p.value(state)}).toList()}`)
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
            let tagFilter = coreFilter.replace("#","")
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
    }};

    /** The Engistic Fan */
    let engisticFAN = machBuilder("mmr:engistic_fan", "create:encased_fan");

    MMREvents.machines(event => {
        // TODO: CONTROLLER MODEL
        // TODO: MACHINE SOUNDS
        // TODO: MACHINE RECIPE TYPES (BLASTING, HAUNTING, ETC)
        
        /** All types of engistic fans */
        engisticFAN.machineType.forEach((_, typeKey) => {
            engisticFAN.buildMACH(event, typeKey);
        })
    })
    
    ServerEvents.recipes(event => {

        engisticFAN.machineType.forEach((type, typeKey) => {
            recipesMACH(event, type.id, type.recipeType);

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
                    a: engisticFAN.traitItem, // The defining trait of the engistic fan.
                    c: type.gateItem || engisticFAN.traitItem, // A item that will be used as a gate
                    b: [].concat(type.coreItem, engisticFAN.parseBlocktoItems(type.coreBlock, typeKey)).filter(a => a),  //arg 3: the mapping object
                }
            )
            
        })


    });


})();