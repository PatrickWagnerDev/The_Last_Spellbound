const IMAGE_KEY = './assets/image/06-tileset/Objects_Animated/Golden_Key.png';

/**
 * The golden key. Collecting it gives the character one more key, which opens the chest.
 */
class Key extends Collectible {
    /**
     * Creates a key on a map cell.
     * @param {number} column - Map column of the key.
     * @param {number} row - Map row of the key.
     */
    constructor(column, row){
        super(column, row, GAME_SETTINGS.key, IMAGE_KEY, 12);
    }

    /**
     * Gives the character one more key.
     * @param {Character} character - The character that collects the key.
     * @returns {void}
     */
    applyEffect(character){
        character.keyCount++;
    }
}
