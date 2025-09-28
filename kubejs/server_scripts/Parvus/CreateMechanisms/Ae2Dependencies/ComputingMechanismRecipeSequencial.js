ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": {
           "item": "createmechanisms:zinc_mechanism"
       },
       "loops": 3,
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "createmechanisms:computing_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:computing_mechanism" },
                   { "item": "ae2:logic_processor" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:computing_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:computing_mechanism" },
                   { "item": "ae2:calculation_processor" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:computing_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:computing_mechanism" },
                   { "item": "ae2:engineering_processor" }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:computing_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:pressing",
               "ingredients": [
                   {
                       "item": "createmechanisms:computing_mechanism"
                   }
               ],
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:computing_mechanism"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "createmechanisms:computing_mechanism"
           },
           "amount": 1
       }
   })
})