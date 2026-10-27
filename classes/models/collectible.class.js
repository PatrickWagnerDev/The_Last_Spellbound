const IMAGE_PICKUP = './assets/image/06-tileset/Objects_Animated/Pickup.png';

/**
 * Base class of the things that are collected by touching them: key, pizza and donut. It shows the picture of
 * the item in the middle of its map cell. When the item is collected its effect works, a short sparkle
 * animation plays and the item disappears. The subclasses decide what the item does.
 */
class Collectible extends LevelItem {
    frameWidth = 16;
    frameHeight = 16;
    isCollected = false;
    collectTicks = 0;

    /**
     * Builds the item: its size, its animation, a hitbox of the full size, its pictures and its place in the
     * middle of the map cell, and starts its game loop.
     * @param {number} column - Map column of the item.
     * @param {number} row - Map row of the item.
     * @param {{scale: number, animationFps?: number}} settings - Settings of the item type.
     * @param {string} imagePath - Path of the sprite sheet of the item.
     * @param {number} frameTotal - Number of frames in the sprite sheet.
     */
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

    /**
     * Tells whether the character may collect the item in its current state. Subclasses limit this.
     * @param {Character} character - The character that touches the item.
     * @returns {boolean} True here, always.
     */
    canCollect(character){
        return true;
    }

    /**
     * Hook for what the item does to the character, every item type overrides it. Does nothing here.
     * @param {Character} character - The character that collects the item.
     * @returns {void}
     */
    applyEffect(character){
    }

    /**
     * Tells whether the item can be collected: it has not been collected yet and the character may collect it.
     * @param {Character} character - The character that touches the item.
     * @returns {boolean} True if the item can be collected now.
     */
    isCollectable(character){
        return !this.isCollected && this.canCollect(character);
    }

    /**
     * Collects the item: plays the sound, applies the effect, marks the item as collected and switches to the
     * larger sparkle animation, centered where the item was.
     * @param {Character} character - The character that collects the item.
     * @returns {void}
     */
    collectItem(character){
        soundManager.playSound('collect');
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

    /**
     * Runs one tick of the item: nothing until it is collected, then the end of the sparkle animation.
     * @returns {void}
     */
    updateObject(){
        if(this.isCollected){
            this.updatePickup();
        }
    }

    /**
     * Counts the time of the sparkle animation and removes the item when it is over.
     * @returns {void}
     */
    updatePickup(){
        this.collectTicks++;
        if(this.collectTicks >= getTicksPerFrame(GAME_SETTINGS.item.pickupFps) * 6){
            this.stopAnimation();
            this.world.level.removeItem(this);
        }
    }
}
