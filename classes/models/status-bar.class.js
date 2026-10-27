/**
 * A bar made of an empty and a full picture. The filled part is cut out of the full picture, and the part
 * that was just lost blinks for a moment. Used for the health and energy of the character and the boss bars.
 */
class StatusBar extends DrawableObject {
    frameWidth = 96;
    frameHeight = 12;
    value = 1;
    maxValue = 1;
    blinkFrom = 0;
    blinkTicksLeft = 0;

    /**
     * Creates the bar and loads its two pictures.
     * @param {string} emptyPath - Path of the picture of the empty bar.
     * @param {string} fullPath - Path of the picture of the full bar.
     * @param {number} x - Horizontal position on the canvas.
     * @param {number} y - Vertical position on the canvas.
     * @param {{scale?: number, blink?: boolean}} [options] - Optional size factor and switch for the blinking.
     */
    constructor(emptyPath, fullPath, x, y, options = {}){
        super();
        this.blinkEnabled = options.blink ?? true;
        this.loadImage(emptyPath);
        this.fullImage = createImage(fullPath);
        this.x = x;
        this.y = y;
        const SCALE_FACTOR = options.scale ?? GAME_SETTINGS.ui.statusBarScale;
        this.width = this.frameWidth * SCALE_FACTOR;
        this.height = this.frameHeight * SCALE_FACTOR;
    }

    /**
     * Sets the value and the maximum of the bar. If the value dropped and blinking is on, the lost part
     * starts to blink.
     * @param {number} current - Current value.
     * @param {number} max - Maximum value, the bar is full at this value.
     * @returns {void}
     */
    setValue(current, max){
        if(this.blinkEnabled && current < this.value){
            this.blinkFrom = this.blinkTicksLeft > 0 ? this.blinkFrom : this.value;
            this.blinkTicksLeft = GAME_SETTINGS.ui.blinkTicks;
        }
        this.value = current;
        this.maxValue = max;
    }

    /**
     * Counts the blink time down by one tick.
     * @returns {void}
     */
    updateBlink(){
        this.blinkTicksLeft = tickDown(this.blinkTicksLeft);
    }

    /**
     * Tells whether the blinking part is visible at this moment. It alternates between visible and hidden
     * while the blink time runs.
     * @returns {boolean} True if the lost part has to be drawn.
     */
    isBlinkVisible(){
        const BLINK_PHASE = Math.floor(this.blinkTicksLeft / GAME_SETTINGS.ui.blinkIntervalTicks);
        return this.blinkTicksLeft > 0 && BLINK_PHASE % 2 === 0;
    }

    /**
     * Converts a value into the share of the bar it fills.
     * @param {number} value - A value between 0 and the maximum.
     * @returns {number} The share from 0 to 1, 0 if the maximum is 0.
     */
    getRatio(value){
        return this.maxValue > 0 ? value / this.maxValue : 0;
    }

    /**
     * Draws the bar: the empty picture, the filled part and, while it blinks, the part that was just lost.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawObject(ctx){
        ctx.drawImage(this.img, 0, 0, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
        this.drawFullPart(ctx, 0, this.getRatio(this.value));
        if(this.isBlinkVisible()){
            this.drawFullPart(ctx, this.getRatio(this.value), this.getRatio(this.blinkFrom));
        }
    }

    /**
     * Draws a strip of the full picture between two shares of the bar.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {number} fromRatio - Share of the bar where the strip starts, from 0 to 1.
     * @param {number} toRatio - Share of the bar where the strip ends, from 0 to 1.
     * @returns {void}
     */
    drawFullPart(ctx, fromRatio, toRatio){
        const SOURCE_X = Math.round(this.frameWidth * fromRatio);
        const SOURCE_WIDTH = Math.round(this.frameWidth * toRatio) - SOURCE_X;
        const SCALE_FACTOR = this.width / this.frameWidth;
        if(SOURCE_WIDTH <= 0){
            return;
        }
        ctx.drawImage(this.fullImage, SOURCE_X, 0, SOURCE_WIDTH, this.frameHeight, this.x + SOURCE_X * SCALE_FACTOR, this.y, SOURCE_WIDTH * SCALE_FACTOR, this.height);
    }
}
