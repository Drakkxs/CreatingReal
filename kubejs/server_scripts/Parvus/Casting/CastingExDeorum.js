// priority: -10
// requires: casting
// requires: exdeorum
// requires: bblcompat
// @ts-check
// ExDeorum chunks should melt into their molten forms.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?

    const castingRecipeType = "casting:melting";
    const chunkTag = "#exdeorum:ore_chunks";
    const chunkItems = Ingredient.of(chunkTag).itemIds;
    const oreTag = "#c:ores"; // General ore tag
    const groundTag = "#c:ores_in_ground"; // Ore in stone tag (usually stone)
    // For stone types as ores can be found in different blocks
    // Tags exist for stone, deepslate, ancient_stone, blackstone, netherrack, and end_stone
    const oreType = {
        cobalt: "nether"
    };

    /**
     * Extracts the chunk name from a given chunk ID string.
     *
     * The function uses a regular expression to match and capture the chunk name,
     * ignoring common prefixes and suffixes such as "ore_", "_ore", "_chunk", etc.
     *
     * @param {string} chunkId - The chunk ID string to extract the name from.
     * @returns {string|null} The extracted chunk name, or null if no match is found.
     */
    function getChunkName(chunkId) {
        const match = chunkId.match(/:(?:_)?(?:ore_)?(\w+?)(?:_ore)?(?:_chunk)?(?:_)?$/);
        return match ? match[1] : null;
    }

    /**
     * Retrieves the item ID associated with a given ore tag using AlmostUnified.
     *
     * @param {string} tagKJS - The ore tag string, possibly prefixed with '#'.
     * @returns {string} The item ID location as a string, or an empty string if not found or on error.
     */
    function getOreItem(tagKJS) {
        try {
            let a = AlmostUnified.getTagTargetItem(tagKJS.replace("#", ""));
            if (debug) console.log(`Almost Unified result for ${tagKJS}: ${a}`);
            return String(a.idLocation)
        }
        catch (e) { if (debug) console.log(`Error getting tag target item for ${tagKJS}: ${e}`); return ""; }
    }

    /**
         * Returns the variant item ID for the given item if it is a valid ingredient,
         * otherwise returns the original item.
         *
         * @param {string} item - The item identifier to check for a variant.
         * @returns {string} The variant item ID if valid, or the original item.
         */
    function getVariantItem(item) {
        let a = AlmostUnified.getVariantItemTarget(item).idLocation.toString()
        return !Ingredient.of(a).isEmpty() ? a : item;
    }

    ServerEvents.recipes(event => {

        chunkItems.forEach(chunkId => {
            if (debug) console.log(`Checking Chunk: ${chunkId}`);
            // Find out if the ore has a recipe
            const recipe = event.findRecipes({ output: chunkId })
            // If the chunk has no recipe, skip it.
            if (recipe.isEmpty() && debug) console.log(`No recipe for chunk: ${chunkId}`);
            if (recipe.isEmpty()) return;
            // Get the chunk name
            const chunkName = getChunkName(chunkId);
            if (debug) console.log(`Chunk Name: ${chunkName}`);

            // Get the ore tag from the chunk name
            const chunkOreTag = `${oreTag}/${chunkName}`;
            if (debug) console.log(`Ore Tag: ${chunkOreTag}`);

            // Map the ore based on which type it comes from.
            let chunkOreId = getOreItem(chunkOreTag);
            if (!chunkOreId.match(/\w+/) && debug) console.warn(`No ore item found for tag: ${chunkOreTag}`);
            if (!chunkOreId.match(/\w+/)) return;
            if (debug) console.log(`Ore Item: ${chunkOreId}`);


            // If there is already a recipe that outputs the ore using this chunk, skip it.
            const existingRecipe = event.findRecipes({
                output: chunkOreId, input: chunkId, or: [
                    { type: "casting:melting" }
                ]
            });

            if (!existingRecipe.isEmpty() && debug) console.log(`Recipe already exists for ${chunkId} to ${chunkOreId}`);
            if (!existingRecipe.isEmpty()) return;

            // Find the correct stone type for the ore if it needs one.
            let stoneType = oreType[chunkName] || "";
            if (debug) console.log(`Stone Type for ${chunkName}: ${stoneType}`);
            if (stoneType) {
                // We look through the ores in the ore tag to find one that matches the stone type.
                // This is because ores can be found in different stone types.
                // We will look for the first one that matches the stone type.
                let regex = new RegExp(`\\w+:(?:\\w+_)?${stoneType}(?:_\\w+)?`);
                let chunky = Ingredient.of(chunkOreTag).itemIds
                    .toArray().map(id => String(id))
                    .filter(id => id.match(regex))
                    // Collect the first match that is the unified mod.
                    .find(id => AlmostUnified.getVariantItemTarget(id).idLocation.toString() === id);
                // If none found then we fall back to the original ore item.
                chunkOreId = chunky || chunkOreId;
            }
            if (debug) console.log(`Final Ore Item for ${chunkName}: ${chunkOreId}`);

            // Find melting recipes for the ore
            const oreMeltingRecipe = event.findRecipes({
                input: chunkOreId,
                type: castingRecipeType
            }).stream().findFirst().orElse(null);

            if (!oreMeltingRecipe) {
                if (debug) console.log(`No melting recipe found for ${chunkOreId}`);
                return;
            }

            // Retrieve the JSON
            let oreCastingRecipe = oreMeltingRecipe.json
            // Add error handling for missing or invalid recipe data
            if (!oreCastingRecipe.has("meltingTemp") || !oreCastingRecipe.has("output")) {
                console.error(`Invalid recipe data for chunk ${chunkId}`);
                return;
            }

            // Create a new melting recipe
            event.custom({
                "neoforge:conditions": [
                    {
                        "type": "almostunified:conditional",
                        "conditions_met": true,
                        "original_conditions": [
                            {
                                "type": "neoforge:not",
                                "value": {
                                    "type": "neoforge:tag_empty",
                                    "tag": chunkTag
                                }
                            }
                        ]
                    }
                ],
                "type": "casting:melting",
                "input": {
                    "count": 1,
                    "item": chunkId
                },
                "meltingTemp": oreCastingRecipe.get("meltingTemp").asNumber,
                "output": {
                    // Chunks are melted down into their liquid form at the same efficiency as their ore form
                    "amount": oreCastingRecipe.get("output").asJsonObject.get("amount").asNumber,
                    "id": oreCastingRecipe.get("output").asJsonObject.get("id").asString
                }
            })


        })
    })
})()
