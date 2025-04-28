ServerEvents.recipes(event => {
   event.custom({
       "type": "create:mixing",
       "heat_requirement": "heated",
       "ingredients": [
           {
               "item": "minecraft:glowstone_dust"
           },
           {
               "item": "ae2:ender_dust"
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
             "amount": 1000,
             "id": "createmechanisms:enderiam"
           }
       ]
   })
})
