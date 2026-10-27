const TICKS_PER_SECOND = 60;

const PENDING_IMAGES = new Set();

/**
 * Creates an image, starts loading it and tracks it until it has loaded or failed.
 * @param {string} imagePath - Path of the image file.
 * @returns {HTMLImageElement} The image, which may still be loading.
 */
function createImage(imagePath){
    const NEW_IMAGE = new Image();
    const IMAGE_LOAD = new Promise(resolve => {
        NEW_IMAGE.onload = resolve;
        NEW_IMAGE.onerror = resolve;
    });
    PENDING_IMAGES.add(IMAGE_LOAD);
    IMAGE_LOAD.then(() => PENDING_IMAGES.delete(IMAGE_LOAD));
    NEW_IMAGE.src = imagePath;
    return NEW_IMAGE;
}

/**
 * Waits until no image is loading any more, including images that start loading while waiting.
 * @returns {Promise<void>} Resolves when all tracked images have loaded or failed.
 */
function waitForImages(){
    return PENDING_IMAGES.size === 0 ? Promise.resolve() : Promise.all([...PENDING_IMAGES]).then(waitForImages);
}

/**
 * Lowers a tick counter by one without going below zero.
 * @param {number} value - Current number of ticks left.
 * @returns {number} The value minus one, or 0 if it was already 0.
 */
function tickDown(value){
    return Math.max(value - 1, 0);
}

/**
 * Limits a number to a range.
 * @param {number} value - The number to limit.
 * @param {number} minValue - Smallest allowed value.
 * @param {number} maxValue - Largest allowed value.
 * @returns {number} The value, or the nearest limit if it lies outside the range.
 */
function clampValue(value, minValue, maxValue){
    return Math.min(Math.max(value, minValue), maxValue);
}

/**
 * Converts an animation speed into the number of game ticks one animation frame stays visible.
 * @param {number} fps - Animation speed in frames per second.
 * @returns {number} Ticks per frame, may have decimals (60 ticks make one second).
 */
function getTicksPerFrame(fps){
    return TICKS_PER_SECOND / fps;
}

/**
 * Picks the animation frame for a process with a fixed duration so that all frames play once in that time.
 * @param {number} elapsedTicks - Ticks since the process started.
 * @param {number} totalTicks - Duration of the whole process in ticks.
 * @param {number} frameTotal - Number of frames to spread over the duration.
 * @returns {number} Frame index from 0 to frameTotal - 1, stays on the last frame after the end.
 */
function getProgressFrame(elapsedTicks, totalTicks, frameTotal){
    return Math.min(Math.floor(elapsedTicks / (totalTicks / frameTotal)), frameTotal - 1);
}

/**
 * Picks the jump frame that fits the flight phase: rising, at the top or falling.
 * @param {{up: number, down: number, apex?: number}} frames - Frame indexes of the jump phases, apex is optional.
 * @param {number} speedY - Vertical speed, positive while moving up.
 * @param {number} apexSpeed - Speed up to which the object counts as being at the top of the jump.
 * @returns {number} Index of the frame to show.
 */
function pickAirFrame(frames, speedY, apexSpeed){
    if(frames.apex !== undefined && Math.abs(speedY) <= apexSpeed){
        return frames.apex;
    }
    return speedY > 0 ? frames.up : frames.down;
}

/**
 * Calculates the horizontal center of a rectangle.
 * @param {{x: number, width: number}} rect - Rectangle with its left edge and its width.
 * @returns {number} The x position of the middle of the rectangle.
 */
function getRectCenterX(rect){
    return rect.x + rect.width / 2;
}

/**
 * Checks whether two rectangles overlap, rectangles that only touch at an edge do not count.
 * @param {{x: number, y: number, width: number, height: number}} rectA - First rectangle.
 * @param {{x: number, y: number, width: number, height: number}} rectB - Second rectangle.
 * @returns {boolean} True if the rectangles share some area.
 */
function areRectsOverlapping(rectA, rectB){
    return rectA.x < rectB.x + rectB.width
        && rectA.x + rectA.width > rectB.x
        && rectA.y < rectB.y + rectB.height
        && rectA.y + rectA.height > rectB.y;
}
