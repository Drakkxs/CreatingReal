ServerEvents.recipes(event => {
   event.custom(
       {
           "type": "minecraft:smelting",
           "category": "misc",
           "cookingtime": 200,
           "experience": 0.25,
           "ingredient": [{
               "item": "createmechanisms:rubber"
           }]
           // Use tags instead of static items
           .map(a => getUnifiedTag(a))[0],
           "result": {
               "count": 1,
               "id": "createmechanisms:cured_rubber"
           }
       }
   )
})