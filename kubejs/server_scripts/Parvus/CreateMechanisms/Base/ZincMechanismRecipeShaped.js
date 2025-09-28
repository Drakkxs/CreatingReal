ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:zinc_mechanism', 1), // arg 1: output
       [
           'aba', // arg 2: the shape (array of strings)
           ' c '
       ],
       {
           a: ['create:zinc_ingot']
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0],

           b: 'createmechanisms:wooden_mechanism',  //arg 3: the mapping object
           c: ['create:iron_sheet']
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0]
       }
   )
})