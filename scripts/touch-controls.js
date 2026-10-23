const TOUCH_RELEASE_MS = 50;
const TOUCH_TIMERS = {};

function initTouchControls(){
    const TOUCH_CONTROLS = document.querySelector('.touch-controls');
    TOUCH_CONTROLS.addEventListener('pointerdown', pressTouchKey);
    TOUCH_CONTROLS.addEventListener('pointerup', releaseTouchKey);
    TOUCH_CONTROLS.addEventListener('pointercancel', releaseTouchKey);
    TOUCH_CONTROLS.addEventListener('contextmenu', event => event.preventDefault());
}

function pressTouchKey(event){
    const TOUCH_BUTTON = event.target.closest('.touch-button');
    if(!TOUCH_BUTTON){
        return;
    }
    clearTimeout(TOUCH_TIMERS[TOUCH_BUTTON.dataset.key]);
    TOUCH_BUTTON.setPointerCapture(event.pointerId);
    TOUCH_BUTTON.classList.add('is-pressed');
    gameKeyboard[TOUCH_BUTTON.dataset.key] = true;
}

function releaseTouchKey(event){
    const TOUCH_BUTTON = event.target.closest('.touch-button');
    if(!TOUCH_BUTTON){
        return;
    }
    const KEY_NAME = TOUCH_BUTTON.dataset.key;
    TOUCH_BUTTON.classList.remove('is-pressed');
    TOUCH_TIMERS[KEY_NAME] = setTimeout(() => gameKeyboard[KEY_NAME] = false, TOUCH_RELEASE_MS);
}
