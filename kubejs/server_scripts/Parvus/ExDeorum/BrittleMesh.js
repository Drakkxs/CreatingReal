// priority: 0
// requires: exdeorum
// @ts-check
// Meshes don't last forever.


// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false // Want some debug?
    const $ItemStack = Java.loadClass("net.minecraft.world.item.ItemStack")
    const meshTag = "#exdeorum:sieve_meshes"
    const hardcore = true // If true, meshes will lose durability in manual sieving.
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
     * Transposes a key in an object.
     * @param {string} str
     * @param {string} oldKey 
     * @param {string} newKey 
     * @returns 
     */
    function transposeKey(str, oldKey, newKey) {
        if (debug) console.log(`Transposing key ${oldKey} to ${newKey} in ${str}`);
        let obj = JsonUtils.toObject(JsonUtils.fromString(str));
        if (debug) console.log(`Parsed object: ${JsonUtils.toString(obj)}`);
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
        let newStr = obj
        if (debug) console.log(`Transposed object: ${JsonUtils.toString(newStr)}`);
        return newStr;
    }

    /**
     * Degrades the durability of a mesh in a mechanical sieve.
     * @param {import("dev.latvian.mods.kubejs.level.SimpleLevelKubeEvent").$SimpleLevelKubeEvent} event The tick event
     * @param {import("net.minecraft.world.level.block.entity.TickingBlockEntity").$TickingBlockEntity} tbe The block entity to check
     */
    function degradeMechanical(event, tbe) {

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

    /**
     * Degrades the durability of a mesh in a manual sieve.
     * @param {import("dev.latvian.mods.kubejs.block.BlockRightClickedKubeEvent").$BlockRightClickedKubeEvent} event The right click event
     */
    function degradeManual(event) {
        let sieve = event.block;
        let inv = {
            mesh: Item.of(transposeKey(`${sieve.entityData.getCompound("mesh")}`, "id", "item")),
            contents: Item.of(transposeKey(`${sieve.entityData.getCompound("contents")}`, "id", "item"))
        }

        if (debug) console.log(`Inventory: Mesh - ${inv.mesh}, Contents - ${inv.contents}`)
        if (!inv) return "noinv"; // No inventory, not active
        // Check if the sieve has input and a mesh
        if (inv.contents.empty) return "noinput"; // Input slot empty, not active
        if (inv.mesh.empty) return "nomesh"; // Mesh slot empty, not active

        // Check if the sieve is active
        if (Math.random() > chance) return; // Chance to not degrade

        if (debug) console.log(`Manual Sieve at ${sieve.pos} checking for mesh...`);

        // Get the mesh in the sieve
        let mesh = inv.mesh;
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
            event.level.playLocalSound(sieve.pos, "minecraft:entity.item.break", "blocks", 5.0, 1.0, false)
        }

        // Update the lore to show durabilitye
        if (mesh.count > 0) {
            let lore = mesh.lore || []
            lore = lore.filter(l => !l.toString().startsWith("Durability: "))
            mesh.setLore(lore.concat([`Durability: ${customData.getInt("kubejs_durability")}/${meshData.IDurability}`]));
        }

        // Update the sieve
        if (debug) console.log(`Mesh data to write: ${NBT.toTagCompound(mesh.toNBT())}`);
        let newData = event.block.entityData.remove("mesh");
        if (debug) console.log(`New Data: ${sieve.entityData}`);
        event.block.setEntityData(sieve.entityData);
        if (debug) console.log(`Updating sieve ${sieve.pos} wit data: ${sieve.entityData}`);
        
    }
    

    BlockEvents.rightClicked(event => {
        debug = true
        if (!hardcore) return; // Only run if hardcore mode is enabled
        if (event.block.entityId === "exdeorum:sieve") {
            let checkFail = degradeManual(event);
            if (debug && checkFail) console.log(`Manual Sieve at ${event.block.pos} skipped degrading mesh: ${checkFail}`);
        }
        debug = false
    })

    LevelEvents.tick(event => {
        // Iterate over all block entity tickers
        let tickers = event.level.blockEntityTickers.stream()
        tickers.forEach(tbe => {
            if (tbe.type === "exdeorum:mechanical_sieve") {
                let checkFail = degradeMechanical(event, tbe);
                if (debug && checkFail) console.log(`Mechanical Sieve at ${tbe.pos} skipped degrading mesh: ${checkFail}`);
            }
        });
    });
})();