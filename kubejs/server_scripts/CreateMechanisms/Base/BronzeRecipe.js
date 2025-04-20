ServerEvents.recipes(event => {
// Bronze
   event.custom({
       "type": "create:mixing",
       "heat_requirement": "heated",
       "ingredients": [
           {
               "item": "minecraft:copper_ingot"
           },
           {
               "item": "minecraft:copper_ingot"
           },
           {
               "item": "minecraft:copper_ingot"
           },
           {
               "item": "minecraft:iron_ingot"
           }
       ],
       "results": [
           {
               "count": 4,
               "item": {
                   "id": "createmechanisms:bronze"
               }
           }
       ]
   })
})