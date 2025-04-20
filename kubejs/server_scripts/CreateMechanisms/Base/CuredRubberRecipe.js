ServerEvents.recipes(event => {
   event.custom(
       {
           "type": "minecraft:smelting",
           "category": "misc",
           "cookingtime": 200,
           "experience": 0.25,
           "ingredient": {
               "item": "createmechanisms:rubber"
           },
           "result": {
               "count": 1,
               "id": "createmechanisms:cured_rubber"
           }
       }
   )
})