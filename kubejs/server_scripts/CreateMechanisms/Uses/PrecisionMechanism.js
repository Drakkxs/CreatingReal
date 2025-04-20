ServerEvents.recipes(event => {
    event.smithing(
        'create:clockwork_bearing',                      // arg 1: output
        'create:precision_mechanism',                    // arg 2: the smithing template
        'create:brass_casing',                           // arg 3: the item to be upgraded
        'minecraft:sticky_piston'                        // arg 4: the upgrade item
    )
    event.smithing(
        'create:elevator_pulley',                        // arg 1: output
        'create:precision_mechanism',                    // arg 2: the smithing template
        'create:brass_casing',                           // arg 3: the item to be upgraded
        'minecraft:dried_kelp_block'                     // arg 4: the upgrade item
    )
    event.smithing(
        'create:sequenced_gearshift',                    // arg 1: output
        'create:precision_mechanism',                    // arg 2: the smithing template
        'create:brass_casing',                           // arg 3: the item to be upgraded
        'create:electron_tube'                           // arg 4: the upgrade item
    )
})