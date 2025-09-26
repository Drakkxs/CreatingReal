// priority: -20
// requires: projecte
// requires: cloche
// requires: opolisutilities
// @ts-check
// Automatically map Cloche recipes to ProjectE conversions.


// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?
    const filePath = 'kubejs/data/projecte/pe_custom_conversions/generated_cloche.json';

    /** @type {import("dev.latvian.mods.kubejs.server.ServerKubeEvent").$ServerKubeEvent} */
    let MinecraftServer;
    ServerEvents.tick(event => {
        MinecraftServer = event
    })

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

    ServerEvents.recipes(event => {
        const name = "cloche";
        const comment = "Cloche recipes automatically mapped from Botany Pots recipes.";
        const conversions = [];

        if (JsonIO.read(filePath)) {
            if (debug) console.log(`File ${filePath} already exists. Skipping generation.`);
            return;
        };

        // Recipes can include their workstation to help truly identify the cost of the conversion
        // This is to ensure cheap conversions aren't favored from a workstation that is hard to make.
        const workstationMap = new Map([
            ["cloche:cloche", {
                "comment": "workstation",
                "type": "projecte:item",
                "id": "cloche:cloche",
                "count": 1
            }],
            ["opolisutilities:cloche", {
                "comment": "workstation",
                "type": "projecte:item",
                "id": "opolisutilities:cloche",
                "count": 1
            }]
        ]);

        event.forEachRecipe({ or: [{ type: "opolisutilities:cloche" }, { type: "cloche:cloche" }] }, recipe => {
            if (debug) {
                console.log(`Found Cloche recipe: ${recipe.id}`);
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
                json.get("ingredient"), json.get("ingredients"),
                json.get("input"), json.get("inputs"),
                json.get("fluid"), json.get("fluids"),
                json.get("soil"), json.get("catalyst"),
                json.get("seed")
            ));

            let rawResults = JsonUtils.of([].concat(
                json.get("result"), json.get("results"),
                json.get("output"), json.get("outputs"),
                json.get("mainOutput"), json.get("shears_result")
            ));

            // Default to empty arrays if null
            let rawInputs = JsonUtils.of([]).asJsonArray;
            let rawFluids = JsonUtils.of([]).asJsonArray;

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
                if (debug) console.log(`Processing result: ${result}, isJsonObject: ${result.isJsonObject()}`);
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

            // If the output is the same as the input, take it out.
            // This prevents infinite loops and useless conversions.
            output = output.filter(o => {
                if (debug) console.log(`Checking output ${JsonUtils.toString(o)} against inputs.`)
                let outIng = Ingredient.of(o.id || o.tag);
                let inIngs = ingredients.map(i => Ingredient.of(i.id || i.tag));
                // If either aren't ingredients, skip
                if (!outIng || !inIngs.length) return true;
                if (debug) console.log(`Output as Ingredient: ${JsonUtils.toString(outIng)}, Inputs as Ingredients: ${JsonUtils.toString(inIngs)}`);
                return inIngs.some(i => !(Object.is(outIng, i)));
            });

            let conversion = {
                "ingredients": ingredients.concat(workstation)
                    // Filter out invalid ingredients
                    .filter(i => (i.id || i.tag) || (i.type == "projecte:fake")),
                "output": output
                    // Filter out chanced outputs. Allow those without a chance tag.
                    .filter(o => (!o.chance || o.chance >= 1) && (o.id || o.tag))
            };

            // Skip if no valid output
            if (conversion.output.length == 0) {
                if (debug) console.log("No valid output found, skipping conversion.");
                return;
            }

            if (
                !conversion.ingredients.length || !conversion.output.length
            ) {
                throw new Error(`Invalid conversion generated from recipe: ${JsonUtils.toPrettyString(json)} Converted: ${JsonUtils.toPrettyString(conversion)}`);
            }

            if (debug) {
                console.log(`Conversion: ${JsonUtils.toPrettyString(conversion)}`); // Debug output
            }
            // Add output as a single conversion and avoid duplicates
            for (let output of (new Set(conversion.output))) {
                conversions.push({
                    "ingredients": conversion.ingredients,
                    "output": output
                });
            }

        });

        if (!conversions.length) {
            if (debug) console.log("No conversions found.");
            return;
        }

        addConversionGroup(name, comment, conversions);
    });

})()
