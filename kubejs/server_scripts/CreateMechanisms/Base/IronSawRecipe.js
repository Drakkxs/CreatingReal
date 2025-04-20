ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:iron_saw', 1), // arg 1: output
       [
           '  c',
           ' cb', // arg 2: the shape (array of strings)
           'ab '
       ],
       {
           a: '#minecraft:planks',
           b: '#c:ingots/iron',
           c: 'minecraft:stick'       }
   )
})