const IMAGE_DONUT = './assets/image/06-tileset/Objects/Food/Donut.png';

/**
 * The donut. It refills the energy of the character completely and can only be collected when the character
 * is missing energy.
 */
class Donut extends Collectible {
    /**
     * Creates a donut on a map cell.
     * @param {number} column - Map column of the donut.
     * @param {number} row - Map row of the donut.
     */
    constructor(column, row){
        super(column, row, GAME_SETTINGS.donut, IMAGE_DONUT, 1);
    }

    /**
     * Allows collecting only if the character is missing energy.
     * @param {Character} character - The character that touches the donut.
     * @returns {boolean} True if the energy is below the maximum.
     */
    canCollect(character){
        return character.energy < character.maxEnergy;
    }

    /**
     * Refills the energy of the character completely.
     * @param {Character} character - The character that collects the donut.
     * @returns {void}
     */
    applyEffect(character){
        character.addEnergy(character.maxEnergy);
    }
}
