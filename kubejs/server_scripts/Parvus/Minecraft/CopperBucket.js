// priority: 0
// requires: minecraft
// @ts-check
// Iron bucket from a copper bucket.

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = true; // Want some debug?
    let ingot = AlmostUnified.getVariantItemTarget("minecraft:copper_ingot").idLocation.toString();
    ServerEvents.recipes(event => {

        // If there is already a recipe that outputs a bucket using copper ingots, override it.
        event.remove({ output: "minecraft:bucket", type: "minecraft:crafting_shaped", input: ingot });
        event.shaped("minecraft:bucket", [
            "C C",
            " C "
        ], {
            C: ingot
        })
    })
})()
