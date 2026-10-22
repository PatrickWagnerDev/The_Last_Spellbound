const IMAGE_KEY = './assets/image/06-tileset/Objects_Animated/Golden_Key.png';

class Key extends Collectible {
    constructor(column, row){
        super(column, row, GAME_SETTINGS.key, IMAGE_KEY, 12);
    }

    applyEffect(character){
        character.keyCount++;
    }
}
