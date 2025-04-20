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
               "type": "fluid_stack",
               "amount": 1000,
               "fluid": "minecraft:water"
           }
       ],
       "results": [
           {
             "amount": 1000,
             "id": "createmechanisms:enderiam"
           }
       ]
   })
})
