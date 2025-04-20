// priority: 0
// requires: cobblemon
// @ts-check
// Cobblemon doesn't listen to the doMobSpawning Gamerule. This script will make it so they do.

// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = false

    let isPokemon = {


        /**
         * Checks if the pokemon is a captured pokemon.
         * @param {$Entity_} pokemon
         * @returns {boolean} If the pokemon is a captured pokemon
         */
        isCapturedPokemon(pokemon) {
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
        },

        /**
         * Checks if the pokemon is a wild pokemon that just spawned.
         * @param {$Entity_} missingNo
         */
        wildPokemonSpawn(missingNo) {

            // Is this too old to be a new spawn?
            if (missingNo.nbt.getInt("Age") < 0) return false

            // Is this a wild pokemon?
            if (this.isCapturedPokemon(missingNo)) return false

            // This is a wild pokemon that just spawned
            return true
        },

        /**
         * Checks if the pokemon is a wild pokemon that just spawned.
         * @param {$Entity_} missingNo
         */
        wildPokemon(missingNo) {

            // Is this a wild pokemon?
            if (this.isCapturedPokemon(missingNo)) return false

            // This is a wild pokemon that just spawned
            return true
        }
    }

    // Stop the spawning of wild pokemon
    EntityEvents.spawned("cobblemon:pokemon", event => {

        // If the gamerule is on, exit logic
        if (event.level.gameRules.get("doMobSpawning").commandResult > 0) return

        // Is this a wild pokemon?
        if (!isPokemon.wildPokemon(event.entity)) return

        if (debug) console.log(`Cancelling spawn of ${event.entity}`)
        // For non-captured pokemon, stop them from spawning.
        event.cancel()
    })

    // Remove all wild pokemon
    EntityEvents.spawned("minecraft:item", event => {
        // Butcher item
        let checkBlock = event.entity.nbt.getString("id").normalize() == "minecraft:command_block"
        let checkName = event.entity.customName.name === "BEGONE POKEMON"
        if (checkBlock && checkName) {
            event.server.tell("Begone Pokemon!")

            // Butcher the pokemon
            event.server.entities.stream().filter(entity => {
                return isPokemon.wildPokemonSpawn(entity)
            })
        }
    })
    
})();