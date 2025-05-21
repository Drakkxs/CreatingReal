// priority: 0
// requires: createmechanisms
// @ts-check
// New mechanism for createmechanisms.
ServerEvents.recipes(event => {
   event.custom({
       "type": "create:sequenced_assembly",
       "ingredient": [{
           "item": "minecraft:obsidian"
       }]
       // Use tags instead of static items
       .map(a => getUnifiedTag(a))[0],
       "loops": 5,
       "results": [
           {
               "chance": 1.0,
               "item": {
                   "id": "kubejs:cold_mechanism"
               }
           }
       ],
       "sequence": [
           {
               "type": "create:pressing",
               "ingredients": [
                   {
                       "item": "kubejs:incomplete_cold_mechanism"
                   }
               ],
               "results": [
                   {
                       "item": {
                           "id": "kubejs:incomplete_cold_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "kubejs:incomplete_cold_mechanism" },
                   { "item": "minecraft:blue_ice" }
               ]
               // Use tags instead of static items
               .map(a => getUnifiedTag(a)),
               "results": [
                   {
                       "item": {
                           "id": "kubejs:incomplete_cold_mechanism"
                       }
                   }
               ]
           },
           {
               "type": "create:deploying",
               "ingredients": [
                   { "item": "kubejs:incomplete_cold_mechanism" },
                   { "item": "minecraft:powder_snow_bucket" }
               ]
               // Use tags instead of static items
               .map(a => getUnifiedTag(a)),
               "results": [
                   {
                       "item": {
                           "id": "kubejs:incomplete_cold_mechanism"
                       }
                   },
                   {
                       "item": {
                           "id": "minecraft:bucket"
                       }
                   }
               ]
           }
       ],
       "transitional_item": {
           "item": {
               "id": "kubejs:incomplete_cold_mechanism"
           },
           "amount": 1
       }
   })
})