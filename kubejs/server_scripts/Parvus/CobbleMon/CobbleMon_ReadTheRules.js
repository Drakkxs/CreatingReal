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

    let itemGet = {

        /**
         * Gets the custom name.
         * @param {$Entity_} missingNo
         */
        customName(missingNo) {
            try {
                let nbt = missingNo.nbt
                let customName = JsonUtils.fromString(nbt.getCompound("Item").getAsString()).asJsonObject.get("components").asJsonObject.get("minecraft:custom_name").asString
                if (debug && nbt) console.log(`Custom name retrieved: ${customName}`);
                if (typeof customName.normalize() !== "string") return ""
                return customName.normalize()
            } catch (error) {
                return ""
            }
        },

        /**
         * Gets the custom name.
         * @param {$Entity_} missingNo
         */
        id(missingNo) {
            try {
                let nbt = missingNo.nbt
                let customName = JsonUtils.fromString(nbt.getCompound("Item").getAsString()).asJsonObject.get("id").asString
                if (debug && nbt) console.log(`Custom name retrieved: ${customName}`);
                if (typeof customName.normalize() !== "string") return ""
                return customName.normalize().trim()
            } catch (error) {
                return ""
            }
        }
    }

    /**
     * Pokemon methods.
     * @param {$Entity_} missingNo
     */
    function MaybeMon(missingNo) {

        return {

            /**
             * Checks if the given entity is a Pokemon.
             */
            isPokemon() {
                // Check if the pokemon is a pokemon
                if (!missingNo) return false
                if(!(missingNo.type === "cobblemon:pokemon")) return false
                return true
            },

            /**
             * Checks if the pokemon is a captured pokemon.
             */
            isCapturedPokemon() {
                if (!this.isPokemon()) return false
                // Check if the pokemon is a captured pokemon
                let nbt = missingNo.nbt
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
             * Checks if the pokemon is a wild pokemon.
             */
            isWildPokemon() {
                if (!this.isPokemon()) return false
    
                // Is this a wild pokemon?
                if (debug) console.log(`Checking if ${missingNo} is a wild pokemon`)
    
                // Is this a captured pokemon?
                if (this.isCapturedPokemon()) {
                    if (debug) console.log(`${missingNo} is not a wild pokemon.`)
                    return false
                }
    
                // Does it have a custom name?
                if (missingNo.nbt.getString("CustomName")) {
                    if (debug) console.log(`${missingNo} is not a wild pokemon.`)
                    return false
                }
    
                if (debug) console.log(`${missingNo} is a wild pokemon.`)
                return true
            },
    
            /**
             * Checks if the pokemon is a wild pokemon that just spawned.
             */
            isWildPokemonSpawn() {
                if (!this.isPokemon()) return false
    
                // Is this too old to be a new spawn?
                if (missingNo.nbt.getInt("Age") < 0) return false
    
                // Is this a wild pokemon?
                if (this.isWildPokemon()) return true
    
                return false
            }

        }
    }

    // Stop the spawning of wild pokemon
    EntityEvents.spawned("cobblemon:pokemon", event => {

        // If the gamerule is on, exit logic
        if (event.level.gameRules.get("doMobSpawning").commandResult) {
            console.log("doMobSpawning gamerule is set, exiting logic")
            return
        }

        // Is this a wild pokemon?
        if (!MaybeMon(event.entity).isWildPokemonSpawn()) return

        if (debug) console.log(`Cancelling spawn of ${event.entity}`)
        // For non-captured pokemon, stop them from spawning.
        event.cancel()
    })

    // Remove all wild pokemon
    EntityEvents.spawned("minecraft:item", event => {   
        // Butcher item
        let butcher = {
            name: itemGet.customName(event.entity),
            id: itemGet.id(event.entity)
        }

        if (debug) console.log(`Item spawned: ${butcher.name}, ${butcher.id}`)
        
        if (!(butcher.name == "BEGONE POKEMON" || butcher.id == "minecraft:command_block")) return
        if (debug) event.server.tell("DIE!")

        // Butcher the pokemon
        event.server.entities.stream().filter(entity => {
            // Is this a wild pokemon?
            let isWild = MaybeMon(entity).isWildPokemon() || entity.type == "minecraft:item";
            if (debug) console.log(`Entity: ${entity.username}, Is Wild: ${isWild}`);
            return isWild;
        }).forEach(entity => {
            if (debug) console.log(`Killing ${entity}`);
            // Kill the pokemon that aren't wanted.
            entity.remove("discarded");
        });
    })
    
})();