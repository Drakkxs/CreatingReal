ServerEvents.recipes(event => {
   event.custom({
       "type": "create:mixing",
       "ingredients": [
           {
               "item": "minecraft:kelp"
           },
           {
               "item": "minecraft:kelp"
           },
           {
               "item": "minecraft:kelp"
           },
           {
               "item": "minecraft:kelp"
           },
           {
               "type": "fluid_stack",
               "amount": 250,
               "fluid": "minecraft:water"
           }
       ],
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "createmechanisms:rubber"
               },
               "amount": 1
           }
       ]
   })
})