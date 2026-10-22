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

function getStartLevelData(){
    return GAME_SETTINGS.debug.startInBossLevel ? LEVEL_ONE_BOSS : LEVEL_ONE;
}

function init(){
    gameCanvas = document.getElementById('game-canvas');
}

function startGame(){
    createWorld(getStartLevelData());
    updateStartScreenUi(false);
}

function updateStartScreenUi(isOpen){
    document.getElementById('game-container').classList.toggle('is-start-screen', isOpen);
    document.getElementById('start-screen').classList.toggle('is-open', isOpen);
    document.activeElement?.blur();
}

function goHome(){
    gameWorld.stop();
    gameWorld = null;
    updateGameOverUi(false);
    updatePauseUi();
    updateStartScreenUi(true);
}

function createWorld(levelData){
    gameWorld = new World(gameCanvas, gameKeyboard, levelData, showGameOver);
}

function updateGameOverUi(isGameOver){
    document.getElementById('game-container').classList.toggle('is-game-over', isGameOver);
    document.getElementById('game-over-screen').classList.toggle('is-open', isGameOver);
    document.activeElement?.blur();
}

function showGameOver(){
    updateGameOverUi(true);
}

function updateKey(event, isPressed){
    const KEY_NAME = KEY_MAP[event.code];
    if(KEY_NAME){
        event.preventDefault();
        gameKeyboard[KEY_NAME] = isPressed;
    }
}

function updatePauseUi(){
    const IS_PAUSED = gameWorld?.isPauseActive() ?? false;
    document.getElementById('pause-button').classList.toggle('is-paused', IS_PAUSED);
    document.getElementById('pause-menu').classList.toggle('is-open', IS_PAUSED);
    document.activeElement?.blur();
}

function togglePause(){
    if(!gameWorld){
        return;
    }
    gameWorld.togglePause();
    updatePauseUi();
}

function restartLevel(){
    const RESTART_DATA = gameWorld.restartLevelData;
    gameWorld.stop();
    createWorld(RESTART_DATA);
    updateGameOverUi(false);
    updatePauseUi();
}

function handlePauseKey(event){
    if(event.code == 'Escape' && !event.repeat){
        togglePause();
    }
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
