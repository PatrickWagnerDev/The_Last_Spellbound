const IMAGE_KEY = './assets/image/06-tileset/Objects_Animated/Golden_Key.png';
const IMAGE_PICKUP = './assets/image/06-tileset/Objects_Animated/Pickup.png';

class Key extends MovableObject {
    settings = GAME_SETTINGS.key;
    width = TILE_SIZE;
    height = TILE_SIZE;
    frameWidth = 16;
    frameHeight = 16;
    frameCount = 12;
    animationFps = this.settings.animationFps;
    hitbox = { offsetX: 6, offsetY: 6, width: 36, height: 36 };
    isCollected = false;
    collectTicks = 0;

    constructor(column, row){
        super();
        this.setupSprites([IMAGE_KEY, IMAGE_PICKUP]);
        this.x = column * TILE_SIZE;
        this.y = row * TILE_SIZE;
        this.startAnimation();
    }

    isCollectable(){
        return !this.isCollected;
    }

    collect(character){
        character.keyCount++;
        this.isCollected = true;
        this.frameWidth = 32;
        this.frameHeight = 32;
        this.width = 96;
        this.height = 96;
        this.x -= 24;
        this.y -= 24;
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
