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

function pauseInPortrait(event){
    if(event.matches && gameWorld && !gameWorld.isPaused){
        togglePause();
    }
}

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

function releaseAllKeys(){
    Object.keys(gameKeyboard).forEach(keyName => gameKeyboard[keyName] = false);
    document.querySelectorAll('.touch-button.is-pressed').forEach(button => button.classList.remove('is-pressed'));
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
PORTRAIT_QUERY.addEventListener('change', pauseInPortrait);
window.addEventListener('blur', releaseAllKeys);
