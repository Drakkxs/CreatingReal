ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:heat_mechanism', 1), // arg 1: output
       [
           ' d ',
           'aba', // arg 2: the shape (array of strings)
           ' c '
       ],
       {
           a: ['minecraft:lava_bucket']
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0],

           b: ['createmechanisms:rubber_mechanism']
           .map(a => getUnifiedTag(a))[0],  //arg 3: the mapping object

           c: ['createmechanisms:bronze']
           .map(a => getUnifiedTag(a))[0],

           d: ['minecraft:magma_block']
           .map(a => getUnifiedTag(a))[0]
           
       }
   )
})