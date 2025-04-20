ServerEvents.recipes(event => {
   event.custom({
       "type": "create:milling",
       "ingredients": [
           {
               "item": "minecraft:ender_pearl"
           }
       ],
       "processing_time": 250,
       "results": [
           {
               "count": 4,
               "item": {
                   "id": "ae2:ender_dust"
               }
           }
       ]
   })
})