const IMAGE_PIZZA = './assets/image/06-tileset/Objects/Food/Pizza.png';

class Pizza extends Collectible {
    constructor(column, row){
        super(column, row, GAME_SETTINGS.pizza, IMAGE_PIZZA, 1);
    }

    canCollect(character){
        return character.health < character.maxHealth;
    }

    applyEffect(character){
        character.restoreHealth(this.settings.healAmount);
    }
}
