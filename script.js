let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
const START_WIZARD_IMAGE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const SCREEN_FADE_MS = 400;
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
    document.querySelector('.start-buttons').addEventListener('animationend', finishStartIntro);
    loadStartAssets().catch(() => {}).then(playStartIntro);
}

function loadStartAssets(){
    const WIZARD_IMAGE = createImage(START_WIZARD_IMAGE);
    return Promise.all([document.fonts.load('24px "Straight Pixel Gothic"'), document.fonts.load('16px "Planes ValMore"'), WIZARD_IMAGE.decode()]);
}

function playStartIntro(){
    const START_SCREEN = document.getElementById('start-screen');
    START_SCREEN.classList.remove('is-waiting', 'is-ready');
    START_SCREEN.classList.add('is-intro');
}

function finishStartIntro(){
    const START_SCREEN = document.getElementById('start-screen');
    START_SCREEN.classList.remove('is-intro');
    START_SCREEN.classList.add('is-ready');
}

function fadeThroughBlack(onBlack){
    const SCREEN_FADE = document.getElementById('screen-fade');
    SCREEN_FADE.classList.add('is-black');
    setTimeout(() => {
        onBlack();
        SCREEN_FADE.classList.remove('is-black');
    }, SCREEN_FADE_MS);
}

function startGame(){
    fadeThroughBlack(finishStartGame);
}

function finishStartGame(){
    createWorld(getStartLevelData());
    updateStartScreenUi(false);
}

function updateStartScreenUi(isOpen){
    document.getElementById('game-container').classList.toggle('is-start-screen', isOpen);
    document.getElementById('start-screen').classList.toggle('is-open', isOpen);
    document.activeElement?.blur();
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
}

function createWorld(levelData){
    gameWorld = new World(gameCanvas, gameKeyboard, levelData, showGameEnd);
}

function updateGameOverUi(isGameOver){
    document.getElementById('game-container').classList.toggle('is-game-over', isGameOver);
    document.getElementById('game-over-screen').classList.toggle('is-open', isGameOver);
    document.activeElement?.blur();
}

function showGameEnd(isVictory){
    document.getElementById('game-over-title').textContent = isVictory ? 'VICTORY' : 'GAME OVER';
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
    fadeThroughBlack(restartWorld);
}

function restartWorld(){
    const RESTART_DATA = gameWorld.restartLevelData;
    gameWorld.stopWorld();
    createWorld(RESTART_DATA);
    updateGameOverUi(false);
    updatePauseUi();
}

function openControls(){
    const CONTROLS_SCREEN = document.getElementById('controls-screen');
    CONTROLS_SCREEN.classList.remove('is-second-page');
    CONTROLS_SCREEN.classList.add('is-open');
    document.activeElement?.blur();
}

function toggleControlsPage(){
    document.getElementById('controls-screen').classList.toggle('is-second-page');
    document.activeElement?.blur();
}

function hideControls(){
    document.getElementById('controls-screen').classList.remove('is-open');
}

function closeControls(event){
    if(event.target === event.currentTarget || event.target.closest('.close-button')){
        hideControls();
    }
}

function isControlsOpen(){
    return document.getElementById('controls-screen').classList.contains('is-open');
}

function handlePauseKey(event){
    if(event.code != 'Escape' || event.repeat){
        return;
    }
    if(isControlsOpen()){
        hideControls();
    } else {
        togglePause();
    }
}

window.addEventListener('keydown', (event) => updateKey(event, true));
window.addEventListener('keydown', handlePauseKey);
window.addEventListener('keyup', (event) => updateKey(event, false));
