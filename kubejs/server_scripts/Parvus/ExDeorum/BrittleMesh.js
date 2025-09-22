// priority: 0
// requires: exdeorum
// @ts-check
// Meshes don't last forever.


// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {
    let debug = false // Want some debug?
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
        if (!(oldKey in obj)) {
            if (debug) console.log(`Key ${oldKey} not found in object.`);
            return JsonUtils.fromString(JsonUtils.toString(obj)).asJsonObject;
        }
        if (debug) console.log(`Parsed object: ${JsonUtils.toString(obj)}`);
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
        let mappedObject = obj
        if (debug) console.log(`Transposed object: ${JsonUtils.toString(mappedObject)}`);
        return JsonUtils.fromString(JsonUtils.toString(mappedObject)).asJsonObject;
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

        // Update the lore to show durability
        if (mesh) {
            let lore = mesh.lore || []
            lore = lore.filter(l => !l.toString().startsWith("Durability: "))
            mesh.setLore(lore.concat([`Durability: ${customData.getInt("kubejs_durability")}/${meshData.IDurability}`]));
        }

        if (customData.getInt("kubejs_durability") <= 0) {
            mesh.shrink(1) // Remove the broken mesh
            if (debug) console.log(`Mesh ${meshid} broke and was removed.`)
            event.level.getBlock(tbe.pos).getPlayersInRadius(5).playSound("minecraft:entity.item.break", 5.0, 1.5);
        }

    }

    /**
     * Degrades the durability of a mesh in a manual sieve.
     * @param {import("dev.latvian.mods.kubejs.block.BlockRightClickedKubeEvent").$BlockRightClickedKubeEvent} event The right click event
     */
    function degradeManual(event) {
        const sieveBlk = event.block
        if (!sieveBlk) return "noblock"; // No block, not active
        const sieveNBT = sieveBlk.entityData;
        const mesh = sieveNBT.getCompound("mesh");
        const meshItem = Item.of(JsonUtils.toObject(transposeKey(JsonUtils.toString(NBT.toJson(mesh)), "id", "item")));
        const contents = sieveNBT.getCompound("contents");
        const contentsItem = Item.of(JsonUtils.toObject(transposeKey(JsonUtils.toString(NBT.toJson(contents)), "id", "item")));

        // Check if the sieve has input and a mesh
        if (contentsItem.empty) return "noinput"; // Input slot empty, not active
        if (meshItem.empty) return "nomesh"; // Mesh slot empty, not active

        // Check if the sieve is active
        if (Math.random() > chance) return; // Chance to not degrade

        if (debug) console.log(`Manual Sieve at ${sieveBlk.pos} checking for mesh...`);

        // Get the mesh in the sieve
        if (!meshItem.hasTag(meshTag.replace("#", ""))) return "not_mesh"; // Not a mesh
        const meshid = `${mesh.getString("id")}`; // Ensure it's a string
        if (debug) console.log(`Mesh found: ${meshid}`);

        // Check if it's a brittle mesh
        if (!brittleMeshes.has(meshid)) return "not_brittle"; // Not a brittle mesh
        const meshData = brittleMeshes.get(meshid);

        if (debug) console.log(`Brittle mesh detected: ${meshid} with durability ${meshData.IDurability}`)
        // Initialize components and custom data that still point to the orginal NBT structure
        const components = mesh.getCompound("components");
        if (debug) console.log(`Mesh Components: ${components}`);
        if (!sieveNBT.contains("components")) {
            if (debug) console.log(`Mesh ${meshid} missing components, initializing...`);
            mesh.put("components", NBT.compoundTag({}))
            if (!mesh.contains("components")) throw `Failed to create components for mesh ${meshid}`;
        }
        // If we just created new components, they wouldn't point to the original NBT structure.
        // So we use .put() to ensure we are always working with the original NBT structure.
        const customData = components.getCompound("minecraft:custom_data");
        if (debug) console.log(`Mesh Custom Data: ${customData}`);
        if (!components.contains("minecraft:custom_data")) {
            if (debug) console.log(`Mesh ${meshid} missing custom data, initializing...`);
            components.put("minecraft:custom_data", customData);
            if (!components.contains("minecraft:custom_data")) throw `Failed to create custom data for mesh ${meshid}`;
        }

        function updateMeshNbt() {
            components.put("minecraft:custom_data", customData);
            mesh.put("components", components);
            sieveNBT.put("mesh", mesh);
            if (debug) console.log(`Updated mesh NBT: ${mesh}`);
        }

        /**
         * Durability logic:
         * If no durability data, set to max durability
         * If durability > 0, reduce by 1
         * If durability <= 0, remove the mesh
         */

        // intilialize custom data if not present
        if (!customData.contains("kubejs_durability")) {
            customData.putInt("kubejs_durability", meshData.IDurability)
            if (debug) console.log(`Mesh ${meshid} initialized with durability ${customData.getInt("kubejs_durability")}`)
            // Update the mesh
            updateMeshNbt();
        } else if (customData.getInt("kubejs_durability") > 0) {
            // Damage the mesh
            customData.putInt("kubejs_durability", customData.getInt("kubejs_durability") - 1)
            if (debug) console.log(`Mesh ${meshid} damaged, new durability ${customData.getInt("kubejs_durability")}`)
            // Update the mesh
            updateMeshNbt();
        }

        if (customData.getInt("kubejs_durability") <= 0) {
            // Remove the broken mesh
            mesh.putInt("count", mesh.getInt("count") - 1)
            if (mesh.getInt("count") <= 0) {
                // Removing the mesh, and then remove the contents.
                sieveNBT.remove("mesh")
                sieveNBT.remove("contents")
                sieveNBT.putFloat("progress", 0);
                // When setting the nbt, the sieve still thinks it has a mesh and contents
                // So we will just remove the whole block.

                // Notify players nearby
                sieveBlk.getPlayersInRadius(5).playSound("minecraft:entity.turtle.egg_break", 5.0, 2);
                if (debug) console.log(`Mesh ${meshid} broke and was removed.`);
                event.block.setEntityData(sieveNBT);
                event.level.sendBlockUpdated(event.block.pos, event.block.blockState, event.block.blockState, 1);
                return;
            }
        }

        // Update the lore to show durability
        if (sieveNBT.contains("mesh")) {
            let tagType = NBT.stringTag("").id // 8 is the type for strings
            let lore = components.getList("minecraft:lore", tagType) // Returns a empty list if not present
            if (debug) console.log(`Current lore: ${lore} From Tag Type: ${tagType}`)
            lore.removeIf(l => l.toString().includes("Durability: "))
            lore.addFirst(NBT.stringTag(``)) // Add a blank entry to ensure we have at least one entry

            // Double quotes are REQUIRED for the lore. Otherwise it won't be allowed onto the block entity.
            lore.set(0, NBT.stringTag(`"Durability: ${customData.getInt("kubejs_durability")}/${meshData.IDurability}"`))
            components.put("minecraft:lore", NBT.toTag(lore));
            updateMeshNbt();
            if (debug) console.log(`Updated lore: ${components}`);

            if (!components.contains("minecraft:lore")) throw `Failed to create lore for mesh ${meshid}`;
        }

        // Update the sieve
        updateMeshNbt();
        if (debug) console.log(`Mesh data to write: ${sieveNBT}`);
        event.block.setEntityData(sieveNBT);
        if (debug) console.log(`Updating sieve ${event.block.pos} with data: ${event.block.entityData}`);
    }

    BlockEvents.rightClicked(event => {
        if (!hardcore) return; // Only run if hardcore mode is enabled
        if (event.block.entityId.match(/exdeorum:sieve|exdeorum:compressed_sieve/)) {
            let checkFail = degradeManual(event);
            if (debug && checkFail) console.log(`Manual Sieve at ${event.block.pos} skipped degrading mesh: ${checkFail}`);
        }
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