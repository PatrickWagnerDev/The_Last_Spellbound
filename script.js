let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
let soundManager = new SoundManager();
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

function getStartLevelData(){
    return GAME_SETTINGS.debug.startInBossLevel ? LEVEL_ONE_BOSS : LEVEL_ONE;
}

function init(){
    gameCanvas = document.getElementById('game-canvas');
    updateMuteUi();
    addMenuSounds();
    document.querySelector('.start-buttons').addEventListener('animationend', finishStartIntro);
    loadStartAssets().catch(() => {}).then(showPressScreen);
}

function startGame(){
    fadeThroughBlack(finishStartGame);
}

function finishStartGame(){
    soundManager.stopMusic();
    createWorld(getStartLevelData());
    updateStartScreenUi(false);
}

function goHome(){
    fadeThroughBlack(showStartScreen);
}

function showStartScreen(){
    gameWorld.stopWorld();
    gameWorld = null;
    updateGameOverUi(false);
    updatePauseUi();
    updateStartScreenUi(true);
    playStartIntro();
    soundManager.playMusic('menuMusic');
}

function createWorld(levelData){
    gameWorld = new World(gameCanvas, gameKeyboard, levelData, showGameEnd);
}

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

function togglePause(){
    if(!gameWorld){
        return;
    }
    gameWorld.togglePause();
    updatePauseUi();
}

function toggleMute(){
    soundManager.toggleMute();
    updateMuteUi();
    releaseFocus();
}

function restartLevel(){
    fadeThroughBlack(restartWorld);
}

function restartWorld(){
    const RESTART_DATA = gameWorld.restartLevelData;
    gameWorld.stopWorld();
    createWorld(RESTART_DATA);
    updateGameOverUi(false);
    updatePauseUi();
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

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
PORTRAIT_QUERY.addEventListener('change', pauseInPortrait);
