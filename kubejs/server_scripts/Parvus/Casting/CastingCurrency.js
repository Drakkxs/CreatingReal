// priority: -10
// requires: casting
// requires: lightmanscurrency
// requires: bblcompat
// @ts-check
// Lightman coins should melt into their molten forms.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?

    const castingRecipeType = "casting:melting";
    const coinTag = "#lightmanscurrency:coins";
    const coinItems = Ingredient.of(coinTag).itemIds;
    const generalTagList = ["#c:nuggets", "#c:raw_materials", "#c:ores", "#c:dusts", "#c:ingots", "#c:gems"];
    const blacklist = ["chocolate", "ancient"];
    // Coin type materials that will be allowed
    const materials = ["copper", "gold", "iron", "emerald", "diamond", "netherite"];

    /**
     * Extracts the coin name from a given coin ID string.
     * The function uses a regular expression to match and capture the coin name
     * @param {string} coinID - The coin ID string to extract the name from.
     * @returns {string|null} The extracted coin name, or null if no match is found.
     */
    function getCoinMaterial(coinID) {
        const match = coinID.match(new RegExp(`:(?:\\w+_)?(${materials.join("|")})(?:_\\w+)?$`));
        return match ? match[1] : null;
    }

    /**
     * Checks if a item id is blacklisted.
     * @param {string} itemId - The item ID to check.
     * @returns {boolean} True if the item ID is blacklisted, false otherwise.
     */
    function isBlacklisted(itemId) {
        if (debug) console.log(`Checking if blacklisted: ${itemId}`);
        return itemId.match(new RegExp(`:(?:\\w+_)?(${blacklist.join("|")})(?:_\\w+)?$`)) !== null;
    }

    /**
     * Retrieves the item ID associated with a given tag using AlmostUnified.
     *
     * @param {string} tagKJS - The tag string, possibly prefixed with '#'.
     * @returns {string} The item ID location as a string, or an empty string if not found or on error.
     */
    function getTagItem(tagKJS) {
        try {
            let a = AlmostUnified.getTagTargetItem(tagKJS.replace("#", ""));
            if (debug) console.log(`Almost Unified result for ${tagKJS}: ${a} -> ${a ? String(a.idLocation) : "null"}`);
            return String(a.idLocation)
        }
        catch (e) { if (debug) console.log(`Error getting tag target item for ${tagKJS}: ${e}`); return ""; }
    }

    ServerEvents.recipes(event => {

        coinItems.forEach(coinId => {
            if (debug) console.log(`Checking Coin: ${coinId}`);
            // Skip blacklisted coins
            if (isBlacklisted(coinId)) {
                if (debug) console.log(`Coin is blacklisted: ${coinId}`);
                return;
            }
            // Find out if the coin is attainable
            const recipe = event.findRecipes({ output: coinId })
            // If the coin has no recipe, skip it.
            if (recipe.isEmpty() && debug) console.log(`Coin not attainable: ${coinId}`);
            if (recipe.isEmpty()) return;

            // Get the coin name
            const coinMaterial = getCoinMaterial(coinId);
            if (!coinMaterial) {
                if (debug) console.log(`Invalid material for coin: ${coinId}`);
                return;
            }
            if (debug) console.log(`Valid coin material: ${coinMaterial}`);

            // Get the nugget tag from the coin name and the ore tag
            const coinTransferrableSources = generalTagList.map(tag => `${tag}/${coinMaterial}`);
            if (debug) console.log(`Transferrable tags: ${coinTransferrableSources.join(", ")}`);

            // Map the nugget based on the tag and then the ore as a fall back for calculation
            let coinTransferrableID = coinTransferrableSources.map(id => getTagItem(id)).find(id => !Ingredient.of(id).isEmpty());
            if (!coinTransferrableID && debug) console.warn(`No transferable item found for tag: ${coinTransferrableSources.join(", ")}`);
            if (!coinTransferrableID) return;
            if (debug) console.log(`Transferable ID: ${coinTransferrableID} Sources: ${coinTransferrableSources.join(", ")}`);

            // Find melting recipes for the nugget
            const transferrableRecipe = event.findRecipes({
                input: coinTransferrableID,
                type: castingRecipeType
            }).stream().findFirst().orElse(null);

            if (!transferrableRecipe) {
                if (debug) console.log(`No melting recipe found for ${coinTransferrableID}`);
                return;
            }

            // Retrieve the JSON
            let transferrableCasting = transferrableRecipe.json
            // Add error handling for missing or invalid recipe data
            if (!transferrableCasting.has("meltingTemp") || !transferrableCasting.has("output")) {
                console.error(`Invalid recipe data for nugget ${coinTransferrableID}`);
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
                                    "tag": coinTag
                                }
                            }
                        ]
                    }
                ],
                "type": "casting:melting",
                "input": {
                    "count": 1,
                    "item": coinId
                },
                "meltingTemp": transferrableCasting.get("meltingTemp").asNumber,
                "output": {
                    // Coins melt into nuggets so they provided just as much liquid as their nugget form
                    "amount": transferrableCasting.get("output").asJsonObject.get("amount").asNumber,
                    "id": transferrableCasting.get("output").asJsonObject.get("id").asString
                }
            })


        })
    })
})()
