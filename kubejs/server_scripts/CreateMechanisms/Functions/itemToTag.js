/**
 * Given an item string, returns a tag object with the relevant unified tag for that item or what was passed in
 * @param {$ItemStack_} maybeStack
 * @returns
 * @see {@link getUnifiedTag}
 */
function getUnifiedTag(maybeStack) {

    // Get the unified tag
    Object.assign(maybeStack, {tag: AlmostUnified.getRelevantItemTag(maybeStack)});
        
    // When there is no tag, return what was passed in and remove the null tag
    maybeStack.tag ? delete maybeStack.item : delete maybeStack.tag

    // If what was passed in is nothing, throw a error.
    if (!maybeStack || (Object.keys(maybeStack).length === 0)) throw new Error(`Nothing found for ${JSON.stringify(maybeStack)}`)
    return maybeStack

}

/**
 * Fixes smthing recipes to work with AlmostUnified
 * @param {$RecipesKubeEvent_} event
 * @param {$ItemStack_} output 
 * @param {$ItemStack_} template 
 * @param {$ItemStack_} input 
 * @param {$ItemStack_} catalyst 
 */
function unifiedSmithing(event, output, template, input, catalyst) {

    function getVaraint(input) {
        return !(AlmostUnified.getVariantItemTarget(input).isEmpty()) ? AlmostUnified.getVariantItemTarget(input) : input
    }
    event.smithing(
        output, // arg 1: output
        template, // arg 2: the smithing template
        getVaraint(input), // arg 3: the item to be upgraded
        getVaraint(catalyst) // arg 4: the upgrade item
    )
}