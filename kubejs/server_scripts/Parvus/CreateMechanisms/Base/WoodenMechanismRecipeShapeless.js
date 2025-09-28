ServerEvents.recipes(event => {
   event.shapeless(
       Item.of('createmechanisms:wooden_mechanism', 1), // arg 1: output
       [
           `2x ${getUnifiedTag("create:andesite_alloy").item || "create:andesite_alloy"}`,
           `${getUnifiedTag("minecraft:stripped_oak_wood").item || "minecraft:stripped_oak_wood"}`, 	       // arg 2: the array of inputs
           `2x ${getUnifiedTag("create:shaft").item || "create:shaft"}`,
           `${getUnifiedTag("minecraft:oak_planks").item || "minecraft:oak_planks"}`,
           `#createmechanisms:sawing_tools`
       ]
   ).damageIngredient('#createmechanisms:sawing_tools');
})