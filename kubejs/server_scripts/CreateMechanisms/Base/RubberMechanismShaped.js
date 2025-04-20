ServerEvents.recipes(event => {
  event.shaped(
       Item.of('createmechanisms:rubber_mechanism', 1), // arg 1: output
       [
           ' a ',
           'bcb', // arg 2: the shape (array of strings)
           ' d '
       ],
       {
           a: 'create:copper_nugget',
           b: 'createmechanisms:cured_rubber',  //arg 3: the mapping object
           c: 'createmechanisms:wooden_mechanism',
           d: 'create:copper_sheet'
       }
   )
})