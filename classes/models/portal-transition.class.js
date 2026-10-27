const SPIRAL_RADIUS_RATIO = 0.4;

/**
 * The transition into the boss part: a spiral circle grows from the portal until it covers the screen, the
 * new level is loaded, and the circle shrinks around the character. It keeps running during a pause.
 */
class PortalTransition extends MovableObject {
    settings = GAME_SETTINGS.transition;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    phase = 'expand';
    phaseTicks = 0;
    totalTicks = 0;
    progress = 0;

    /**
     * Creates the transition at the portal, starts its game loop and plays the portal sound.
     * @param {World} world - The world that runs the transition.
     * @param {number} centerX - Horizontal center of the circle on the screen.
     * @param {number} centerY - Vertical center of the circle on the screen.
     * @param {number} startSize - Size of the portal the circle grows from.
     * @param {object} levelData - Data of the level part that is loaded in the middle of the transition.
     */
    constructor(world, centerX, centerY, startSize, levelData){
        super();
        this.world = world;
        this.levelData = levelData;
        this.centerX = centerX;
        this.centerY = centerY;
        this.startSize = startSize;
        this.coverSize = this.getCoverSize();
        this.setupSprites(IMAGES_PORTAL);
        this.startAnimation();
        soundManager.playSound('portalEnter');
    }

    /**
     * Tells that the transition never stands still, not even while the game is paused.
     * @returns {boolean} Always false.
     */
    isFrozen(){
        return false;
    }

    /**
     * Calculates how large the picture must be so that the circle covers the whole screen from the current center.
     * @returns {number} Size of the picture in pixels.
     */
    getCoverSize(){
        const FAR_X = Math.max(this.centerX, this.world.canvas.width - this.centerX);
        const FAR_Y = Math.max(this.centerY, this.world.canvas.height - this.centerY);
        return Math.hypot(FAR_X, FAR_Y) / SPIRAL_RADIUS_RATIO * 1.1;
    }

    /**
     * Returns the current size of the transition: growing from the portal size to the cover size, then
     * shrinking to nothing.
     * @returns {number} Size in pixels.
     */
    getSize(){
        if(this.phase === 'expand'){
            return this.startSize + (this.coverSize - this.startSize) * this.progress;
        }
        return this.coverSize * this.progress;
    }

    /**
     * Runs one tick of the transition: counts the time, grows or shrinks depending on the phase and picks the
     * picture of the spiral.
     * @returns {void}
     */
    updateObject(){
        this.totalTicks++;
        this.phaseTicks++;
        if(this.phase === 'expand'){
            this.updateExpand();
        } else {
            this.updateContract();
        }
        const FRAME_INDEX = Math.floor(this.totalTicks / getTicksPerFrame(this.settings.spinFps)) % 3;
        this.setSprite(IMAGES_PORTAL[FRAME_INDEX], 1, 0);
    }

    /**
     * Runs a tick of the growing phase and switches the level when the circle covers the screen.
     * @returns {void}
     */
    updateExpand(){
        this.progress = Math.min(this.phaseTicks / this.settings.expandTicks, 1);
        if(this.progress >= 1){
            this.switchLevel();
        }
    }

    /**
     * Runs a tick of the shrinking phase and ends the transition when the circle is gone.
     * @returns {void}
     */
    updateContract(){
        this.progress = Math.max(1 - this.phaseTicks / this.settings.contractTicks, 0);
        if(this.progress <= 0){
            this.world.endTransition();
        }
    }

    /**
     * Switches to the new level while the screen is covered, moves the circle to the character, starts the
     * shrinking phase and plays the exit sound.
     * @returns {void}
     */
    switchLevel(){
        this.world.loadLevel(this.levelData);
        const CHARACTER_RECT = this.world.character.getHitbox();
        this.centerX = getRectCenterX(CHARACTER_RECT) - this.world.cameraX;
        this.centerY = CHARACTER_RECT.y + CHARACTER_RECT.height / 2;
        this.coverSize = this.getCoverSize();
        this.phase = 'contract';
        this.phaseTicks = 0;
        soundManager.playSound('portalExit');
    }

    /**
     * Draws a dark circle that grows with the progress and the spiral picture over it, both around the center.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawObject(ctx){
        const TRANSITION_SIZE = this.getSize();
        ctx.fillStyle = 'rgb(40, 15, 40)';
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, SPIRAL_RADIUS_RATIO * TRANSITION_SIZE * this.progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(this.img, 0, 0, 128, 128, this.centerX - TRANSITION_SIZE / 2, this.centerY - TRANSITION_SIZE / 2, TRANSITION_SIZE, TRANSITION_SIZE);
    }
}
