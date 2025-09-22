// priority: -20
// requires: projecte
// requires: exdeorum
// @ts-check
// Automatically map Water Crucible recipes to ProjectE conversions.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?
    const filePath = 'kubejs/data/projecte/pe_custom_conversions/generated_water_crucible.json';

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
        const name = "water_crucible";
        const comment = "Water Crucible recipes mapped to ProjectE conversions.";
        const conversions = [];

        if (JsonIO.read(filePath)) {
            if (debug) console.log(`File ${filePath} already exists. Skipping generation.`);
            return;
        }


        event.forEachRecipe({
            or: [
                { type: "exdeorum:water_crucible" }
            ]
        }, recipe => {
            if (debug) {
                console.log(`Found Water Crucible recipe: ${recipe.id}`);
                console.log(JsonUtils.toPrettyString(recipe.json));
            }
            let json = recipe.json;
            let ingredients = [];
            let output = [];

            // Unprocessed recipe data
            let rawIngredients = JsonUtils.of([].concat(
                json.get("ingredient"), json.get("ingredients"),
                json.get("input"), json.get("inputs")
            ));

            let rawResults = JsonUtils.of([].concat(
                json.get("result"), json.get("results"),
                json.get("output"), json.get("outputs"),
                // For crucibles, the output is a fluid
                json.get("fluid"), json.get("fluids")
            ));

            // Default to empty arrays if null
            let rawInputs = JsonUtils.of([]).asJsonArray;
            let rawFluids = JsonUtils.of([]).asJsonArray;

            // Resolve ingredients into item and fluid lists
            if (!rawIngredients.isJsonArray()) return;
            let ingredientsArray = rawIngredients.asJsonArray;
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
            let resultsArray = rawResults.asJsonArray;
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
                "ingredients": ingredients,
                "output": output.find(o => o) // ProjectE only supports single output
            };

            if (
                // No keys are null/undefined
                (Object.keys(conversion).map(k => conversion[k]).some(v => !v))
                // Output must have id or tag
                || (!conversion.output.id && !conversion.output.tag)
            ) {
                throw new Error(`Invalid conversion generated from recipe ${recipe.id}: ${JsonUtils.toPrettyString(conversion)}`);
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
