// priority: 0
// @ts-check
// requires: createmechanisms
// New mechanism for createmechanisms.

StartupEvents.registry("item", event => {
    event.create("cold_mechanism")
    .displayName("Refrigerator Mechanism")
    .texture("kubejs:item/cold_mechanism")
    .maxStackSize(64)
    .rarity("common")
})

StartupEvents.registry("item", event => {
    event.create("incomplete_cold_mechanism")
    .displayName("Incomplete Refrigerator Mechanism")
    .texture("kubejs:item/incomplete_cold_mechanism")
    .maxStackSize(1)
    .rarity("common")
})