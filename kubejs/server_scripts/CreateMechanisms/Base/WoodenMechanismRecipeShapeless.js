ServerEvents.recipes(event => {
   event.shapeless(
       Item.of('createmechanisms:wooden_mechanism', 1), // arg 1: output
       [
           '2x create:andesite_alloy',
           'minecraft:stripped_oak_wood', 	       // arg 2: the array of inputs
           '2x create:shaft',
           'minecraft:oak_planks',
           '#createmechanisms:sawing_tools'
       ]
   ).damageIngredient('#createmechanisms:sawing_tools');
})