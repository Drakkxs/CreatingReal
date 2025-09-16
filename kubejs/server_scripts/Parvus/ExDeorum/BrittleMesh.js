// priority: 0
// requires: exdeorumt
// @ts-check
// Meshes don't last forever.


// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false // Want some debug?
    const meshTag = "#exdeorum:sieve_meshes"
    const hardcore = false // If true, meshes will lose durability in manual sieving.
    const chance = 0.25 // Chance to lose durability
    /** Meshes that are brittle and can break. Keyed by their ID, value is the durability */
    const brittleMeshes = new Map([
        ["exdeorum:string_mesh", { IDurability: 16 }],
        ["exdeorum:flint_mesh", { IDurability: 32 }],
        ["exdeorum:iron_mesh", { IDurability: 64 }],
        ["exdeorum:golden_mesh", { IDurability: 128 }],
        ["exdeorum:diamond_mesh", { IDurability: 256 }],
        ["exdeorum:netherite_mesh", { IDurability: 512 }]
    ])



    /**
     * Degrades the durability of a mesh in a mechanical sieve.
     * @param {import("dev.latvian.mods.kubejs.level.SimpleLevelKubeEvent").$SimpleLevelKubeEvent} event The tick event
     * @param {import("net.minecraft.world.level.block.entity.TickingBlockEntity").$TickingBlockEntity} tbe The block entity to check
     * @param {string} sieveType The type of sieve (mechanical, compressed, etc.)
     * @returns 
     */
    function degradeMesh(event, tbe, sieveType) {

        let inv = event.level.getBlock(tbe.pos).inventory
        if (!inv) return "noinv"; // No inventory, not active

        // Check if the sieve has input and a mesh
        if (inv.getStackInSlot(0).isEmpty()) return "noinput"; // Input slot empty, not active
        if (inv.getStackInSlot(1).isEmpty()) return "nomesh"; // Mesh slot empty, not active

        // Check if the sieve is active
        if (Math.random() > chance) return; // Chance to not degrade
        if (event.server.tickCount % 20 !== 0) return; // Iterate on a mesh every second

        if (debug) console.log(`Mechanical Sieve at ${tbe.pos} checking for mesh...`);

        // Mechanical sieves have meshes in slot 1. Slot 0 is the input.
        const mshSlt = 1;

        // Get the mesh in the sieve
        let mesh = inv.getStackInSlot(mshSlt);
        if (!mesh.hasTag(meshTag.replace("#", ""))) return "not_mesh"; // Not a mesh
        if (debug) console.log(`Mesh found: ${mesh.id}`);
        let meshid = `${mesh.id}`;

        // Check if it's a brittle mesh
        if (!brittleMeshes.has(meshid)) return "not_brittle"; // Not a brittle mesh
        let meshData = brittleMeshes.get(meshid);

        if (debug) console.log(`Brittle mesh detected: ${meshid} with durability ${meshData.IDurability}`)
        let customData = mesh.customData; // If no custom data, we will create it below

        /**
         * Durability logic:
         * If no durability data, set to max durability
         * If durability > 0, reduce by 1
         * If durability <= 0, remove the mesh
         */
        // intilialize custom data if not present
        if (!customData.contains("kubejs_durability")) {
            customData.putInt("kubejs_durability", meshData.IDurability)
            mesh.setCustomData(customData)
            if (debug) console.log(`Mesh ${meshid} initialized with durability ${meshData.IDurability}`)
        } else if (customData.getInt("kubejs_durability") > 0) {
            // Damage the mesh
            let newDur = Math.max(customData.getInt("kubejs_durability") - 1, 0)
            customData.putInt("kubejs_durability", newDur)
            mesh.setCustomData(customData)
            if (debug) console.log(`Mesh ${meshid} damaged, new durability ${newDur}`)
        }

        if (customData.getInt("kubejs_durability") <= 0) {
            mesh.shrink(1) // Remove the broken mesh
            if (debug) console.log(`Mesh ${meshid} broke and was removed.`)
            event.level.playLocalSound(tbe.pos, "minecraft:entity.item.break", "blocks", 5.0, 1.0, false)
        }

        // Update the lore to show durability
        if (mesh) {
            let lore = mesh.lore || []
            lore = lore.filter(l => !l.toString().startsWith("Durability: "))
            mesh.setLore(lore.concat([`Durability: ${customData.getInt("kubejs_durability")}/${meshData.IDurability}`]));
        }

    }

    LevelEvents.tick(event => {
        // Iterate over all block entity tickers
        let tickers = event.level.blockEntityTickers.stream()
        tickers.forEach(tbe => {
            // if (tbe.type === "exdeorum:sieve") {
            //     let checkFail = degradeMesh(event, tbe, "manual");
            //     if (debug && checkFail) console.log(`Manual Sieve at ${tbe.pos} skipped degrading mesh: ${checkFail}`);
            // }
            if (tbe.type === "exdeorum:mechanical_sieve") {
                let checkFail = degradeMesh(event, tbe, "mechanical");
                if (debug && checkFail) console.log(`Mechanical Sieve at ${tbe.pos} skipped degrading mesh: ${checkFail}`);
            }
        });
    });
})();