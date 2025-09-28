ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": {
           "item": "create:precision_mechanism"
       },
       "loops": 4,
       "results": [
           {
               "chance": 60.0,
               "item": {
                   "id": "createmechanisms:advanced_precision_mechanism"
               }
           },
           {
               "chance": 8.0,
               "item": {
                   "id": "create:precision_mechanism"
               }
           },
           {
               "chance": 8.0,
               "item": {
                   "id": "create:zinc_ingot"
               }
           },
           {
               "chance": 5.0,
               "item": {
                   "id": "create:brass_ingot"
               }
           },
           {
               "chance": 3.0,
               "item": {
                   "id": "create:brass_sheet"
               }
           },
           {
               "chance": 2.0,
               "item": {
                   "id": "create:iron_sheet"
               }
           },
           {
               "chance": 2.0,
               "item": {
                   "id": "createmechanisms:wooden_mechanism"
               }
           },
           {
               "chance": 6.0,
               "item": {
                   "id": "createmechanisms:zinc_mechanism"
               }
           },
           {
               "chance": 6.0,
               "item": {
                   "id": "createmechanisms:rubber_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_advanced_precision_mechanism" },
                   { "item": "createmechanisms:wooden_mechanism" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_advanced_precision_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_advanced_precision_mechanism" },
                   { "item": "createmechanisms:zinc_mechanism" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_advanced_precision_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_advanced_precision_mechanism" },
                   { "item": "createmechanisms:rubber_mechanism" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_advanced_precision_mechanism"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "createmechanisms:incomplete_advanced_precision_mechanism"
           },
           "amount": 1
       }
   })
})