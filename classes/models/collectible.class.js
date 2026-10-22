const IMAGE_PICKUP = './assets/image/06-tileset/Objects_Animated/Pickup.png';

class Collectible extends MovableObject {
    frameWidth = 16;
    frameHeight = 16;
    isCollected = false;
    collectTicks = 0;

    constructor(column, row, settings, imagePath, frameTotal){
        super();
        this.settings = settings;
        this.width = 16 * settings.scale;
        this.height = 16 * settings.scale;
        this.frameCount = frameTotal;
        this.animationFps = settings.animationFps ?? 8;
        this.hitbox = { offsetX: 0, offsetY: 0, width: this.width, height: this.height };
        this.setupSprites([imagePath, IMAGE_PICKUP]);
        this.x = column * TILE_SIZE + (TILE_SIZE - this.width) / 2;
        this.y = row * TILE_SIZE + (TILE_SIZE - this.height) / 2;
        this.startAnimation();
    }

    canCollect(character){
        return true;
    }

    applyEffect(character){
    }

    isCollectable(character){
        return !this.isCollected && this.canCollect(character);
    }

    collectItem(character){
        const CENTER_X = this.x + this.width / 2;
        const CENTER_Y = this.y + this.height / 2;
        this.applyEffect(character);
        this.isCollected = true;
        this.frameWidth = 32;
        this.frameHeight = 32;
        this.width = 32 * this.settings.scale;
        this.height = 32 * this.settings.scale;
        this.x = CENTER_X - this.width / 2;
        this.y = CENTER_Y - this.height / 2;
        this.setSprite(IMAGE_PICKUP, 6, GAME_SETTINGS.item.pickupFps);
    }

    updateObject(){
        if(this.isCollected){
            this.updatePickup();
        }
    }

    updatePickup(){
        this.collectTicks++;
        if(this.collectTicks >= getTicksPerFrame(GAME_SETTINGS.item.pickupFps) * 6){
            this.stopAnimation();
            this.world.level.removeItem(this);
        }
    }
}
