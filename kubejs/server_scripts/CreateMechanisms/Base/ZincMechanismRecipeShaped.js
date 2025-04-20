ServerEvents.recipes(event => {
   event.shaped(
       Item.of('createmechanisms:zinc_mechanism', 1), // arg 1: output
       [
           'aba', // arg 2: the shape (array of strings)
           ' c '
       ],
       {
           a: 'create:zinc_ingot',
           b: 'createmechanisms:wooden_mechanism',  //arg 3: the mapping object
           c: 'create:iron_sheet'
       }
   )
})