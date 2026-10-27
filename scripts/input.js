const PORTRAIT_QUERY = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
const KEY_MAP = {
    ArrowRight: 'RIGHT',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    KeyD: 'RIGHT',
    KeyA: 'LEFT',
    KeyW: 'UP',
    KeyS: 'DOWN',
    Space: 'SPACE',
    KeyJ: 'ATTACK',
    KeyX: 'ATTACK',
    KeyK: 'SHOOT',
    KeyC: 'SHOOT'
};

/**
 * Passes a key press or release to the keyboard of the game, if the key belongs to the game. During a game
 * the browser action of the key, such as scrolling, is prevented.
 * @param {KeyboardEvent} event - The key event.
 * @param {boolean} isPressed - True for a press, false for a release.
 * @returns {void}
 */
function updateKey(event, isPressed){
    const KEY_NAME = KEY_MAP[event.code];
    if(!KEY_NAME){
        return;
    }
    if(gameWorld && document.activeElement?.tagName !== 'BUTTON'){
        event.preventDefault();
    }
    gameKeyboard[KEY_NAME] = isPressed;
}

/**
 * Pauses the game when a touch device is turned to portrait.
 * @param {MediaQueryListEvent} event - The change of the portrait query.
 * @returns {void}
 */
function pauseInPortrait(event){
    if(event.matches && gameWorld && !gameWorld.isPaused){
        togglePause();
    }
}

/**
 * Handles the Escape key: it closes an open dialog, otherwise it switches the pause. A held key counts once.
 * @param {KeyboardEvent} event - The key event.
 * @returns {void}
 */
function handlePauseKey(event){
    if(event.code !== 'Escape' || event.repeat){
        return;
    }
    if(isDialogOpen()){
        hideDialogs();
    } else {
        togglePause();
    }
}

/**
 * Releases all keys of the game and removes the pressed look of the touch buttons.
 * @returns {void}
 */
function releaseAllKeys(){
    Object.keys(gameKeyboard).forEach(keyName => gameKeyboard[keyName] = false);
    document.querySelectorAll('.touch-button.is-pressed').forEach(button => button.classList.remove('is-pressed'));
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
PORTRAIT_QUERY.addEventListener('change', pauseInPortrait);
window.addEventListener('blur', releaseAllKeys);
