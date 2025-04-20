ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": {
           "tag": "c:stripped_woods"
       },
       "loops": 1,
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "createmechanisms:wooden_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:pressing",
               "ingredients": [
                   {
                       "item": "createmechanisms:incomplete_wooden_mechanism"
                   }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_wooden_mechanism" },
                   { "item": "create:andesite_alloy" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_wooden_mechanism" },
                   { "item": "create:cogwheel" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_wooden_mechanism" },
                   { "item": "create:large_cogwheel" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_wooden_mechanism" },
                   { "item": "create:cogwheel" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_wooden_mechanism" },
                   { "item": "create:large_cogwheel" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_wooden_mechanism"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "createmechanisms:incomplete_wooden_mechanism"
           },
           "amount": 1
       }
   })
})