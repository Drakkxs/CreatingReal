// priority: 0
// requires: exdeorum
// @ts-check
// ExDeorum Crucible tweaks.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false; // Want some debug?

    ServerEvents.recipes(event => {

        /**
         * Adds a heat source for the ExDeorum Crucible.
         * @param {object} block_predicate 
         * @param {number} heat_value 
         */
        function addHeatSource(block_predicate, heat_value) {
            event.custom({
                "type": "exdeorum:crucible_heat_source",
                "block_predicate": block_predicate,
                "heat_value": heat_value
            })
        }

        // Add heat sources for various Mekanism heaters
        [
            'mekanism:fuelwood_heater',
            'mekanism:resistive_heater',
            'mekanismgenerators:heat_generator'
        ].forEach(id => {
            addHeatSource({ "block": id, "state": { "active": "true" } }, 5);
        });

        
    });

    
})()
