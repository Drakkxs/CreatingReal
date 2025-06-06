ServerEvents.recipes(event => {
    unifiedSmithing(
        event,
        'create:speedometer',                            // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:andesite_casing',                        // arg 3: the item to be upgraded
        'minecraft:compass'                              // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:adjustable_chain_gearshift',             // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:andesite_casing',                        // arg 3: the item to be upgraded
        'create:electron_tube'                           // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:gearshift',                              // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:andesite_casing',                        // arg 3: the item to be upgraded
        'minecraft:redstone'                             // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:clutch',                                 // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:andesite_casing',                        // arg 3: the item to be upgraded
        'minecraft:redstone_torch'                       // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:chain_conveyor',                         // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:andesite_casing',                        // arg 3: the item to be upgraded
        'create:large_cogwheel'                          // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:filter',                                 // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'minecraft:white_wool',                          // arg 3: the item to be upgraded
        'minecraft:iron_nugget'                          // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:package_filter',                         // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'minecraft:white_wool',                          // arg 3: the item to be upgraded
        'create:zinc_nugget'                             // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:windmill_bearing',                       // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:industrial_iron_block',                  // arg 3: the item to be upgraded
        'minecraft:sticky_piston'                        // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:contraption_controls',                   // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:electron_tube',                          // arg 3: the item to be upgraded
        'minecraft:oak_button'                           // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:redstone_contact',                       // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:industrial_iron_block',                  // arg 3: the item to be upgraded
        'minecraft:redstone'                             // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:track_observer',                         // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:railway_casing',                         // arg 3: the item to be upgraded
        'minecraft:observer'                             // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:track_station',                          // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:railway_casing',                         // arg 3: the item to be upgraded
        'minecraft:compass'                              // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:track_signal',                           // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:railway_casing',                         // arg 3: the item to be upgraded
        'create:electron_tube'                           // arg 4: the upgrade item
    )
    unifiedSmithing(
        event,
        'create:stockpile_switch',                       // arg 1: output
        'createmechanisms:zinc_mechanism',               // arg 2: the smithing template
        'create:brass_casing',                           // arg 3: the item to be upgraded
        'minecraft:comparator'                           // arg 4: the upgrade item
    )



    event.shapeless(
        Item.of('create:controls', 4), // arg 1: output
        [
            'createmechanisms:zinc_mechanism',
            'minecraft:lever', 	                         // arg 2: the array of inputs
            'create:electron_tube'
        ]
        // Use tags instead of static items
        .map(a => getUnifiedTag(a))[0]
    )
})