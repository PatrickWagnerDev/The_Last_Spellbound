const IMAGES_PORTAL = [
    './assets/image/08-magic-effects/PNG/Spiral/Spiral1.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral2.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral3.png'
];

/**
 * The portal that appears when the chest is opened. It grows to its full size, shows a spinning spiral and
 * starts the transition to the boss part when the character touches it.
 */
class Portal extends LevelItem {
    settings = GAME_SETTINGS.portal;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    appearTicks = 0;
    isUsed = false;

    /**
     * Creates a portal that stands on the bottom edge of a map cell and starts its game loop.
     * @param {number} column - Map column of the portal.
     * @param {number} row - Map row of the portal.
     */
    constructor(column, row){
        super();
        this.setupSprites(IMAGES_PORTAL);
        this.centerX = column * TILE_SIZE + TILE_SIZE / 2;
        this.centerY = (row + 1) * TILE_SIZE - this.settings.size / 2;
        this.updateSize();
        this.startAnimation();
    }

    /**
     * Tells whether the portal has finished growing and can be entered.
     * @returns {boolean} True when the appear time is over.
     */
    isAppeared(){
        return this.appearTicks >= this.settings.appearTicks;
    }

    /**
     * Sets the size and the position of the portal for its growth, around its center, and a hitbox of the
     * middle 60 percent.
     * @returns {void}
     */
    updateSize(){
        const PORTAL_SIZE = this.settings.size * Math.min(this.appearTicks / this.settings.appearTicks, 1);
        this.width = PORTAL_SIZE;
        this.height = PORTAL_SIZE;
        this.x = this.centerX - PORTAL_SIZE / 2;
        this.y = this.centerY - PORTAL_SIZE / 2;
        this.hitbox = { offsetX: PORTAL_SIZE * 0.2, offsetY: PORTAL_SIZE * 0.2, width: PORTAL_SIZE * 0.6, height: PORTAL_SIZE * 0.6 };
    }

    /**
     * Runs one tick of the portal: counts the time, updates its size, picks the picture of the spiral and checks
     * whether the character enters.
     * @returns {void}
     */
    updateObject(){
        this.appearTicks++;
        this.updateSize();
        const FRAME_INDEX = Math.floor(this.appearTicks / getTicksPerFrame(this.settings.animationFps)) % 3;
        this.setSprite(IMAGES_PORTAL[FRAME_INDEX], 1, 0);
        this.checkEntering();
    }

    /**
     * Starts the transition if the portal is ready and unused and the living character touches it.
     * @returns {void}
     */
    checkEntering(){
        const PLAYER_CHARACTER = this.world.character;
        if(this.isAppeared() && !this.isUsed && !PLAYER_CHARACTER.isDead() && this.isColliding(PLAYER_CHARACTER)){
            this.isUsed = true;
            this.world.startTransition(this);
        }
    }
}
