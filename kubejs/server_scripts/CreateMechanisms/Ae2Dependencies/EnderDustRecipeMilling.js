// ignored: true
ServerEvents.recipes(event => {
   event.custom({
       "type": "create:milling",
       "ingredients": [
           {
               "item": "minecraft:ender_pearl"
           }
       ]
       // Use tags instead of static items
       .map(a => getUnifiedTag(a)),
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