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
    Space: 'SPACE'
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

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keyup', (event) => updateKey(event, false));
