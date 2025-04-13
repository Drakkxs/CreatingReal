// priority: 0
// requires: create
// requires: modular_machinery_reborn
// @ts-check
// An upgrade to create's encased fan.

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = true

    /**
     * Constructs an object with methods to calculate real and center values based on input and offset.
     */
    let constructPOS = {
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
            center() { return Math.floor(this.real() / 2); }
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


    /**
     * A function to create a structure for the UI.
     * @param {number} [t] - The size of the tile.
     * @param {number} [x] - The initial x position of the UI.
     * @param {number} [a] - The x offset of the UI.
     * @param {number} [y] - The initial y position of the UI.
     * @param {number} [b] - The y offset of the UI.
     */
    function constuctUI(t, x, a, y, b) {
        return {
            MAX_UI_SIZE: 256,
            tilesize: t || 20,
            reservations: [],
            x: constructPOS.x(x || 80, a || 0),
            y: constructPOS.y(y || 60, b || 0),

            /**
             * Calculates the number of columns in the UI grid based on the tile width.
             */
            columns() {
                let numColumns = Math.ceil(this.x.real() / this.tilesize);
                if (debug) console.log(`Calculated columns: ${numColumns}`);
                if (Number.isInteger(numColumns)) return numColumns;
                throw new Error("Invalid number of columns");
            },

            /**
             * Calculates the number of rows in the UI grid based on the tile height.
             */
            rows() {
                let numRows = Math.ceil(this.y.real() / this.tilesize);
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
                let x = 0;
                let y = 0;
                let orgIndex = index;
                if (debug) console.log(`Getting tile position for index ${index}`);
                // Calculate position, or use given values
                let columns = col || this.columns();
                let rows = row || this.rows();

                // Find next available position
                while (this.reservations.some(pos => pos.x === x && pos.y === y)) {
                    index++;
                    x = (index % columns) * this.tilesize;
                    y = Math.floor(index / columns) * this.tilesize;
                    if ([x, y].some(pos => pos > this.MAX_UI_SIZE)) throw new Error("Too many UI elements");
                }

                // Reserve this position
                if (makeReservation) this.reservePos(x, y, party);

                if (debug) console.log(`Final Pos: ${orgIndex} -> ${index}: ${[ x, y ]}`);

                return { x: x, y: y };
            },

            /**
             * Holds the initial position.
             */
            intialPos: undefined,

            /**
             * Gets a new position for a UI element based on the index of the element.
             * @param {number} index
             * @param {String[]} party
             * @param {number} [col]
             * @param {number} [row]
             */
            getNewPos(index, party, col, row) {
                // Get intial position
                if (!index) this.intialpos = this.getTilePosition(0, party, true, col, row);

                // Ensure items use as much space as they can instead of only expanding downwards.
                let pos = {x: this.intialpos.x + (index * this.tilesize), y: this.intialpos.y}
                if (debug) console.log(`Initial position for index ${index}: ${[pos.x, pos.y]}`);

                // The position is out of the UI.
                if (pos.x > this.MAX_UI_SIZE) {
                    // Move down a row
                    pos.y = this.intialpos.y + (index * this.tilesize)
                } 
                // The position is reserved                
                else if (this.reservations.find(p => p.x == pos.x && p.y == pos.y)) {
                    pos = this.getTilePosition(0, party, false, col, row)
                }
                this.reservePos(pos.x, pos.y, party)
                return pos
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

        /**
         * Converts a JSON string to an item object.
         * @param {string} strItemStack - The JSON string to convert.
         * @returns {{chance: number, item: string, count: number}}
         */
        jsonToItem(strItemStack) {
            /** @type {Object} */
            let raw = {}
            try {
                raw = JSON.parse(strItemStack);
                if (debug) console.log(`JSON: ${strItemStack}`);
    
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
    
            } catch (e) {
                if (debug) console.error(`Invalid JSON: ${strItemStack}`, e);
                return null; // Default return value for invalid JSON
            }
    
            if (debug) console.log(`Item: ${JSON.stringify(raw)}`);
            return raw;
        },

        /**
         * Json to array
         * @param {$JsonElement_} element - The JSON string to convert.
         * @returns {import("com.google.gson.JsonElement").$JsonElement[]}
         */
        jsonToArray(element) {
            return JsonIO.toArray(element).asList().stream().toArray();
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
         * Retrieves the first ingredient of the recipe as an item object.
         */
        inputIngredient() {
            // Retrieve all ingredients as an array of JSON elements
            let raw = [
                this.recipeJson.get("ingredient"),
                this.recipeJson.get("ingredients"),
            ].find(value => value)

            return this.jsonToArray(raw)
            .map(value => {
                // Convert the JSON element to a JSON object
                let objItem = value.asJsonObject

                // Add redudancy to avoid null pointer exceptions
                objItem.has("count") || objItem.add("count", 1.0)
                objItem.has("chance") || objItem.add("chance", 1.0)

                // Convert the JSON object to an item object
                return this.jsonToItem(objItem.toString())
            })[0] // Return the first item object of the array
        },

        /**
         * Retrieves the list of result objects from the recipe JSON and returns them as an array of item objects.
         * An array of item objects as returned by jsonToItem.
         * This includes the XP_ID
         */
        arrayResults() {
            let raw = [
                this.recipeJson.get("result"),
                this.recipeJson.get("results"),
            ].find(value => value)

            return this.jsonToArray(raw)
            .map(value => {
                // Convert the JSON element to a JSON object
                let objItem = value.asJsonObject

                // Add redudancy to avoid null pointer exceptions
                objItem.has("count") || objItem.add("count", 1.0)
                objItem.has("chance") || objItem.add("chance", 1.0)

                // Convert the JSON object to an item object
                return this.jsonToItem(objItem.toString())
            })
        },  

        //TODO: CONSIDER RESULTING EXP NUGGETS TO BE HANDLED LIKE CALCULATED EXP NUGGETS

        /**
         * Returns the number of experience Nuggets that will be created.
         * Also adds the remaining extra.
         */
        xpNuggets() {

            let raw = [
                this.recipeJson.get("xp"),
                this.recipeJson.get("experience"),
            ].find(value => value)

            // Apparently this can be used on 'undefined' but not 'null'?
            // We give double the amount of xp here to compete with the crushers
            let experience = raw ? raw.asNumber * XP_MULTI : 0

            // Calculate the amount of nuggets from the recipe
            experience = (
                this.arrayResults()
                // Filter the nuggets
                .filter(item => item.item === XP_ID)
                // Calculate the amount of xp
                .reduce((a, b) => a + b.count, 0) * 3
            )

            if (debug && experience) console.log(`Experience: ${experience}`)

            // One create experince nugget gives XP_PER xp points
            let nuggets = [
                // The amount of guaranteed nuggets
                {chance: 1, item: XP_ID, count: Math.floor(experience / XP_PER)},

                // The chance of extra nuggets
                {chance: Math.round(((experience % XP_PER) / XP_PER) * 100) / 100, item: XP_ID, count: 1}
            ].filter((nugget) => (nugget.chance && nugget.count))

            if (debug && nuggets.length) console.log(`Made ${nuggets.length} nuggets`)

            return nuggets
        },

        /** 
         * Returns the processing time in ticks for the recipe
         */
        proccessingTime() {
            // MIN_TIME is ticks, a single second.
            let processingTime = MIN_TIME;

            // Find the processing time
            let raw = [
                this.recipeJson.get("time"),
                this.recipeJson.get("duration"),
            ].find(value => value)

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
            arrXp = arrXp || this.xpNuggets();
            let sumXp = arrXp.reduce((a, b) => a + b.count, 0);
            let sumCost = this.sumItemcount() + (sumXp * XP_PER);
            if (debug) console.log(`Sum Cost: ${sumCost}, XP per nugget: ${XP_PER}, Sum XP: ${sumXp}`);
            let energyCost = sumCost * this.proccessingTime();
            if (debug) console.log(`Energy Cost: ${energyCost}`);
            return Math.max(MIN_ENERGY_COST, energyCost)
        }
    }}

    /**
     * A similar check to create if a recipe can be automated or not.
     * @param {$KubeRecipe_} recipe - The recipe to check.
     */
    function canBeAutomated(recipe) {
        return !(recipe.getPath().endsWith("_manual_only"))
    }

    MMREvents.machines(event => {
        // TODO: CONTROLLER MODEL
        // TODO: MACHINE SOUNDS
        // TODO: MACHINE RECIPE TYPES (BLASTING, HAUNTING, ETC)
        let builder = event.create("mmr:encased_fan")
        builder.name("Engistic Fan")
        builder.color("#FF4d4d4d")
        function struct() {
            return ( MMRStructureBuilder.create().pattern([
                ["aaa", "ecd", "aba"],
                ["ama", "aaa", "aaa"],
                ["f f", "   ", "f f"]
            ]).keys({
                "a": ["modular_machinery_reborn:casing_plain"],
                "b": ["#modular_machinery_reborn:energyinputhatch"],
                "c": ["modular_machinery_reborn:casing_firebox"],
                "d": ["#modular_machinery_reborn:inputbus"],
                "e": ["#modular_machinery_reborn:outputbus"],
                "f": ["modular_machinery_reborn:casing_vent"]
            }) );
        } 
        builder.structure(struct());
        // TODO: SOUNDS
        // builder.sound()
        
    })

    ServerEvents.recipes(event => {

        /**
         * Applies the FANBLASTING recipe transformer to all recipes of the given type, skipping manual-only recipes.
         * @param {string} recipeType the type of recipes to transform
         */
        function Recipes(recipeType) {
            return event.forEachRecipe({type: recipeType}, recipe => {
                if (!canBeAutomated(recipe)) return null
                if (debug) console.log(`
                    ========================================
                    DOING RECIPE: ${recipe.getId()} 
                    With JSON: ${recipe.json.toString()}
                    ========================================`)
                return doFANBLASTING(recipe)
            })
        }

        [
            "minecraft:smelting",
            "create:splashing",
            "create:haunting",
            "create:crushing"
        ].forEach(Recipes)

        
        /**
         * FANBLASTING recipe transformer
         * @param {$KubeRecipe_} recipe
         */
        function doFANBLASTING(recipe) {

            let ui = constuctUI();

            let cfgRecipe = constructRecipe(recipe, 3, 2, "create:experience_nugget", 20, 8, 1);

            let machine = event.recipes.modular_machinery_reborn.machine_recipe("mmr:encased_fan", cfgRecipe.boostedTime())

            machine.requireItem(cfgRecipe.inputIngredient(), 1, 20, 0);

            let arryXpNuggets = cfgRecipe.xpNuggets();

            /** 
             * Reserves positions in the UI grid for special UI elements. 
             * The top row and first column have reserved slots, with two slots allocated for experience nuggets.
             */
            let cols = ui.columns();
            let rows = ui.rows();
            let specialCols = cols - arryXpNuggets.length;
            let specialRows = rows

            if (debug) console.log(`Reserving top and bottom rows`);
            if (debug && arryXpNuggets.length) console.log(`Making special reservations for ${arryXpNuggets.length} nuggets`);
            for (let colIndex = 0; colIndex < specialCols; colIndex++) {
                ui.reservePos(colIndex * ui.tilesize, 0, ["Top Row"]);
            }
            for (let rowIndex = 1; rowIndex < specialRows; rowIndex++) {
                ui.reservePos(0, rowIndex * ui.tilesize, ["First Column"]);
            }

            // Add the experience to the UI.
            arryXpNuggets
            .forEach((objItem, index) => {
                let stringObjItem = JSON.stringify(objItem)
                let pos = ui.getNewPos(index, [`XP_ID ${stringObjItem}`], cols, rows)
                if (debug) console.log(`Adding nugget: ${stringObjItem} with chance: ${objItem.chance} at ${pos.x}, ${pos.y}`)
                machine.produceItem(`${objItem.count}x ${objItem.item}`, objItem.chance, pos.x, pos.y)
            })

            // Add the items to be produced, and their chances to the UI.
            cfgRecipe.arrayResults()
            // Filter out the XP_ID
            .filter(objItem => objItem.item.toString() != cfgRecipe.XP_ID)
            .forEach((objItem, index) => {
                let stringObjItem = JSON.stringify(objItem)
                // A new position for the item, and then produce the item
                let pos = ui.getNewPos(index, [`Result ${objItem}`], cols, rows)
                if (debug) console.log(`Adding item: ${stringObjItem} with chance: ${objItem.chance} at ${pos.x}, ${pos.y}`)
                machine.produceItem(`${objItem.count}x ${objItem.item}`, objItem.chance, pos.x, pos.y)
            })
            
            // Placing the progress bar just next to the required item.
            machine.progressX(35)
            machine.progressY(0)

            machine.requireEnergy(cfgRecipe.energyCost(arryXpNuggets), 0, 0)

            let dim = ui.getReservedBoundingBox()
            machine.width(dim.width)
            machine.height(dim.height)

            // Display the reserved postions
            if (debug) {
                console.log('Reserved positions:');
                console.log(ui.reservations.map(pos => [pos.x, pos.y, pos.party]).join('\n'));
            }

        }
    })

})();