// priority: -10
// requires: mekanism
// requires: modular_machinery_reborn
// @ts-check
// An alternative to mekanism's methods of generating power and heat.



// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {



    /**
     * Want some debug?
     */
    let debug = false;
    const $FluidIngredient = Java.loadClass("net.neoforged.neoforge.fluids.crafting.FluidIngredient");
    const $SizedFluidIngredient = Java.loadClass("net.neoforged.neoforge.fluids.crafting.SizedFluidIngredient");
    const $IOType = Java.loadClass("es.degrassi.mmreborn.common.machine.IOType");

    let matrixUtil = {

        fuelRecipeData: {
            // Store recipe data here as it is processed
            energy: 0
        },

        /**
         * Gets burn time for any ItemStack on demand
         * @param {import("net.minecraft.world.item.ItemStack").$ItemStack} stack - The item stack to check
         * @returns {number} - Burn time in ticks, 0 if not burnable
         */
        getBurnTime: (stack) => {
            try {
                return stack.getBurnTime("minecraft:smelting");
            } catch (e) {
                return 0;
            }
        },

        /**
        * Checks if an item can be used as fuel
        * @param {import("net.minecraft.world.item.ItemStack").$ItemStack} stack - The item stack to check
        * @returns {boolean} - True if burnable
        */
        isBurnable: (stack) => {
            try {
                return stack.getBurnTime("minecraft:smelting") > 0;
            } catch (e) {
                return false;
            }
        },

        /** Using a map of the recipe serializer to find where a recipe defines its fuels */
        fuelKeys: new Map([
            ["createaddition:liquid_burning", "ingredients"],
        ]),

        /** 
         * KubeJS Ingredient.of() returns minecraft air with a components of "minecraft:custom_data" to handle fluids.
         * This function checks if the ingredient is a fluid ingredient, and returns the custom data if so otherwise null.
         * @param {string} fauxIngStr - The json string of the fake fluid ingredient to check.
         * @returns - The custom data if it's a fluid ingredient
         */
        prepareFluidIngredient: function (fauxIngStr) {
            if (debug) console.log(`Preparing fluid ingredient: ${fauxIngStr}`);
            if (!fauxIngStr) return null;
            let fauxObj = JSON.parse(fauxIngStr);
            if (!fauxObj || !Object.keys(fauxObj).length) return null;
            // Check if the ingredient is air with custom data
            if (Ingredient.of(fauxIngStr).stacks.first.id === "minecraft:air" && "components" in fauxObj) {
                // Get the components and return the custom data if it exists
                let comp = fauxObj.components;
                if (comp && "minecraft:custom_data" in comp) {
                    let customData = comp["minecraft:custom_data"];
                    if (debug) console.log(`Found fluid ingredient custom data: ${JsonUtils.toString(customData)}`);
                    return JsonUtils.toString(customData);
                }
            } // Check if this is a already prepared fluid json. The "amount" key is unique to fluid ingredients.
            else if ("amount" in fauxObj) {
                if (debug) console.log(`Found Pre-made fluid ingredient: ${JsonUtils.toString(fauxObj)}`);
                return fauxIngStr;
            }
            if (debug) console.log(`Not a fluid ingredient: ${JsonUtils.toString(fauxObj)}`);
            return null;
        },

        /**
         * Parses a fluid object from a recipe definition, creates a SizedFluidIngredient,
         * and pushes it to the parent `fluidIngredient` array.
         *
         * The input object can define a fluid by a tag or a specific fluid ID.
         * The amount defaults to 1000 mB (1 bucket) if not specified.
         *
         * KubeJS Ingredient.of() returns minecraft air with a components of "minecraft:custom_data" to handle fluids.
         * This function checks if the ingredient is a fluid ingredient, and returns the custom data if so otherwise null.
         * @param {string} fluidData - The ingredient string json to convert into a SizedFluidIngredient.
         */
        createFluidIngredient: function (fluidData) {
            // We have to go through this rigamarole because KubeJS does not expose a way to create a FluidIngredient directly
            if (debug) console.log(`Creating fluid ingredient from: ${fluidData}`);
            // Parse the fluid data
            if (debug) console.log(`Parsed fluid string: ${fluidData}`);
            let data = JSON.parse(fluidData);
            // Do not allow non-fluid ingredients to pass through
            if (!fluidData || !(JsonUtils.toString(data).includes("amount"))) throw new Error(`Not a fluid ingredient: ${fluidData}`);
            if (debug) console.log(`Parsed fluid data: ${JsonUtils.toString(data)}`);

            let fluIng;
            let amount = data.amount || 1000; // Default to 1 bucket

            /**
             * @param {import("net.neoforged.neoforge.fluids.crafting.FluidIngredient").$FluidIngredient} fluIng
             * @param {number} amount - The amount in mB
            */
            function createSizedFluidIngredient(fluIng, amount) {
                // @ts-expect-error
                return new $SizedFluidIngredient(fluIng, amount);
            }
            if (data.fluid_tag) {
                // Create an ingredient from the tag.
                fluIng = $FluidIngredient.tag(data.fluid_tag);
            } else if (data.fluid || data.id) {
                // @ts-expect-error
                fluIng = $FluidIngredient.single(Fluid.of(data.fluid || data.id));
            }

            if (fluIng) {
                // Combine the ingredient and the amount into a SizedFluidIngredient.
                let sizedFluidIngredient = createSizedFluidIngredient(fluIng, amount);
                if (debug) console.log(`Created SizedFluidIngredient: ${sizedFluidIngredient.getFluids().join(" ,")}`);
                return sizedFluidIngredient

            }
            // Do not allow this to fail silently.
            throw new Error(`Failed to create fluid ingredient from data: ${JsonUtils.toString(data)}`);
        }
    }



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
    function constructUI(t, uiSize, width, wOffset, height, hOffset) {
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
                if (debug) console.log(`Reserved position for ${JsonUtils.toString(this.reservations.slice(-1).map(pos => [pos.x, pos.y, pos.party])[0])}`);
            },

            /**
             * Reservers a bar position in the UI grid.
             * A bar occupies three vertical tiles, so this function reserves the specified position and the two tiles above it.
             * @param {number} x - The x-coordinate of the position to reserve.
             * @param {number} y - The y-coordinate of the position to reserve.
             * @param {String[]} party - The identifier for who is reserving the position.
             */
            reserveBarPos(x, y, party) {
                // A edge case to look out for is that the the two tiles above it are not in the UI bounds
                if ((y + this.tilesize) > this.MAX_UI_SIZE || (y + this.tilesize * 2) > this.MAX_UI_SIZE) {
                    throw new Error("Bar position out of bounds");
                }
                this.reservePos(x, y, party);
                this.reservePos(x, y + this.tilesize, party);
                this.reservePos(x, y + 2 * this.tilesize, party);
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
                if (debug) console.log(`Getting tile position for: ${JsonUtils.toString(party)}`);

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
             * @param {boolean} [bar] - If a energy or fluid bar is being placed.
             * @param {number} [col]
             * @param {number} [row]
             */
            getNewPos(index, party, bar, col, row) {
                // Some things only need to be done once
                if (debug) console.log(`Index: ${index}`);
                if (index == 0) this.intialPos = this.getTilePosition(index, party, false, col, row);
                this.maxDim = this.maxDim || {
                    col: Math.floor(this.MAX_UI_SIZE / this.tilesize),
                    row: Math.floor(this.MAX_UI_SIZE / this.tilesize)
                };
                let max = this.maxDim;
                let slot = this.intialPos;

                // As it amazingly turns out, fluids display at the same size as items in the UI! So no need to adjust for that. 
                // (Not that it worked anyway) They visually expand downards not upwards.
                bar = false; // Override bar behavior for now.
                // Find next available position
                // If a bar is being placed we need to account for the position its being placed in and two tiles upward.
                if (bar) {
                    // Bar placement behavior
                    // If the slot and the two tiles above it are occupied, move to the next slot
                    while (
                        this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y)
                        || this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y - this.tilesize)
                        || this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y - this.tilesize * 2)
                        // A edge case to look out for is that the the two tiles above it are not in the UI bounds
                        || (slot.y - this.tilesize) < 0
                        || (slot.y - this.tilesize * 2) < 0
                    ) {
                        // Move to the unoccupied slot
                        index++;
                        // Calculate the new position based on max columns
                        slot.x = (index % max.col) * this.tilesize;
                        // Calculate the new position based on max rows
                        slot.y = Math.floor(index / max.col) * this.tilesize;
                        // If we exceed the max UI size, throw an error, we can't place any more tiles.
                        if ([slot.x, slot.y].some(pos => pos > this.MAX_UI_SIZE)) throw new Error("Too many UI elements");
                    }
                    // Reserve this position, and the two tiles above it.
                    this.reserveBarPos(slot.x, slot.y, party);

                } else {
                    // Default placement behavior
                    // If the slot is occupied, move to the next slot
                    while (this.reservations.some(pos => pos.x === slot.x && pos.y === slot.y)) {
                        // Move to the unoccupied slot
                        index++;
                        // Calculate the new position based on max columns
                        slot.x = (index % max.col) * this.tilesize;
                        // Calculate the new position based on max rows
                        slot.y = Math.floor(index / max.col) * this.tilesize;
                        // If we exceed the max UI size, throw an error, we can't place any more tiles.
                        if ([slot.x, slot.y].some(pos => pos > this.MAX_UI_SIZE)) throw new Error("Too many UI elements");
                    }
                    // Reserve this position
                    this.reservePos(slot.x, slot.y, party);
                }

                return slot;
            }
        };
    }

    /**
     * Constructs the foundation for a machine to accept recipes.
     * @param {string} MACH_ID - The ID of the machine.
     * @param {$RecipesKubeEvent_} MACH_EVENT - The Recipe Event
     */
    function constructRecipe(MACH_ID, MACH_EVENT) {
        return {

            /**
             * A map of fuels keyed by their jsonString (the full id).
             * Produced energy and heat are per tick values.
             * @type {Map<string, {
             * type: string,
             * path: string,
             * burntime: number,
             * superheated: boolean,
             * producedEnergy: number,
             * producedHeat: number,
             * solidbyproducts: import("net.minecraft.world.item.ItemStack").$ItemStack[],
             * fluidbyproducts: import("net.neoforged.neoforge.fluids.FluidStack").$FluidStack[],
             * }>}
             */
            fuelMap: new Map(),

            /**
             * Create Mod-like check if a recipe can be automated or not.
             * @param {$KubeRecipe_} recipe - The recipe to check.
             */
            canBeAutomated(recipe) {
                return !(recipe.getPath().endsWith("_manual_only"))
            },

            /**
             * A function to add fuel to the fuel map.
             * @param {string} jsonString - The JSON string of the fuel that will be the key.
             * @param {string} type - The type of fuel.
             * @param {string} path - The path of the recipe.
             * @param {number} burntime - The burn time of the fuel.
             * @param {boolean} superheated - Whether the fuel can superheat a blaze burner.
             * @param {number} producedEnergy - The energy produced per tick.
             * @param {number} producedHeat - The heat produced per tick.
             * @param {import("net.minecraft.world.item.ItemStack").$ItemStack[]} solidbyproducts - The solid byproducts of the fuel.
             * @param {import("net.neoforged.neoforge.fluids.FluidStack").$FluidStack[]} fluidbyproducts - The fluid byproducts of the fuel.
             */
            updateFuelMap(jsonString, type, path, burntime, superheated, producedEnergy, producedHeat, solidbyproducts, fluidbyproducts) {
                if (debug) console.log(`Setting fuel map with: ${jsonString} for ${path} of type ${type}`);
                let oriMap = this.fuelMap.get(jsonString) || {
                    type: "",
                    path: null,
                    superheated: false,
                    burntime: 0,
                    producedEnergy: 0,
                    producedHeat: 0,
                    solidbyproducts: [],
                    fluidbyproducts: []
                }
                let newMap = {}
                if (debug) console.log(`Original fuel map entry: ${JsonUtils.toString(oriMap)}`);
                // Type and path are static
                newMap.type = `${oriMap.type || type}`;
                newMap.path = `${oriMap.path || path}`;
                newMap.superheated = oriMap.superheated || superheated;

                // Chose the highest burn time
                newMap.burntime = Math.max(oriMap.burntime, burntime);
                newMap.producedEnergy = Math.max(oriMap.producedEnergy, producedEnergy);
                newMap.producedHeat = Math.max(oriMap.producedHeat, producedHeat);

                // Merge the byproducts, avoiding duplicates
                newMap.solidbyproducts = Array.from(new Set([].concat(newMap.solidbyproducts, solidbyproducts))).filter(a => a);
                newMap.fluidbyproducts = Array.from(new Set([].concat(newMap.fluidbyproducts, fluidbyproducts))).filter(a => a);

                if (debug) console.log(`New fuel map entry: ${JsonUtils.toString(newMap)}`);
                this.fuelMap.set(jsonString, newMap);
            },

            /**
             * Initializes the recipe
             * @param {string} MACH_TYPE The type of the machine
             * @param {$KubeRecipe_} recipe 
             */
            init(MACH_TYPE, recipe) {
                if (!(this.canBeAutomated(recipe))) return
                if (debug) {
                    console.log(`DOING RECIPE: ${recipe.getId()}`)
                    console.log(`With JSON: ${recipe.json.toString()}`)
                }

                let specRecipes = mekanismMatrix.machineType.get(MACH_TYPE).prettyRecipes.get(`${recipe.path}`);
                if (!specRecipes) { if (debug) console.log(`No inspector recipes found for ${recipe.path}`); return; }

                if (!specRecipes.solidFuel && !specRecipes.fluidFuel) { if (debug) console.log(`No fuel found for ${recipe.path}`); return; }
                let producedEnergy = specRecipes.burntime; // The higher the burntime the more instant energy we produce
                let producedHeat = specRecipes.superheated ? specRecipes.burntime : 0; // Superheated fuels produce heat

                // Map every stack of a ingredient
                if (specRecipes.solidFuel) {
                    for (let stack of specRecipes.solidFuel.stacks) {
                        if (stack.count <= 0) continue; // Ignore empty stacks
                        this.updateFuelMap(
                            JsonUtils.toString(stack),
                            "solid",
                            `${recipe.path}`,
                            specRecipes.burntime,
                            specRecipes.superheated,
                            producedEnergy,
                            producedHeat,
                            specRecipes.solidByproducts,
                            specRecipes.fluidByproducts
                        );
                    }
                }

                // Map every fluid of a fluid ingredient
                if (specRecipes.fluidFuel) {
                    for (let fluid of specRecipes.fluidFuel.fluids) {
                        if (fluid.id.match(/(?:[\b:]flowing_)|(?:_flowing$)/)) continue; // Ignore flowing fluids
                        if (fluid.amount <= 0) continue; // Ignore empty fluids
                        this.updateFuelMap(
                            JsonUtils.toString(fluid),
                            "fluid",
                            `${recipe.path}`,
                            specRecipes.burntime,
                            specRecipes.superheated,
                            producedEnergy,
                            producedHeat,
                            specRecipes.solidByproducts,
                            specRecipes.fluidByproducts
                        );

                        // Also add the bucket form if it exists
                        let bucket = fluid.fluid.bucket.asIngredient().stacks.first;
                        let bucketJson = JsonUtils.toString(bucket);
                        // Calculate the amount of buckets worth of fluid we had
                        bucket.setCount(Math.floor(fluid.amount / 1000));
                        if (bucket && bucketJson.length) {
                            if (bucket.count <= 0) continue; // Ignore empty stacks
                            this.updateFuelMap(bucketJson,
                                "solid",
                                `${recipe.path}`,
                                specRecipes.burntime,
                                specRecipes.superheated,
                                producedEnergy,
                                producedHeat,
                                specRecipes.solidByproducts,
                                specRecipes.fluidByproducts
                            );
                        }
                    }
                }
            },

            /**
             * Iterates over the unifyMap and creates a machine for each entry.
             */
            doRecipes() {
                this.fuelMap.forEach((fuelData, fuelStrJson) => {

                    // Create the UI for this recipe
                    if (debug) console.log(`Finializing recipe for fuel: ${fuelStrJson} with data: ${JsonUtils.toString(fuelData)}`)
                    let ui = constructUI();

                    // Create the machine builder
                    // @ts-expect-error time:ticks takes numbers.
                    let machine = MACH_EVENT.recipes.modular_machinery_reborn.machine_recipe(MACH_ID, 1)

                    /** 
                     * Anything that needs to be displayed needs to be included onto this variable
                     * Any requirements that are not included here will not be shown in JEI.
                     * This is display only and does not affect the actual recipe in any way.
                     */
                    // let recipeDisplay = machine.jei();
                    let solidFuel = null;
                    let fluidFuel = null;
                    const scale = 1; // Scale to per second values for fluids, 1 to turn off scaling

                    /** Solid fuel stack */
                    if (fuelData.type == "solid") {
                        let sol = JSON.parse(fuelStrJson);
                        if (!sol || !sol.count) throw new Error(`Not a valid solid fuel: ${fuelStrJson}`);
                        sol.item = sol.item || sol.id; // Handle both item and id keys
                        solidFuel = Item.of(sol);
                        if (debug) console.log(`Final solid fuel: ${JsonUtils.toString(solidFuel)}`);
                    }
                    /** Fluid fuel stack */
                    if (fuelData.type == "fluid") {
                        let fluidData = matrixUtil.prepareFluidIngredient(fuelStrJson);
                        if (fluidData) fluidFuel = matrixUtil.createFluidIngredient(fluidData).fluids.find(f => f.amount > 0);

                        // Scale the amount to per second values
                        if (fluidFuel && scale > 1) {
                            fluidFuel.setAmount(Math.max(Math.floor(fluidFuel.amount / scale), 1));
                            Object.assign(fuelData, {
                                producedEnergy: Math.max(Math.floor(fuelData.producedEnergy / scale), 1),
                                producedHeat: Math.max(Math.floor(fuelData.producedHeat / scale), 1)
                            });
                        }

                    }

                    // If we have neither fuel type, or the fuel is empty, throw an error
                    if ((fuelData.type == "solid" && !solidFuel.count) || (fuelData.type == "fluid" && !fluidFuel.amount)) {
                        throw new Error(`No valid fuel found for recipe: ${JsonUtils.toString(fuelData)}`)
                    }
                    if (debug) console.log(`Solid Fuel: ${JsonUtils.toString(solidFuel)}, Fluid Fuel: ${JsonUtils.toString(fluidFuel)}`)
                    /** A list of solid byproducts */
                    let solidByproducts = fuelData.solidbyproducts
                    /** A list of fluid byproducts */
                    let fluidByproducts = fuelData.fluidbyproducts

                    let cols = ui.columns();
                    let rows = ui.rows();
                    let specialTopSlots = 0;
                    let specialCols = 2; // The first two columns are special and reserved for fuel, progress and energy

                    // Placement at the top left corner
                    // If there is a solid fuel it goes at 0,0
                    // If there is a fluid fuel it goes at 20,0 or 0,0 if no solid fuel
                    let solidFuelPos = { x: 0, y: 0 };
                    let fluidBarPos = { x: solidFuelPos.x ? solidFuelPos.x + ui.tilesize : 0, y: 0 };

                    // Placing the progress arrow just below the required fuel.
                    let posProgress = {
                        x: solidFuelPos.x ? solidFuelPos.x : fluidBarPos.x,
                        y: (solidFuelPos.y ? solidFuelPos.y : fluidBarPos.y) + 1 * ui.tilesize
                    };
                    machine.progressX(posProgress.x)
                    machine.progressY(posProgress.y)
                    // recipeDisplay.progressX(posProgress.x)
                    // recipeDisplay.progressY(posProgress.y)
                    // The energy bar is to the right of the progress arrow.
                    let energyBarPos = { x: solidFuelPos.x, y: (solidFuelPos.y ? solidFuelPos.y : fluidBarPos.y) + ui.tilesize };

                    // If there is fuel add it to the recipe and the UI
                    if (solidFuel && solidFuel.id !== "minecraft:air") {
                        if (debug) console.log(`Solid fuel found: ${JsonUtils.toString(solidFuel)}`);
                        // @ts-expect-error Ts complianing about itemstack type and itemstacks, etc
                        machine.requireItem(solidFuel, 1, solidFuelPos.x, solidFuelPos.y);
                        // recipeDisplay.requireItem(solidFuel, 1, solidFuelPos.x, solidFuelPos.y);
                        ui.reservePos(solidFuelPos.x, solidFuelPos.y, ["Solid Fuel"]);
                    }

                    // If there is a fluid fuel add it to the recipe and the UI
                    // We have to account for the bar being three tiles high
                    if (fluidFuel) {
                        if (debug) console.log(`Fluid fuel found: ${JsonUtils.toString(fluidFuel)}`);
                        // @ts-expect-error Ts complianing about itemstack type and itemstacks, etc
                        machine.requireFluid(fluidFuel, 1, fluidBarPos.x, fluidBarPos.y);
                        // recipeDisplay.requireFluid(fluidFuel, 1, fluidBarPos.x, fluidBarPos.y);
                        ui.reservePos(fluidBarPos.x, fluidBarPos.y, ["Fluid Bar"]);
                    }

                    // Place the energy bar if there is produced energy
                    if (fuelData.producedEnergy) {
                        if (debug) console.log(`Produced energy: ${fuelData.producedEnergy}`);
                        // Attempt to produce 1 tick worth of energy for testing
                        machine.produceEnergy(1, energyBarPos.x, energyBarPos.y)
                        matrixUtil.fuelRecipeData.energy = fuelData.producedEnergy;
                        machine.requireFunctionOnEnd("forceEnergy")
                        ui.reserveBarPos(energyBarPos.x, energyBarPos.y, ["Energy Bar"]);
                    }

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

                    // Add the solid byproducts to the UI and the recipe
                    solidByproducts
                        .forEach((stack, index) => {
                            // A new position for the item, and then produce the item
                            let pos = ui.getNewPos(index, [`Result ${JsonUtils.toString(stack)}`], false, cols, rows)
                            if (debug) console.log(`Adding item: ${JsonUtils.toString(stack)} at ${pos.x}, ${pos.y}`)
                            // @ts-expect-error Ts complianing about itemstack type and itemstacks, etc
                            machine.produceItem(stack, 1, pos.x, pos.y)
                            // recipeDisplay.produceItem(stack, 1, pos.x, pos.y)
                        })
                    // Add the fluid byproducts to the UI and the recipe
                    fluidByproducts
                        .forEach((fluid, index) => {
                            // A new position for the fluid, and then produce the fluid
                            let pos = ui.getNewPos(index, [`Fluid Result ${JsonUtils.toString(fluid)}`], true, cols, rows)
                            if (debug) console.log(`Adding fluid: ${JsonUtils.toString(fluid)} at ${pos.x}, ${pos.y}`)
                            // @ts-expect-error Ts complianing about itemstack type and itemstacks, etc
                            machine.produceFluid(fluid, 1, pos.x, pos.y)
                            // recipeDisplay.produceFluid(fluid, 1, pos.x, pos.y)
                        })
                    let dim = ui.getReservedBoundingBox()
                    machine.width(dim.width)
                    machine.height(dim.height)

                    // Display the reserved positions
                    if (debug) {
                        console.log('Reserved positions:');
                        console.log(ui.reservations.map(pos => [pos.x, pos.y, pos.party]).join('\n'));
                    }
                });
            }
        }
    };

    MMREvents.recipeFunction("forceEnergy", event => {
        // @ts-expect-error Argument of type '$IOType' is not assignable to parameter of type '$IOType$$Type'.ts(2345)
        let energyStored = event.machine.getEnergyStored($IOType.OUTPUT)
        if (energyStored > 1) {
            event.machine.addEnergy(Math.max(matrixUtil.fuelRecipeData.energy - 1, 0));
            // Reset
            matrixUtil.fuelRecipeData.energy = 0;
        }
    })

    /**
     * A front facing function to assign machine recipes
     * @param {$RecipesKubeEvent_} event
     * @param {string} MACH_TYPE
     * @param {$RecipeFilter_} MACH_RECIPE_FILTER
     */
    function recipesMACH(event, MACH_TYPE, MACH_RECIPE_FILTER) {
        let MACH_ID = mekanismMatrix.machineType.get(MACH_TYPE).id;
        let matrix = constructRecipe(MACH_ID, event);
        event.forEachRecipe(MACH_RECIPE_FILTER, (recipe) => {
            let isWorthy = mekanismMatrix.machineType.get(MACH_TYPE).cleaner(event, recipe);
            if (!isWorthy) {
                if (debug) console.log(`Recipe ${recipe.getId()} is not worthy for ${MACH_TYPE}`);
                return;
            }
            matrix.init(MACH_TYPE, recipe);
        })

        if (debug) console.log(`Finalizing Unification`)
        let recipe = JsonUtils.toString(matrix.fuelMap.entries().next().value);
        if (debug) console.log(`First Unified Recipe: ${recipe}`)
        matrix.doRecipes();
    }

    /**
     * Constructs and returns an object representing a machine builder for Chromatic Fans.
     * @param {string} MACH_TYPE - The unique identifier for the machine to be built.
     * @param {string} traitItem - The item to be used as a trait for the machine.
     * @returns An object containing machine configurations and a method
     * to build the machine.
     */
    function machBuilder(MACH_TYPE, traitItem) {

        let bannedBlocks = [""];
        let bannedFluids = [""];
        let bannedItems = [""];
        return {
            baseMachineID: MACH_TYPE,
            traitItem: traitItem,
            machineType: new Map([
                ["heat_mekanism", {
                    id: MACH_TYPE.concat("_heat_mekanism"),
                    name: "Phoneix Matrix - Heat Mekanism",
                    color: Color.rgba(245, 251, 252, 0.99),
                    coreItem: ["modular_machinery_reborn:casing_firebox"],
                    gateItem: "mekanism:steel_casing",
                    coreBlock: "mekanism:steel_casing",
                    model: "minecraft:chiseled_polished_blackstone",
                    restrictedBlocks: bannedBlocks,
                    restrictedFluids: bannedFluids,
                    restrictedItems: bannedItems.concat("mekanism:steel_casing"),
                    /** A filter for incoming recipes */
                    inspectorFilter: {
                        or: [{ type: "createaddition:liquid_burning" }]
                    },
                    /**
                     * A map of generated recipes from the inspector function. Keyed by recipe path.
                     * @type {Map<string, {
                     * kubeRecipe: $KubeRecipe_,
                     * MACH_TYPE: string,
                     * solidFuel: import("net.minecraft.world.item.crafting.Ingredient").$Ingredient,
                     * fluidFuel: import("net.neoforged.neoforge.fluids.crafting.SizedFluidIngredient").$SizedFluidIngredient,
                     * burntime: number,
                     * superheated: boolean,
                     * solidByproducts: import("net.minecraft.world.item.ItemStack").$ItemStack[],
                     * fluidByproducts: import("net.neoforged.neoforge.fluids.FluidStack").$FluidStack[],
                     * }>}
                     */
                    prettyRecipes: new Map(),
                    /**
                     * Phrases raw recipe data into a standardized format for this machine type.
                     * @param {$RecipesKubeEvent_} event - The event to handle recipes
                     * @param {$KubeRecipe_} kubeRecipe - The recipe to handle
                     * @returns - Whether the recipe should be handled by this machine
                     */
                    cleaner(event, kubeRecipe) {
                        /** Ensure the recipe path is a static string as this is how it will be referenced */
                        let path = `${kubeRecipe.path}`;
                        let reciStr = JsonUtils.toString(kubeRecipe.json);
                        let recipe = JSON.parse(reciStr);
                        if (debug) console.log(`Cleaning Recipe: ${reciStr} at ${path}`);
                        let fuelKey = matrixUtil.fuelKeys.get(recipe.type);
                        if (debug) console.log(`Using fuel key: ${fuelKey}`);
                        /** Getter for recipe properties @param {RegExp} match */
                        let lookup = (match) => {
                            if (debug) console.log(`Looking up property with match: ${match}`);
                            let key = Object.keys(recipe).find(key => key.match(match));
                            if (debug) console.log(`Found property: ${key} with value: ${JsonUtils.toString(recipe[key])}`);
                            return recipe[`${key}`] || null;
                        }

                        // Get the fuel from the recipe and parse it.
                        let data = lookup(new RegExp(`\\b(?:${fuelKey})\\b`)); let flu = null;
                        if (debug) console.log(`Found fuel ingredient: ${JsonUtils.toString(data)}`);
                        let ing = Ingredient.of(JsonUtils.toString(data));
                        if (debug) console.log(`Parsed ingredient: ${JsonUtils.toString(ing)}`);
                        // Check if the ingredient is a fluid ingredient
                        let fluidData = matrixUtil.prepareFluidIngredient(JsonUtils.toString(ing));
                        if (debug) console.log(`Is fluid ingredient: ${fluidData}`);
                        // If the ingredient is a fluid ingredient, parse it as such. Clear the non-item ingredient.
                        if (fluidData) {
                            flu = matrixUtil.createFluidIngredient(fluidData); ing = null;
                            if (debug) console.log(`Parsed fluid ingredient: ${JsonUtils.toString(flu)}`);
                        }

                        let burn = lookup(/\b(?:burn(?:[\s_-])time)\b/) || 0;
                        /** Can this fuel be used to super heat a blaze burner? */
                        let isSuperHeated = lookup(/\b(?:superheated)\b/) || false;

                        // Get the byproducts
                        this.prettyRecipes.set(path, {
                            kubeRecipe: kubeRecipe,
                            MACH_TYPE: MACH_TYPE,
                            solidFuel: ing,
                            fluidFuel: flu,
                            burntime: burn,
                            superheated: isSuperHeated,
                            solidByproducts: [],
                            fluidByproducts: []
                        });
                        // Returns true if the recipe was successfully added to prettyRecipes, false otherwise.
                        // A return value of false means the recipe did not meet the criteria and was not registered for this machine type.
                        return this.prettyRecipes.has(path);
                    }
                }]
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
                            // Middle, 
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
    let mekanismMatrix = machBuilder("mmr:matrix", "mekanism:fuelwood_heater");

    MMREvents.machines(event => {
        // TODO: MACHINE SOUNDS

        /** All types of chromatic fans */
        mekanismMatrix.machineType.forEach((_, typeKey) => {
            mekanismMatrix.buildMACH(event, typeKey);
        })
    });

    ServerEvents.recipes(event => {
        mekanismMatrix.machineType.forEach((type, typeKey) => {
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
                    a: mekanismMatrix.traitItem, // The defining trait of the chromatic fan.
                    c: type.gateItem || mekanismMatrix.traitItem, // A item that will be used as a gate
                    b: [].concat(type.coreItem, mekanismMatrix.parseBlocktoItems(type.coreBlock, typeKey)).filter(a => a),  //arg 3: the mapping object
                }
            )

        })


    });


})();