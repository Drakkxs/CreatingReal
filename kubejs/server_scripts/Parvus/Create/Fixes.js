// priority: 0
// @ts-check
// A script to help with broken recipes or tags.

// Immediately Invoked Function Expression to prevent polluting the global namespace
(() => {

    /**
     * Want some debug?
     */
    let debug = true

    ServerEvents.tags('fluid', event => {

        event.add("c:molten_enderium", "createmechanisms:enderiam")
    })

})()
