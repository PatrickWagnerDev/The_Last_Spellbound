let gameCanvas;
let gameWorld;
let gameKeyboard = new Keyboard();
let soundManager = new SoundManager();
let levelProgress = new LevelProgress();
let selectedCharacter = 'fireWizard';

/**
 * Returns the data a level starts with: the level itself, or its boss part if the debug setting is on.
 * @param {number} levelNumber - Number of the level, starting at 1.
 * @returns {object} The data of the level part to start.
 */
function getStartLevelData(levelNumber){
    const LEVEL_DATA = LEVEL_LIST[levelNumber - 1];
    return GAME_SETTINGS.debug.startInBossLevel ? LEVEL_DATA.getNextLevel() : LEVEL_DATA;
}

/**
 * Starts the page: gets the canvas, sets up the sound button, the menu sounds, fullscreen and touch buttons,
 * loads what the start screen needs and then shows the Press any key page.
 * @returns {void}
 */
function init(){
    gameCanvas = document.getElementById('game-canvas');
    updateMuteUi();
    addMenuSounds();
    initFullscreen();
    initTouchControls();
    updateBadgeUi();
    document.getElementById('start-screen').addEventListener('animationend', handleIntroEnd);
    loadStartAssets().catch(() => {}).then(showPressScreen);
}

/**
 * Starts a level from the level selection with a fade through black.
 * @param {number} levelNumber - Number of the level, starting at 1.
 * @returns {void}
 */
function startLevel(levelNumber){
    fadeThroughBlack(() => finishStartGame(levelNumber));
}

/**
 * Loads the level and then builds the world and hides the start screen.
 * @param {number} levelNumber - Number of the level, starting at 1.
 * @returns {Promise<void>} Resolves when the world is running.
 */
function finishStartGame(levelNumber){
    const LEVEL_DATA = getStartLevelData(levelNumber);
    return loadThenStart(LEVEL_DATA, () => {
        createWorld(LEVEL_DATA);
        updateStartScreenUi(false);
    });
}

/**
 * Goes back to the main menu with a fade through black.
 * @returns {void}
 */
function goHome(){
    playUnpauseSound();
    fadeThroughBlack(showStartScreen);
}

/**
 * Shows the main menu: stops and drops the running world, hides the end screen and the pause menu, plays the
 * intro and starts the menu music.
 * @returns {void}
 */
function showStartScreen(){
    gameWorld.stopWorld();
    gameWorld = null;
    updateGameOverUi(false);
    updatePauseUi();
    updateStartScreenUi(true);
    updateBadgeUi();
    playStartIntro();
    soundManager.playMusic('menuMusic');
}

/**
 * Builds the world for a level part and starts the music of the level.
 * @param {object} levelData - Data of the level part.
 * @returns {void}
 */
function createWorld(levelData){
    releaseAllKeys();
    gameWorld = new World(gameCanvas, gameKeyboard, levelData, showGameEnd, selectedCharacter);
    soundManager.playMusic(levelData.music);
}

/**
 * Switches the pause on or off if a game is running, updates the pause menu, plays the sound and releases the
 * keys when the pause starts.
 * @returns {void}
 */
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

/**
 * Plays the sound of the pause menu opening or closing, only if the pause really changed.
 * @param {boolean} wasPaused - Whether the pause was active before the switch.
 * @returns {void}
 */
function playPauseSound(wasPaused){
    if(gameWorld.isPauseActive() !== wasPaused){
        soundManager.playSound(wasPaused ? 'pauseClose' : 'pauseOpen');
    }
}

/**
 * Plays the closing sound of the pause menu if the pause is active, for the buttons that leave it.
 * @returns {void}
 */
function playUnpauseSound(){
    if(gameWorld?.isPauseActive()){
        soundManager.playSound('pauseClose');
    }
}

/**
 * Switches the sound on or off, updates the mute button and releases the focus.
 * @returns {void}
 */
function toggleMute(){
    soundManager.toggleMute();
    updateMuteUi();
    releaseFocus();
}

/**
 * Starts the next level after a victory with a fade through black.
 * @returns {void}
 */
function startNextLevel(){
    fadeThroughBlack(startNextWorld);
}

/**
 * Stops the old world, loads the next level, builds its world and hides the end screen and the pause menu.
 * @returns {Promise<void>} Resolves when the new world is running.
 */
function startNextWorld(){
    const NEXT_LEVEL_DATA = getStartLevelData(gameWorld.levelData.levelNumber + 1);
    gameWorld.stopWorld();
    return loadThenStart(NEXT_LEVEL_DATA, () => {
        createWorld(NEXT_LEVEL_DATA);
        updateGameOverUi(false);
        updatePauseUi();
    });
}

/**
 * Restarts the level with a fade through black.
 * @returns {void}
 */
function restartLevel(){
    playUnpauseSound();
    fadeThroughBlack(restartWorld);
}

/**
 * Stops the old world, loads the level from its start, builds its world and hides the end screen and the
 * pause menu.
 * @returns {Promise<void>} Resolves when the new world is running.
 */
function restartWorld(){
    const RESTART_DATA = gameWorld.restartLevelData;
    gameWorld.stopWorld();
    return loadThenStart(RESTART_DATA, () => {
        createWorld(RESTART_DATA);
        updateGameOverUi(false);
        updatePauseUi();
    });
}
