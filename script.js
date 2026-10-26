let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
let soundManager = new SoundManager();
let levelProgress = new LevelProgress();
let selectedCharacter = 'fireWizard';

function getStartLevelData(levelNumber){
    const LEVEL_DATA = LEVEL_LIST[levelNumber - 1];
    return GAME_SETTINGS.debug.startInBossLevel ? LEVEL_DATA.getNextLevel() : LEVEL_DATA;
}

function init(){
    gameCanvas = document.getElementById('game-canvas');
    updateMuteUi();
    addMenuSounds();
    initFullscreen();
    initTouchControls();
    document.querySelector('.start-buttons').addEventListener('animationend', finishStartIntro);
    loadStartAssets().catch(() => {}).then(showPressScreen);
}

function startLevel(levelNumber){
    fadeThroughBlack(() => finishStartGame(levelNumber));
}

function finishStartGame(levelNumber){
    createWorld(getStartLevelData(levelNumber));
    updateStartScreenUi(false);
}

function goHome(){
    playUnpauseSound();
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
    releaseAllKeys();
    gameWorld = new World(gameCanvas, gameKeyboard, levelData, showGameEnd, selectedCharacter);
    soundManager.playMusic(levelData.music);
}

function togglePause(){
    if(!gameWorld){
        return;
    }
    const WAS_PAUSED = gameWorld.isPauseActive();
    gameWorld.togglePause();
    updatePauseUi();
    playPauseSound(WAS_PAUSED);
    if(gameWorld.isPauseActive()){
        releaseAllKeys();
    }
}

function playPauseSound(wasPaused){
    if(gameWorld.isPauseActive() !== wasPaused){
        soundManager.playSound(wasPaused ? 'pauseClose' : 'pauseOpen');
    }
}

function playUnpauseSound(){
    if(gameWorld?.isPauseActive()){
        soundManager.playSound('pauseClose');
    }
}

function toggleMute(){
    soundManager.toggleMute();
    updateMuteUi();
    releaseFocus();
}

function startNextLevel(){
    fadeThroughBlack(startNextWorld);
}

function startNextWorld(){
    const NEXT_LEVEL_NUMBER = gameWorld.levelData.levelNumber + 1;
    gameWorld.stopWorld();
    createWorld(getStartLevelData(NEXT_LEVEL_NUMBER));
    updateGameOverUi(false);
    updatePauseUi();
}

function restartLevel(){
    playUnpauseSound();
    fadeThroughBlack(restartWorld);
}

function restartWorld(){
    const RESTART_DATA = gameWorld.restartLevelData;
    gameWorld.stopWorld();
    createWorld(RESTART_DATA);
    updateGameOverUi(false);
    updatePauseUi();
}
