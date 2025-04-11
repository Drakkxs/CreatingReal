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
             * @returns {number} - The number of columns.
             */
            columns() {
                let numColumns = Math.ceil(this.x.real() / this.tilesize);
                if (debug) console.log(`Calculated columns: ${numColumns}`);
                if (Number.isInteger(numColumns)) return numColumns;
                throw new Error("Invalid number of columns");
            },

            /**
             * Calculates the number of rows in the UI grid based on the tile height.
             * @returns {number} - The number of rows.
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
             */
            reservePos(x, y) {
                if (this.reservations.find(pos => pos.x === x && pos.y === y)) {
                    if (debug) console.log(`Position already reserved: ${[x, y]}`);
                    return;
                }
                this.reservations.push({ x: x, y: y });
                if (debug) console.log(`Reserved position: ${[x, y]}`);
            },

            /**
             * Returns the width and height of reserved positions
             * @returns {{width: number, height: number}}
             */
            getReservedBoundingBox() {
                let a = Math.min(this.MAX_UI_SIZE, this.tilesize + Math.max.apply(null, this.reservations.map(pos => pos.x)));
                let b = Math.min(this.MAX_UI_SIZE, this.tilesize + Math.max.apply(null, this.reservations.map(pos => pos.y)))
                if (debug) console.log(`Reserved bounding box: ${[a, b]}`);
                return { width: a, height: b };
            },

            /**
             * Controls a grid structure for the UI.
             * This function takes an index and a tile size and returns the x and y position of the tile.
             * @param {number} index - The index of the tile.
             * @param {boolean} [makeReservation]
             * @returns {{x: number, y: number}} - The x and y position of the tile.
             */
            getTilePosition(index, makeReservation) {
                let x = 0;
                let y = 0;

                // Find next available position
                while (this.reservations.some(pos => pos.x === x && pos.y === y)) {
                    if (debug) console.log(`Position occupied, searching for next: ${[x, y]}`);
                    index++;

                    x = (index % this.columns()) * this.tilesize;
                    y = Math.floor(index / this.columns()) * this.tilesize;
                }

                // Reserve this position
                if (makeReservation) this.reservePos(x, y);

                if (debug) console.log(`Final tile position for index ${index}: ${[ x, y ]}`);

                return { x: x, y: y };
            }
        };
    }

    /**
     * A similar check to create if a recipe can be automated or not.
     * @param {$KubeRecipe_} recipe - The recipe to check.
     */
    function canBeAutomated(recipe) {
        return !(recipe.getPath().endsWith("_manual_only"))
    }

    /**
     * Converts a JSON string to an item object.
     * @param {string} strItemStack - The JSON string to convert.
     * @returns {object} - The item object. If the JSON is invalid, returns {"item": "minecraft:air"}.
     */
    function jsonToItem(strItemStack) {
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

        let classPackageItem = Java.loadClass("com.simibubi.create.content.logistics.box.PackageItem");
        let classProcessingRecipe = Java.loadClass("com.simibubi.create.content.processing.recipe.ProcessingRecipeSerializer")

        event.forEachRecipe({type: "minecraft:smelting"}, recipe => {
            if (!canBeAutomated(recipe)) return
            if (debug) console.log(`Id: ${recipe.getId()} json: ${recipe.json.toString()}`)
            doFANBLASTING(recipe)
        })

        /** @param {$KubeRecipe_} recipe  */
        function doFANBLASTING(recipe) {

            let ui = constuctUI();

            let cfgRecipe = {

                json: recipe.json,

                /** Returns the a Json array of ingredient objects */
                objIngredient() {
                    // Retrieve ingredients as an array of JSON objects
                    let ingredients = [
                        this.json.get("ingredient"),
                        this.json.get("ingredients"),
                    ].find(value => value)
                    
                    
                    return JsonIO.toArray(ingredients).asList().stream().findFirst().get().asJsonObject
                },

                listObjResults() {
                    let results = [
                        this.json.get("result"),
                        this.json.get("results"),
                    ].find(value => value)

                    return JsonIO.toArray(results).asList().stream().map((itemStack) => itemStack.asJsonObject).toList()
                },  

                //TODO: CONSIDER RESULTING EXP NUGGETS TO BE HANDLED LIKE CALCULATED EXP NUGGETS

                /**
                 * Returns the number of experience Nuggets that will be created.
                 * Also adds the remaining extra.
                 */
                xpNuggets() {

                    let raw = [
                        this.json.get("xp"),
                        this.json.get("experience"),
                    ].find(value => value)

                    // Apparently this can be used on 'undefined' but not 'null'?
                    // We give double the amount of xp here to compete with the crushers
                    let experience = raw ? raw.asInt * 2 : 0

                    if (debug) console.log(`Experience: ${experience}`)

                    // One create experince nugget gives 3 xp points
                    let nuggets = [
                        // The amount of guaranteed nuggets
                        {chance: 1, item: {id: "create:experience_nugget", count: Math.floor(experience / 3)}},

                        // The chance of extra nuggets
                        {chance: Math.round(((experience % 3) / 3) * 100) / 100, item: {id: "create:experience_nugget", count: 1}}
                    ].filter((nugget) => (nugget.chance && nugget.item.count))

                    if (debug) console.log(`Nuggets: ${JSON.stringify(nuggets)}`)

                    return nuggets
                },

                /** 
                 * Returns the processing time in ticks for the recipe
                 */
                proccessingTime() {
                    // 20 is ticks, a single second.
                    let processingTime = 20;
                    // Iterate through all keys in the JSON object
                    let raw = JSON.parse(this.json.toString())
                    let key = Object.keys(raw).find(k => /^time|duration$/i.test(k));

                    if (key) {
                        processingTime = Math.max(20, raw[key].asInt)
                    }

                    if (debug) console.log(`Processing time: ${processingTime}`)                 

                    return processingTime
                },

                /** Eight times faster than the processing time */
                boostedTime() {return Math.max(1, Math.round(this.proccessingTime() / 8))},

                /**
                 * The count of unique result objects.
                 */
                amountObjItem() {
                    let count = this.listObjResults().size()
                    if (debug) console.log(`Result count: ${count}`);
                    return count
                },

                /**
                 * The count is calculated by summing the count of each result object.
                 */
                sumItemCount() {
                    let sumItemCount = 0; this.listObjResults().stream().forEach((result) => {
                    let count = result.has("count") ? sumItemCount += result.get("count").asInt : 1
                    sumItemCount += count})
                    return sumItemCount
                },
                
                /**
                 * The energy cost of this recipe in RF/t.
                 * The cost is calculated by multiplying the number of results by the processing time in ticks.
                 * The result count is the actual number of items produced by the recipe.
                 * The result is then clamped to a minimum of 1 RF/t.
                 */
                energyCost() {
                    let xpCost = this.xpNuggets().reduce((a, b) => a + b.item.count, 0);
                    // The xp cost is by each point. Nuggets give 3 points.
                    let sumCount = this.sumItemCount() + (xpCost * 3);
                    let cost = Math.max(1, sumCount * this.proccessingTime()); 
                    if (debug) console.log(`Energy cost: ${cost}`); 
                    return cost
                },
            }
            function toTick(any) {return any}
            let machine = event.recipes.modular_machinery_reborn.machine_recipe("mmr:encased_fan", toTick(cfgRecipe.boostedTime()))

            machine.requireItem(jsonToItem(cfgRecipe.objIngredient().toString()), 1, 20, 0);

            /** 
             * The top row and first column of the UI is reserved for special UI elements. 
             * Two slots in the top row are saved for the recipe's experience nuggets.
            */
            for (let index = 1; index < ui.columns() - 2; index++) {
                ui.reservePos(index * ui.tilesize, 0)
            }
            for (let index = 0; index < ui.rows(); index++) {
                ui.reservePos(0, index * ui.tilesize)
            }

            let intialpos = ui.getTilePosition(0, false)
            // Add the experience to the UI.
            cfgRecipe.xpNuggets().forEach((nuggetStack, index) => {
                let chance = nuggetStack.chance
                let objItem = jsonToItem(JSON.stringify(nuggetStack.item))
                let count = ("count" in objItem) ? objItem.count : 1

                // Ensure nuggets use as much space as they can instead of expanding downwards.
                let pos = {x: intialpos.x + (index * ui.tilesize), y: intialpos.y}

                // is the postion within bounds? If not, move down a row.
                if (pos.y + ui.tilesize > ui.MAX_UI_SIZE) {
                    pos.y = intialpos.y + (index * ui.tilesize)
                }
                ui.reservePos(pos.x, pos.y)
                if (debug) console.log(`Adding nugget: ${JSON.stringify(objItem)} with chance: ${chance} at ${pos.x}, ${pos.y}`)
                machine.produceItem(`${count}x ${objItem.item}`, nuggetStack.chance, pos.x, pos.y)
            })

            // Update the initial position
            intialpos = ui.getTilePosition(0, false)
            // Add the items to be produced, and their chances to the UI.
            for (let index = 0; index < cfgRecipe.amountObjItem(); index++) {
                let itemStack = cfgRecipe.listObjResults().get(index)
                let chance = itemStack.has("chance") ? Math.round(itemStack.get("chance").asFloat * 100) / 100 : 1.0
                let objItem = jsonToItem(itemStack.toString())
                let count = ("count" in objItem) ? objItem.count : 1
                
                // Ensure items use as much space as they can instead of only expanding downwards.
                let pos = {x: intialpos.x + (index * ui.tilesize), y: intialpos.y}

                // is the postion within bounds? If not, move down a row.
                if (pos.y + ui.tilesize > ui.MAX_UI_SIZE) {
                    pos.y = intialpos.y + (index * ui.tilesize)
                }
                ui.reservePos(pos.x, pos.y)

                if (debug) console.log(`Adding item: ${JSON.stringify(objItem)} with chance: ${chance} at ${pos.x}, ${pos.y}`)
                machine.produceItem(`${count}x ${objItem.item}`, chance, pos.x, pos.y)
            }
            
            // Placing the progress bar just next to the required item.
            machine.progressX(35)
            machine.progressY(0)

            machine.requireEnergy(cfgRecipe.energyCost(), 0, 0)

            let dim = ui.getReservedBoundingBox()
            machine.width(dim.width)
            machine.height(dim.height)

        }
    })

})();