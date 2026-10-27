const TICKS_PER_SECOND = 60;

const PENDING_IMAGES = new Set();

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

function waitForImages(){
    return PENDING_IMAGES.size === 0 ? Promise.resolve() : Promise.all([...PENDING_IMAGES]).then(waitForImages);
}

function tickDown(value){
    return Math.max(value - 1, 0);
}

function clampValue(value, minValue, maxValue){
    return Math.min(Math.max(value, minValue), maxValue);
}

function getTicksPerFrame(fps){
    return TICKS_PER_SECOND / fps;
}

function getProgressFrame(elapsedTicks, totalTicks, frameTotal){
    return Math.min(Math.floor(elapsedTicks / (totalTicks / frameTotal)), frameTotal - 1);
}

function pickAirFrame(frames, speedY, apexSpeed){
    if(frames.apex !== undefined && Math.abs(speedY) <= apexSpeed){
        return frames.apex;
    }
    return speedY > 0 ? frames.up : frames.down;
}

function getRectCenterX(rect){
    return rect.x + rect.width / 2;
}

function areRectsOverlapping(rectA, rectB){
    return rectA.x < rectB.x + rectB.width
        && rectA.x + rectA.width > rectB.x
        && rectA.y < rectB.y + rectB.height
        && rectA.y + rectA.height > rectB.y;
}
