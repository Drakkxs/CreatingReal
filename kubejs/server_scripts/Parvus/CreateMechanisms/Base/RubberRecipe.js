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
               "type": "fluid_tag",
               "amount": 1000,
               "fluid_tag": "minecraft:water"
           }
       ]
       // Use tags instead of static items
       .map(a => getUnifiedTag(a)),
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