// priority: 0
// requires: createmechanisms
// New mechanism for createmechanisms.
ServerEvents.recipes(event => {
   event.shaped(
       Item.of('kubejs:cold_mechanism', 1), // arg 1: output
       [
           ' d ',
           'aba', // arg 2: the shape (array of strings)
           ' c '
       ],
       {
           a: ['minecraft:powder_snow_bucket']
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0],

           b: ['createmechanisms:rubber_mechanism']
           .map(a => getUnifiedTag(a))[0],  //arg 3: the mapping object

           c: ['minecraft:obsidian']
           .map(a => getUnifiedTag(a))[0],

           d: ['minecraft:blue_ice']
           .map(a => getUnifiedTag(a))[0]
           
       }
   )
})