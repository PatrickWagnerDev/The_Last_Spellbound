const IMAGE_DONUT = './assets/image/06-tileset/Objects/Food/Donut.png';

class Donut extends Collectible {
    constructor(column, row){
        super(column, row, GAME_SETTINGS.donut, IMAGE_DONUT, 1);
    }

    canCollect(character){
        return character.energy < character.maxEnergy;
    }

    applyEffect(character){
        character.addEnergy(character.maxEnergy);
    }
}
