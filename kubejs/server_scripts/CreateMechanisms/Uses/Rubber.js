ServerEvents.recipes(event => {
    event.shaped(
        Item.of('create:andesite_tunnel', 2),
        [
            'AA',
            'BB'
        ],
        {
            A: ['create:andesite_alloy']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
    event.shaped(
        Item.of('create:brass_tunnel', 2),
        [
            'C ',
            'AA',
            'BB'
        ],
        {
            A: ['create:brass_ingot']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            C: ['create:electron_tube']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
    event.shaped(
        Item.of('create:andesite_funnel', 4),
        [
            'A',
            'B'
        ],
        {
            A: ['create:andesite_alloy']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
    event.shaped(
        Item.of('create:brass_funnel', 4),
        [
            'C',
            'A',
            'B'
        ],
        {
            A: ['create:brass_ingot']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            C: ['create:electron_tube']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
    event.shaped(
        Item.of('create:package_frogport', 1),
        [
            'C',
            'A',
            'B'
        ],
        {
            A: ['create:item_vault']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            B: ['create:andesite_alloy']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0],
            C: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
    event.shaped(
        Item.of('create:belt_connector', 2),
        [
            'AAA',
            'AAA'
        ],
        {
            A: ['createmechanisms:cured_rubber']
            // Use tags instead of static items
            .map(a => getUnifiedTag(a))[0]
        }
    )
})