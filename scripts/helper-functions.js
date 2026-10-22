const TICKS_PER_SECOND = 60;

function createImage(imagePath){
    const NEW_IMAGE = new Image();
    NEW_IMAGE.src = imagePath;
    return NEW_IMAGE;
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

function getRectCenterX(rect){
    return rect.x + rect.width / 2;
}

function areRectsOverlapping(rectA, rectB){
    return rectA.x < rectB.x + rectB.width
        && rectA.x + rectA.width > rectB.x
        && rectA.y < rectB.y + rectB.height
        && rectA.y + rectA.height > rectB.y;
}
