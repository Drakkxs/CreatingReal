ServerEvents.recipes(event => {
    event.smithing(
        'create:portable_fluid_interface',               // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:copper_casing',                          // arg 3: the item to be upgraded
        'create:chute'                                   // arg 4: the upgrade item
    )
    event.smithing(
        'create:spout',                                  // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:copper_casing',                          // arg 3: the item to be upgraded
        'createmechanisms:cured_rubber'                  // arg 4: the upgrade item
    )
    event.smithing(
        'create:item_drain',                             // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:copper_casing',                          // arg 3: the item to be upgraded
        'minecraft:iron_bars'                            // arg 4: the upgrade item
    )
    event.smithing(
        'create:hose_pulley',                            // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:copper_casing',                          // arg 3: the item to be upgraded
        'minecraft:dried_kelp_block'                     // arg 4: the upgrade item
    )
    event.smithing(
        'create:fluid_valve',                            // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:fluid_pipe',                             // arg 3: the item to be upgraded
        'create:shaft'                                   // arg 4: the upgrade item
    )
    event.smithing(
        'create:mechanical_pump',                        // arg 1: output
        'createmechanisms:rubber_mechanism',             // arg 2: the smithing template
        'create:fluid_pipe',                             // arg 3: the item to be upgraded
        'create:cogwheel'                                // arg 4: the upgrade item
    )
})