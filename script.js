let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
let soundManager = new SoundManager();
let selectedCharacter = 'fireWizard';

function getStartLevelData(){
    return GAME_SETTINGS.debug.startInBossLevel ? LEVEL_ONE_BOSS : LEVEL_ONE;
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

function startGame(){
    fadeThroughBlack(finishStartGame);
}

function finishStartGame(){
    createWorld(getStartLevelData());
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
