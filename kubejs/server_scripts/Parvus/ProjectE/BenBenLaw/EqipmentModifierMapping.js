// priority: -20
// requires: projecte
// requires: casting
// @ts-check
// Automatically map Equipment Modifier recipes to ProjectE conversions.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?
    const filePath = 'kubejs/data/projecte/pe_custom_conversions/generated_equipment_modifier.json';

    /**
     * @param {string} name
     * @param {string} comment
     * @param {Array<{
     *   ingredients: Array<{
     *     type: string,
     *     amount?: number,
     *     count?: number,
     *     id?: string,
     *     tag?: string
     *   }>,
     *   output: {
     *     type: string,
     *     amount?: number,
     *     count?: number,
     *     id?: string,
     *     tag?: string
     *   },
     * }>} conversions
     */
    function addConversionGroup(name, comment, conversions) {
        // Output conversion must be a JsonObject
        if (!(conversions.find(c => JsonUtils.of(c.output).isJsonObject()))) {
            throw new Error("Output conversion must be a JsonObject");
        }
        JsonIO.write(filePath, {
            "groups": (function () {
                let obj = {};
                obj[name] = {
                    "comment": comment,
                    "conversions": conversions
                };
                return obj;
            })()
        });
    }

    /**
     * Transposes a key in an object.
     * @param {string} str
     * @param {string} oldKey 
     * @param {string} newKey 
     * @returns
     */
    function transposeKey(str, oldKey, newKey) {
        if (debug) console.log(`Transposing key ${oldKey} to ${newKey} in ${str}`);
        let obj = JsonUtils.toObject(JsonUtils.fromString(str));
        if (!(oldKey in obj)) {
            if (debug) console.log(`Key ${oldKey} not found in object.`);
            return JsonUtils.fromString(JsonUtils.toString(obj)).asJsonObject;
        }
        if (debug) console.log(`Parsed object: ${JsonUtils.toString(obj)}`);
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
        let mappedObject = obj
        if (debug) console.log(`Transposed object: ${JsonUtils.toString(mappedObject)}`);
        return JsonUtils.fromString(JsonUtils.toString(mappedObject)).asJsonObject;
    }

    /**
     * This function flattens a key in an object.
     * @param {string} str 
     * @param {string} key
     * @return
     */
    function flattenKey(str, key) {
        if (debug) console.log(`Flattening key ${key} in ${str}`);
        let obj = JsonUtils.toObject(JsonUtils.fromString(str));
        let nested = obj[key];
        if (!nested) return JsonUtils.fromString(JsonUtils.toString(obj)).asJsonObject;
        // Remove the key and merge its contents into the parent object
        delete obj[key];
        Object.assign(obj, nested);
        if (debug) console.log(`Flattened object: ${JsonUtils.toString(obj)}`);
        return JsonUtils.fromString(JsonUtils.toString(obj)).asJsonObject;
    }

    ServerEvents.recipes(event => {
        const name = "equipment_modifier";
        const comment = "BBL Equipment Modifier recipes mapped to ProjectE conversions.";
        const conversions = [];

        if (JsonIO.read(filePath)) {
            if (debug) console.log(`File ${filePath} already exists. Skipping generation.`);
            return;
        }

        // Recipes can include their workstation to help truly identify the cost of the conversion
        // This is to ensure cheap conversions aren't favored from a workstation that is hard to make.
        const workstationMap = new Map([
            ["casting:equipment_modifier", {
                "comment": "workstation",
                "type": "projecte:item",
                "id": "casting:equipment_modifier",
                "count": 1
            }]
        ]);


        event.forEachRecipe({
            or: [
                { type: "casting:equipment_modifier" }
            ]
        }, recipe => {
            if (debug) {
                console.log(`Found BBL recipe: ${recipe.id}`);
                console.log(JsonUtils.toPrettyString(recipe.json));
            }
            // Copy to avoid mutating the original recipe
            let json = JsonUtils.of(recipe.json).asJsonObject;
            let ingredients = [];
            let output = [];
            let workstation = workstationMap.get(`${json.get("type").asString}`);
            if (!workstation) throw new Error(`No workstation mapping found for recipe type: ${json.get("type").asString}`);

            // Unprocessed recipe data
            let rawIngredients = JsonUtils.of([].concat(
                json.get("upgrade_item"),
                json.get("upgrade_fluid")
            ));

            // For the equipment_modifier, the only concern is the effect which is just a string.
            // Ex: "effect": "torch_placing"
            let rawEffect = JsonUtils.of([].concat(json.get("effect")));
            let rawResults = JsonUtils.of([]); // Placeholder for results

            // In a equipment_modifier recipe, the effect is the output
            if (!rawEffect.isJsonArray()) return;
            // Convert the effect string to an item id
            let effectArray = rawEffect.asJsonArray;
            effectArray.forEach(effectRaw => {
                if (!effectRaw.jsonPrimitive) return;

                let effect = effectRaw.asString;
                if (!effect) return;

                // Try to resolve the effect to an item
                // First try casting namespace, then minecraft, then raw
                if (debug) console.log(`Effect string: ${effect}`);
                let effectItem = Item.of(`casting:${effect}`, 1);
                if (effectItem.empty) effectItem = Item.of(`minecraft:${effect}`, 1);
                if (effectItem.empty) effectItem = Item.of(effect, 1);
                if (debug) console.log(`Effect item: ${effectItem.toJson()}`);
                if (effectItem.empty) return;
                rawResults = JsonUtils.of([effectItem.toJson()]);
            });

            // Default to empty arrays if null
            let rawInputs = JsonUtils.of([]).asJsonArray;
            let rawFluids = JsonUtils.of([]).asJsonArray;

            /**
             * Flattens a JsonArray by one level.
             * @param {import("com.google.gson.JsonArray").$JsonArray} jsonArray
             * @returns
             */
            function flattenArray(jsonArray) {
                let flat = [];
                jsonArray.forEach(e => {
                    let json = JsonUtils.of(e);
                    if (json && json.jsonNull) return;
                    if (e && e.isJsonArray()) {
                        flat = flat.concat(e.asJsonArray.asList().toArray());
                    } else if (e != null) {
                        flat.push(e);
                    }
                });
                if (debug) console.log(`Flattened Array: ${flat}`)
                jsonArray = JsonUtils.of(flat).asJsonArray;
                return jsonArray;
            }

            // Resolve ingredients into item and fluid lists
            if (!rawIngredients.isJsonArray()) return;
            let ingredientsArray = flattenArray(rawIngredients.asJsonArray);
            ingredientsArray.forEach(ing => {
                if (!ing.isJsonObject()) return;
                let ingObj = ing.asJsonObject;
                let isfluid = ingObj.get("amount")
                if (isfluid) {
                    let fluidList = rawFluids.asList()
                    fluidList.add(ing);
                    rawFluids = JsonUtils.of(fluidList).getAsJsonArray();
                } else {
                    let itemList = rawInputs.asList()
                    itemList.add(ing);
                    rawInputs = JsonUtils.of(itemList).getAsJsonArray();
                }
            });

            // Resolve fluid ingredients
            if (!rawFluids.isJsonArray()) return;
            let fluidsArray = rawFluids.asJsonArray;
            fluidsArray.forEach(fluid => {
                if (!fluid.isJsonObject()) return;
                let fluidObj = fluid.asJsonObject;
                fluidObj.add("type", "projecte:fluid");
                // Take out nested "basePredicate" if exists
                fluidObj = flattenKey(JsonUtils.toString(fluidObj), "basePredicate");
                // Change "fluid" key to "id"
                fluidObj = transposeKey(JsonUtils.toString(fluidObj), "fluid", "id");
                // Change "fluid" key to "id"
                fluidObj = transposeKey(JsonUtils.toString(fluidObj), "fluid_tag", "tag");
                ingredients.push(JsonUtils.toObject(fluidObj));
            });

            // Resolve item ingredients
            if (!rawInputs.isJsonArray()) return;
            let inputsArray = rawInputs.asJsonArray;
            inputsArray.forEach(input => {
                if (!input.isJsonObject()) return;
                let inputObj = input.asJsonObject;
                inputObj.add("type", "projecte:item");
                // Take out nested "basePredicate" if exists
                inputObj = flattenKey(JsonUtils.toString(inputObj), "basePredicate");
                // Change "item" key to "id"
                inputObj = transposeKey(JsonUtils.toString(inputObj), "item", "id");
                ingredients.push(JsonUtils.toObject(inputObj));
            });


            // Resolve output items and fluids
            if (!rawResults.isJsonArray()) return;
            let resultsArray = flattenArray(rawResults.asJsonArray);
            resultsArray.forEach(result => {
                if (!result.isJsonObject()) return;
                let resultObj = result.asJsonObject;
                let isfluid = resultObj.get("amount")

                // Take out nested "basePredicate" if exists
                resultObj = flattenKey(JsonUtils.toString(resultObj), "basePredicate");

                if (isfluid) {
                    resultObj.add("type", "projecte:fluid");
                    // Change "fluid" key to "id"
                    resultObj = transposeKey(JsonUtils.toString(resultObj), "fluid", "id");
                    // Change "fluid_tag" key to "tag"
                    resultObj = transposeKey(JsonUtils.toString(resultObj), "fluid_tag", "tag");
                } else {
                    resultObj.add("type", "projecte:item");
                    // Change "item" key to "id"
                    resultObj = transposeKey(JsonUtils.toString(resultObj), "item", "id");
                }

                // Sometimes ID is nested in a ID object after item transpose
                if (resultObj.get("id") && !(resultObj.get("id").isJsonPrimitive())) {
                    resultObj = flattenKey(JsonUtils.toString(resultObj), "id");
                }

                output.push(JsonUtils.toObject(resultObj));
            });

            let conversion = {
                "ingredients": ingredients.concat(workstation)
                    // Filter out invalid ingredients
                    .filter(i => (i.id || i.tag) || (i.type == "projecte:fake")),
                "output": output
                    // Filter out chanced outputs. Allow those without a chance tag.
                    .filter(o => (!o.chance || o.chance >= 1) && (o.id || o.tag))
                    .find(o => o.id || o.tag)
            };

            if (
                (!conversion.ingredients || !conversion.ingredients.length) || (!conversion.output || !Object.keys(conversion.output).length)
            ) {
                throw new Error(`Invalid conversion generated from recipe: ${JsonUtils.toPrettyString(json)} Converted: ${JsonUtils.toPrettyString(conversion)}`);
            }

            if (debug) {
                console.log(`Conversion: ${JsonUtils.toPrettyString(conversion)}`); // Debug output
            }
            conversions.push(conversion);

        });

        if (!conversions.length) {
            if (debug) console.log("No conversions found.");
            return;
        }

        addConversionGroup(name, comment, conversions);
    });

})()
