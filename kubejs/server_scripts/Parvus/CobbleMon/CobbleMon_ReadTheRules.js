// priority: 0
// requires: cobblemon
// @ts-check
// Cobblemon doesn't listen to the doMobSpawning Gamerule. This script will make it so they do.

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = true

    /**
     * Checks if the pokemon is a captured pokemon.
     * @param {$Entity_} pokemon
     * @returns {boolean} If the pokemon is a captured pokemon
     */
    function isCapturedPokemon(pokemon) {
        // Check if the pokemon is a captured pokemon
        let nbt = pokemon.nbt
        if (!nbt) return false;
        
        let PokemonOriginalTrainer = nbt.getCompound("Pokemon").getString("PokemonOriginalTrainer").normalize()

        let result = null
        try {
            result = UUID.fromString(PokemonOriginalTrainer)
        } catch (error) {
            if (debug) console.log(error)
        }

        return result !== null
    }

    EntityEvents.spawned("cobblemon:pokemon", event => {
        // If the gamerule is on, exit logic
        if (!event.entity.level.getGameRules().get("doMobSpawning")) return

        // Do not affect old pokemon with nbt
        if (event.entity.nbt.getInt("Age") > 0) return
        // Do not affect captured pokemon
        if (isCapturedPokemon(event.entity)) return;

        // For non-captured pokemon, stop them from spawning.
        event.cancel()
    })
    
})();