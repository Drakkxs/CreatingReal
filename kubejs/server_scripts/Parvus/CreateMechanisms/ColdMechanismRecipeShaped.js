// priority: 0
// requires: createmechanisms
// New mechanism for createmechanisms.
ServerEvents.recipes(event => {
    /**
         * Maps the values of the given object to their unified tags using getUnifiedTag.
         * @param {Object<string, any>} mapping - An object where each key maps to a value to be unified.
         * @returns {Object<string, any>} A new object with the same keys, where each value is the result of getUnifiedTag.
         */
    function mapTags(mapping) {
        let result = {};
        for (let key in mapping) {
            let value = mapping[key];
            // Only call getUnifiedTag if value is a string (item ID), otherwise pass through (e.g., Ingredient)
            result[key] = (Item.isItem(value)) ? getUnifiedTag(value) : value;
        }
        return result
    }
    event.shaped(
        Item.of('kubejs:cold_mechanism', 1),
        [
            ' d ',
            'aba',
            ' c '
        ],
        mapTags({
            a: 'minecraft:powder_snow_bucket',
            b: 'createmechanisms:rubber_mechanism',
            c: 'minecraft:obsidian',
            d: 'minecraft:blue_ice'
        })
    )
})