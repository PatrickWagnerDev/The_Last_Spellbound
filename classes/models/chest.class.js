const IMAGE_CHEST = './assets/image/06-tileset/Objects_Animated/Golden_Chest_Open.png';

/**
 * The chest. It opens when the character has a key and stands near it, which costs the key. After the
 * opening animation a portal appears next to it that leads to the boss part of the level.
 */
class Chest extends LevelItem {
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
    hasSpawnedPortal = false;
    hasPlayedSound = false;

    /**
     * Creates a chest standing on the bottom edge of a map cell, centered in it, and starts its game loop.
     * @param {number} column - Map column of the chest.
     * @param {number} row - Map row of the chest.
     */
    constructor(column, row){
        super();
        this.column = column;
        this.row = row;
        this.setupSprites([IMAGE_CHEST]);
        this.x = column * TILE_SIZE + (TILE_SIZE - 26 * this.settings.scale) / 2;
        this.y = (row + 1) * TILE_SIZE - this.height;
        this.startAnimation();
    }

    /**
     * Tells whether the character stands close enough to open the chest: its hitbox touches the area of the
     * chest widened to both sides.
     * @param {Character} character - The character of the player.
     * @returns {boolean} True if the character is near.
     */
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

    /**
     * Runs one tick of the chest: the opening animation if it is open, otherwise the check whether it opens.
     * @returns {void}
     */
    updateObject(){
        if(this.isOpen){
            this.updateOpening();
        } else {
            this.checkOpen();
        }
    }

    /**
     * Opens the chest if the character is alive, has a key and stands near. The key is used up.
     * @returns {void}
     */
    checkOpen(){
        const PLAYER_CHARACTER = this.world.character;
        if(PLAYER_CHARACTER.keyCount > 0 && !PLAYER_CHARACTER.isDead() && this.isNearCharacter(PLAYER_CHARACTER)){
            PLAYER_CHARACTER.keyCount--;
            this.isOpen = true;
        }
    }

    /**
     * Runs one tick of the opening animation, plays the sound at its frame and creates the portal once the
     * animation is over.
     * @returns {void}
     */
    updateOpening(){
        this.openTicks++;
        const TOTAL_TICKS = getTicksPerFrame(this.settings.openFps) * 8;
        this.currentFrame = getProgressFrame(this.openTicks, TOTAL_TICKS, 8);
        this.playOpenSound();
        if(this.openTicks >= TOTAL_TICKS && !this.hasSpawnedPortal){
            this.hasSpawnedPortal = true;
            this.world.addItem(new Portal(this.column + this.settings.portalOffset, this.row));
        }
    }

    /**
     * Plays the opening sound once when the animation reaches the frame of the lid.
     * @returns {void}
     */
    playOpenSound(){
        if(this.currentFrame >= this.settings.openSoundFrame && !this.hasPlayedSound){
            this.hasPlayedSound = true;
            soundManager.playSound('chestOpen');
        }
    }
}
