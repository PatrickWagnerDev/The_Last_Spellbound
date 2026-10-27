/**
 * Base class of everything that lies in the level and is not an enemy: collectible items, the chest and the
 * portal. It defines the common question whether the character can collect the thing.
 */
class LevelItem extends MovableObject {
    /**
     * Tells whether the character can collect this thing. Always false here, collectible items override it.
     * @param {Character} character - The character that touches the thing.
     * @returns {boolean} True if the thing can be collected.
     */
    isCollectable(character){
        return false;
    }
}
