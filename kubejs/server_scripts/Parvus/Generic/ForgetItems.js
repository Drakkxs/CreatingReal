// priority: 0
// @ts-check
// Remove all items from the player's inventory.


// Immidately Invoked Function Expression to prevent polluting the global namespace
(() => {

    PlayerEvents.loggedIn(e => {
        e.server.runCommandSilent(`/clear ${e.player.getUuid()}`)
    })
})