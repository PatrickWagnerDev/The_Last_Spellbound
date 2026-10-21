let canvas;
let world;
let keyboard = new Keyboard();
const KEY_MAP = {
    ArrowRight: 'RIGHT',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    Space: 'SPACE'
};

function init(){
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

function updateKey(event, isPressed){
    const KEY_NAME = KEY_MAP[event.code];
    if(KEY_NAME){
        event.preventDefault();
        keyboard[KEY_NAME] = isPressed;
    }
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keyup', (event) => updateKey(event, false));
