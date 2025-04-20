ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": {
           "item": "createmechanisms:bronze"
       },
       "loops": 5,
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "createmechanisms:heat_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:pressing",
               "ingredients": [
                   {
                       "item": "createmechanisms:incomplete_heat_mechanism"
                   }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_heat_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_heat_mechanism" },
                   { "item": "minecraft:magma_block" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_heat_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:filling",
               "ingredients": [
                   {
                       "item": "createmechanisms:incomplete_heat_mechanism"
                   },
                   {
                       "type": "fluid_stack",
                       "amount": 200,
                       "fluid": "minecraft:lava"
                   }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_heat_mechanism"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "createmechanisms:incomplete_heat_mechanism"
           },
           "amount": 1
       }
   })
})