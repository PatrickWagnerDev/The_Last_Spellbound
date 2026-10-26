const EFFECT_FRAME_MS = 100;
const EFFECT_FRAME_SIZE = 256;
let effectTimer;

function getEffectPaths(effect){
    return Array.from({ length: effect.frames }, (_, index) => `${effect.prefix}${index + 1}${effect.suffix}`);
}

function fitEffectToCanvas(effect){
    const EFFECT_STYLE = document.getElementById('character-effect').style;
    const EFFECT_SCALE = gameCanvas.height / effect.bounds.height;
    EFFECT_STYLE.width = `${EFFECT_FRAME_SIZE * EFFECT_SCALE}px`;
    EFFECT_STYLE.height = EFFECT_STYLE.width;
    EFFECT_STYLE.left = `${gameCanvas.width / 2 - (effect.bounds.x + effect.bounds.width / 2) * EFFECT_SCALE}px`;
    EFFECT_STYLE.top = `${gameCanvas.height / 2 - (effect.bounds.y + effect.bounds.height / 2) * EFFECT_SCALE}px`;
}

function preloadEffectFrames(){
    Object.values(CHARACTER_TRAITS).forEach(traits => getEffectPaths(traits.selectEffect).forEach(createImage));
}

function showEffectFrame(imagePath){
    const EFFECT_IMAGE = document.getElementById('character-effect');
    EFFECT_IMAGE.src = imagePath;
    EFFECT_IMAGE.hidden = false;
}

function stopCharacterEffect(){
    clearInterval(effectTimer);
    document.getElementById('character-effect').hidden = true;
}

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
