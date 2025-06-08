// priority: 0
// requires: mekanism
// requires: pipez
// @ts-check
// Pipez are very powerful. Let's gate them.

ServerEvents.recipes(event => {

    let mechanismPipeMappings = new Map([
        ["pipez:item_pipe", "mekanism:ultimate_logistical_transporter"],
        ["pipez:fluid_pipe", "mekanism:ultimate_mechanical_pipe"],
        ["pipez:energy_pipe", "mekanism:ultimate_universal_cable"],
        ["pipez:gas_pipe", "mekanism:ultimate_pressurized_tube"],
        ["pipez:basic_upgrade", "mekanism:alloy_atomic"],
    ])
    let uniquePipeKeys = new Set(mechanismPipeMappings.keys())

    event.forEachRecipe({
        or: [{ type: "minecraft:crafting_shaped" }, { type: "minecraft:crafting_shapeless" }],
        mod: "pipez"
    }, recipe => {
        let recipeResult = { stack: recipe.originalRecipeResult, string: String(recipe.originalRecipeResult.item) }
        if (!(uniquePipeKeys.has(recipeResult.string))) return
        let mappedMechanismPipe = mechanismPipeMappings.get(recipeResult.string)

        // Replace redstone (the usual core ingredient) with the Mekanism base pipe, but redstone may still be required elsewhere.
        recipe.replaceInput({ match: "minecraft:redstone" }, mappedMechanismPipe)
    })
})