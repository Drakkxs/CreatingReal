ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:heat_mechanism', 1), // arg 1: output
       [
           ' d ',
           'aba', // arg 2: the shape (array of strings)
           ' c '
       ],
       {
           a: 'minecraft:lava_bucket',
           b: 'createmechanisms:rubber_mechanism',  //arg 3: the mapping object
           c: 'createmechanisms:bronze',
           d: 'minecraft:magma_block'
       }
   )
})