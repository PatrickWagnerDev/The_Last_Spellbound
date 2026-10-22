const IMAGE_CHEST = './assets/image/06-tileset/Objects_Animated/Golden_Chest_Open.png';

class Chest extends MovableObject {
    settings = GAME_SETTINGS.chest;
    width = 32 * this.settings.scale;
    height = 32 * this.settings.scale;
    frameWidth = 32;
    frameHeight = 32;
    frameCount = 8;
    animationFps = 0;
    hitbox = { offsetX: 0, offsetY: 15 * this.settings.scale, width: 26 * this.settings.scale, height: 17 * this.settings.scale };
    isOpen = false;
    openTicks = 0;

    constructor(column, row){
        super();
        this.setupSprites([IMAGE_CHEST]);
        this.x = column * TILE_SIZE + (TILE_SIZE - 26 * this.settings.scale) / 2;
        this.y = (row + 1) * TILE_SIZE - this.height;
        this.startAnimation();
    }

    isCollectable(character){
        return false;
    }

    isNearCharacter(character){
        const CHEST_RECT = this.getHitbox();
        const NEAR_RECT = {
            x: CHEST_RECT.x - this.settings.openDistance,
            y: CHEST_RECT.y,
            width: CHEST_RECT.width + 2 * this.settings.openDistance,
            height: CHEST_RECT.height
        };
        return areRectsOverlapping(character.getHitbox(), NEAR_RECT);
    }

    updateObject(){
        if(this.isOpen){
            this.updateOpening();
        } else {
            this.checkOpen();
        }
    }

    checkOpen(){
        const CHARACTER = this.world.character;
        if(CHARACTER.keyCount > 0 && !CHARACTER.isDead() && this.isNearCharacter(CHARACTER)){
            CHARACTER.keyCount--;
            this.isOpen = true;
        }
    }

    updateOpening(){
        this.openTicks++;
        this.currentFrame = getProgressFrame(this.openTicks, getTicksPerFrame(this.settings.openFps) * 8, 8);
    }
}
