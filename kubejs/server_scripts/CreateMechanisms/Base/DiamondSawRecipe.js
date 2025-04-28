ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:diamond_saw', 1), // arg 1: output
       [
           '  c',
           ' cb', // arg 2: the shape (array of strings)
           'ab '
       ],
       {
           a: '#minecraft:planks',
           b: '#c:gems/diamond',
           c: ['minecraft:stick']
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0]       }
   )
})