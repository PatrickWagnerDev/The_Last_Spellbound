const EFFECT_FRAME_MS = 100;
const EFFECT_FRAME_SIZE = 256;
let effectTimer;

/**
 * Builds the paths of the frames of a selection effect from its prefix, its numbers and its suffix.
 * @param {{prefix: string, suffix: string, frames: number}} effect - Description of the effect.
 * @returns {string[]} The paths of all frames.
 */
function getEffectPaths(effect){
    return Array.from({ length: effect.frames }, (_, index) => `${effect.prefix}${index + 1}${effect.suffix}`);
}

/**
 * Sizes and places the effect picture so that the visible part of the effect is as high as the canvas and
 * centered on it.
 * @param {{bounds: {x: number, y: number, width: number, height: number}}} effect - Description of the effect with
 * the visible area inside its frame.
 * @returns {void}
 */
function fitEffectToCanvas(effect){
    const EFFECT_STYLE = document.getElementById('character-effect').style;
    const EFFECT_SCALE = gameCanvas.height / effect.bounds.height;
    EFFECT_STYLE.width = `${EFFECT_FRAME_SIZE * EFFECT_SCALE}px`;
    EFFECT_STYLE.height = EFFECT_STYLE.width;
    EFFECT_STYLE.left = `${gameCanvas.width / 2 - (effect.bounds.x + effect.bounds.width / 2) * EFFECT_SCALE}px`;
    EFFECT_STYLE.top = `${gameCanvas.height / 2 - (effect.bounds.y + effect.bounds.height / 2) * EFFECT_SCALE}px`;
}

/**
 * Preloads the frames of the selection effects of all characters.
 * @returns {void}
 */
function preloadEffectFrames(){
    Object.values(CHARACTER_TRAITS).forEach(traits => getEffectPaths(traits.selectEffect).forEach(createImage));
}

/**
 * Shows one frame of the effect.
 * @param {string} imagePath - Path of the frame.
 * @returns {void}
 */
function showEffectFrame(imagePath){
    const EFFECT_IMAGE = document.getElementById('character-effect');
    EFFECT_IMAGE.src = imagePath;
    EFFECT_IMAGE.hidden = false;
}

/**
 * Stops the selection effect and hides its picture.
 * @returns {void}
 */
function stopCharacterEffect(){
    clearInterval(effectTimer);
    document.getElementById('character-effect').hidden = true;
}

/**
 * Plays the selection effect of a character: the frames follow each other and the effect stops after the last one.
 * @param {string} characterId - 'fireWizard' or 'lightningMage'.
 * @returns {void}
 */
function playCharacterEffect(characterId){
    const SELECT_EFFECT = CHARACTER_TRAITS[characterId].selectEffect;
    const EFFECT_PATHS = getEffectPaths(SELECT_EFFECT);
    let frameIndex = 0;
    clearInterval(effectTimer);
    fitEffectToCanvas(SELECT_EFFECT);
    showEffectFrame(EFFECT_PATHS[0]);
    effectTimer = setInterval(() => {
        frameIndex++;
        frameIndex < EFFECT_PATHS.length ? showEffectFrame(EFFECT_PATHS[frameIndex]) : stopCharacterEffect();
    }, EFFECT_FRAME_MS);
}
