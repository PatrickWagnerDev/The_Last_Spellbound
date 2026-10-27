/**
 * Base class for everything that is drawn on the canvas. It holds the position, the size, the current image
 * and the frame of the sprite sheet that is shown, and it draws the object, mirrored if needed.
 */
class DrawableObject{
    x = 0;
    y = 0;
    img;
    width = 100;
    height = 100;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    currentFrame = 0;
    frameRow = 0;
    animationFps = 8;
    tickCount = 0;
    otherDirection = false;
    spriteFacesLeft = false;
    imageCache = {};
    currentPath;

    /**
     * Loads a single image and makes it the image of this object.
     * @param {string} path - Path of the image file.
     * @returns {void}
     */
    loadImage(path){
        this.img = createImage(path);
    }

    /**
     * Loads several images and stores them in the image cache under their path, so they can be switched to later.
     * @param {string[]} paths - Paths of the image files.
     * @returns {void}
     */
    loadImages(paths){
        paths.forEach(path => this.imageCache[path] = createImage(path));
    }

    /**
     * Switches to another sprite sheet and restarts its animation. Does nothing if the sheet is already active,
     * so it can be called every tick.
     * @param {string} path - Path of the sprite sheet, it must be in the image cache.
     * @param {number} count - Number of frames in the sprite sheet.
     * @param {number} fps - Animation speed in frames per second.
     * @returns {void}
     */
    setSprite(path, count, fps){
        if(this.currentPath === path){
            return;
        }
        this.img = this.imageCache[path];
        this.frameCount = count;
        this.animationFps = fps;
        this.tickCount = 0;
        this.currentFrame = 0;
        this.currentPath = path;
    }

    /**
     * Advances the looping animation. Counts one tick and shows the next frame when the frame time is over.
     * @returns {void}
     */
    nextFrame(){
        this.tickCount++;
        if(this.tickCount >= getTicksPerFrame(this.animationFps)){
            this.tickCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    /**
     * Shows a sprite sheet whose frame follows the progress of a process with a fixed duration.
     * @param {string} path - Path of the sprite sheet, it must be in the image cache.
     * @param {number} frameTotal - Number of frames in the sprite sheet.
     * @param {number} elapsedTicks - Ticks since the process started.
     * @param {number} totalTicks - Duration of the whole process in ticks.
     * @returns {void}
     */
    setProgressSprite(path, frameTotal, elapsedTicks, totalTicks){
        this.setSprite(path, frameTotal, 0);
        this.currentFrame = getProgressFrame(elapsedTicks, totalTicks, frameTotal);
    }

    /**
     * Tells whether the image has to be mirrored, which is the case when the direction the sprite
     * faces differs from the direction the object looks.
     * @returns {boolean} True if the object is drawn mirrored.
     */
    isFlipped(){
        return this.otherDirection !== this.spriteFacesLeft;
    }

    /**
     * Draws the object at its position, mirrored if needed.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawObject(ctx){
        if(this.isFlipped()){
            this.drawFlipped(ctx);
        } else {
            this.drawFrame(ctx, this.x);
        }
    }

    /**
     * Draws the object mirrored horizontally around its own center, then restores the drawing state.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawFlipped(ctx){
        ctx.save();
        this.flipContext(ctx);
        this.drawFrame(ctx, 0);
        ctx.restore();
    }

    /**
     * Draws the current frame of the sprite sheet. Subclasses shift the picture by changing drawX.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {number} drawX - Horizontal position to draw at, this.x or 0 when the context is mirrored.
     * @returns {void}
     */
    drawFrame(ctx, drawX){
        ctx.drawImage(
            this.img,
            this.currentFrame * this.frameWidth, this.frameRow * this.frameHeight, this.frameWidth, this.frameHeight,
            Math.round(drawX), Math.round(this.y), this.width, this.height
        );
    }

    /**
     * Moves the origin of the drawing coordinate system to the right edge of the object and flips the x axis,
     * so that a mirrored picture drawn at x 0 appears at the same place as the normal one.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    flipContext(ctx){
        ctx.translate(Math.round(this.x + this.width), 0);
        ctx.scale(-1, 1);
    }
}
