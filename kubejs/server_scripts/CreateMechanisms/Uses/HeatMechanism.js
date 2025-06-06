ServerEvents.recipes(event => {
    unifiedSmithing(
        event,
        'create:steam_whistle',                          // arg 1: output
        'createmechanisms:heat_mechanism',               // arg 2: the smithing template
        'minecraft:copper_block',                        // arg 3: the item to be upgraded
        'create:golden_sheet'                            // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:steam_engine',                           // arg 1: output
        'createmechanisms:heat_mechanism',               // arg 2: the smithing template
        'minecraft:copper_block',                        // arg 3: the item to be upgraded
        'create:brass_sheet'                             // arg 4: the upgrade item
    )
    event.shaped(
        Item.of('create:empty_blaze_burner', 1), // arg 1: output
        [
            ' A ',
            'ABA', // arg 2: the shape (array of strings)
            ' A '
        ],
        {
            A: ['create:iron_sheet']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: 'createmechanisms:heat_mechanism'
        }
    )
})