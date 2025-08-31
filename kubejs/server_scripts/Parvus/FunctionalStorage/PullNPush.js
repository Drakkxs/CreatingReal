// priority: 0
// requires: functionalstorage
// @ts-check
// Convert puller and pusher upgrades.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    
    /**
     * Retrieves the item ID associated with a given tag using AlmostUnified.
     *
     * @param {string} tagKJS - The tag string, possibly prefixed with '#'.
     * @returns {string} The item ID location as a string, or an empty string if not found or on error.
     */
    function getTagItem(tagKJS) {
        try {
            let a = AlmostUnified.getTagTargetItem(tagKJS.replace("#", ""));
            return a && a.idLocation ? String(a.idLocation) : "";
        }
        catch (e) { console.log(`Error getting tag target item for ${tagKJS}: ${e}`); return ""; }
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

    let pullerUpgrade = getVariantItem("functionalstorage:puller_upgrade");
    let pusherUpgrade = getVariantItem("functionalstorage:pusher_upgrade");
    let redstoneDust = "#c:dusts/redstone"

    ServerEvents.recipes(event => {

        // Swap Hopper Upgrades
        event.shapeless(pullerUpgrade, [
            pusherUpgrade, redstoneDust
        ])

        event.shapeless(pusherUpgrade, [
            pullerUpgrade, redstoneDust
        ])

    })
})()
