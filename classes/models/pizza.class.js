const IMAGE_PIZZA = './assets/image/06-tileset/Objects/Food/Pizza.png';

/**
 * The pizza. It heals the character by some health points and can only be collected when the character is
 * missing health.
 */
class Pizza extends Collectible {
    /**
     * Creates a pizza on a map cell.
     * @param {number} column - Map column of the pizza.
     * @param {number} row - Map row of the pizza.
     */
    constructor(column, row){
        super(column, row, GAME_SETTINGS.pizza, IMAGE_PIZZA, 1);
    }

    /**
     * Allows collecting only if the character has lost health.
     * @param {Character} character - The character that touches the pizza.
     * @returns {boolean} True if the health is below the maximum.
     */
    canCollect(character){
        return character.health < character.maxHealth;
    }

    /**
     * Heals the character.
     * @param {Character} character - The character that collects the pizza.
     * @returns {void}
     */
    applyEffect(character){
        character.restoreHealth(this.settings.healAmount);
    }
}
