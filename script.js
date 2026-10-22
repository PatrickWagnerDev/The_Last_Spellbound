let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
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

function init(){
    gameCanvas = document.getElementById('game-canvas');
    gameWorld = new World(gameCanvas, gameKeyboard);
}

function updateKey(event, isPressed){
    const KEY_NAME = KEY_MAP[event.code];
    if(KEY_NAME){
        event.preventDefault();
        gameKeyboard[KEY_NAME] = isPressed;
    }
}

function togglePause(){
    const PAUSE_BUTTON = document.getElementById('pause-button');
    gameWorld.togglePause();
    PAUSE_BUTTON.classList.toggle('is-paused', gameWorld.isPauseActive());
    PAUSE_BUTTON.blur();
}

function handlePauseKey(event){
    if(event.code == 'Escape' && !event.repeat){
        togglePause();
    }
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
