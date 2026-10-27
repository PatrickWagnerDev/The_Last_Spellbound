const TOUCH_RELEASE_MS = 50;
const TOUCH_TIMERS = {};

/**
 * Sets up the touch buttons: they press and release keys of the game, and the context menu is blocked.
 * @returns {void}
 */
function initTouchControls(){
    const TOUCH_CONTROLS = document.querySelector('.touch-controls');
    TOUCH_CONTROLS.addEventListener('pointerdown', pressTouchKey);
    TOUCH_CONTROLS.addEventListener('pointerup', releaseTouchKey);
    TOUCH_CONTROLS.addEventListener('pointercancel', releaseTouchKey);
    TOUCH_CONTROLS.addEventListener('contextmenu', event => event.preventDefault());
}

/**
 * Handles the press of a touch button: shows it pressed and sets the key of the game.
 * @param {PointerEvent} event - The pointer event.
 * @returns {void}
 */
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

/**
 * Handles the release of a touch button: it looks released at once, the key of the game is released after a
 * short delay so that a very short tap is not lost.
 * @param {PointerEvent} event - The pointer event.
 * @returns {void}
 */
function releaseTouchKey(event){
    const TOUCH_BUTTON = event.target.closest('.touch-button');
    if(!TOUCH_BUTTON){
        return;
    }
    const KEY_NAME = TOUCH_BUTTON.dataset.key;
    TOUCH_BUTTON.classList.remove('is-pressed');
    TOUCH_TIMERS[KEY_NAME] = setTimeout(() => gameKeyboard[KEY_NAME] = false, TOUCH_RELEASE_MS);
}
