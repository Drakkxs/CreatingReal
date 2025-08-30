// priority: 0
// requires: exdeorum
// @ts-check
// ExDeorum chunks don't have recipes so let's add some.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?

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
            const existingRecipe = event.findRecipes({ output: chunkOreId, input: chunkId, or: [{ type: "minecraft:crafting_shaped" }, { type: "minecraft:crafting_shapeless" }] });
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

            // Now we can add the recipe. Four chunks make one ore.
            let craft = event.shaped(chunkOreId, [
                "CC",
                "CC"
            ], {
                C: chunkId
            }).id(`kubejs:exdeorum/ore_from_chunk/${chunkName}`); // Custom ID to prevent duplicates
            if (debug) console.log(`Added recipe ${craft.getId()} for ${chunkId} to ${chunkOreId}`);
        })
    })
})()
