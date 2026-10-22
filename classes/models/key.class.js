const IMAGE_KEY = './assets/image/06-tileset/Objects_Animated/Golden_Key.png';
const IMAGE_PICKUP = './assets/image/06-tileset/Objects_Animated/Pickup.png';

class Key extends MovableObject {
    settings = GAME_SETTINGS.key;
    width = 16 * this.settings.scale;
    height = 16 * this.settings.scale;
    frameWidth = 16;
    frameHeight = 16;
    frameCount = 12;
    animationFps = this.settings.animationFps;
    hitbox = { offsetX: 0, offsetY: 0, width: this.width, height: this.height };
    isCollected = false;
    collectTicks = 0;

    constructor(column, row){
        super();
        this.setupSprites([IMAGE_KEY, IMAGE_PICKUP]);
        this.x = column * TILE_SIZE + (TILE_SIZE - this.width) / 2;
        this.y = row * TILE_SIZE + (TILE_SIZE - this.height) / 2;
        this.startAnimation();
    }

    isCollectable(){
        return !this.isCollected;
    }

    collect(character){
        const CENTER_X = this.x + this.width / 2;
        const CENTER_Y = this.y + this.height / 2;
        character.keyCount++;
        this.isCollected = true;
        this.frameWidth = 32;
        this.frameHeight = 32;
        this.width = 32 * this.settings.scale;
        this.height = 32 * this.settings.scale;
        this.x = CENTER_X - this.width / 2;
        this.y = CENTER_Y - this.height / 2;
        this.setSprite(IMAGE_PICKUP, 6, this.settings.pickupFps);
    }

    updateObject(){
        if(this.isCollected){
            this.updatePickup();
        }
    }

    updatePickup(){
        this.collectTicks++;
        if(this.collectTicks >= getTicksPerFrame(this.settings.pickupFps) * 6){
            this.stopAnimation();
            this.world.level.removeItem(this);
        }
    }
}

const ITEM_MARKERS = { 60: Key };
