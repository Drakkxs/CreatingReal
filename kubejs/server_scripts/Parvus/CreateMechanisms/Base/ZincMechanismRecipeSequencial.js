ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": [{
           "item": "create:iron_sheet"
       }]
       // Use tags instead of static items
       .map(a => getUnifiedTag(a))[0],
       "loops": 3,
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "createmechanisms:zinc_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_zinc_mechanism" },
                   { "item": "create:large_cogwheel" }
               ]
               // Use tags instead of static items
               .map(a => getUnifiedTag(a)),
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_zinc_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_zinc_mechanism" },
                   { "item": "create:cogwheel" }
               ]
               // Use tags instead of static items
               .map(a => getUnifiedTag(a)),
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_zinc_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "createmechanisms:incomplete_zinc_mechanism" },
                   { "item": "create:zinc_nugget" }
               ]
               // Use tags instead of static items
               .map(a => getUnifiedTag(a)),
               "results": [
                   {
                       "item": {
                           "id": "createmechanisms:incomplete_zinc_mechanism"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "createmechanisms:incomplete_zinc_mechanism"
           },
           "amount": 1
       }
   })
})