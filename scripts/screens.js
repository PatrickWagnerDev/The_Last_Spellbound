const SCREEN_FADE_MS = 400;

/**
 * Removes the focus from the element that has it, so that keys such as the space bar do not press a button again.
 * @returns {void}
 */
function releaseFocus(){
    document.activeElement?.blur();
}

/**
 * Shows or hides a screen: it sets a class on a marker element and the class is-open on the screen, then
 * releases the focus.
 * @param {string} screenId - Id of the screen element.
 * @param {boolean} isOpen - True to show the screen, false to hide it.
 * @param {string} markerId - Id of the element that gets the marker class.
 * @param {string} markerClass - Class that marks the state, for example 'is-game-over'.
 * @returns {void}
 */
function toggleScreen(screenId, isOpen, markerId, markerClass){
    document.getElementById(markerId).classList.toggle(markerClass, isOpen);
    document.getElementById(screenId).classList.toggle('is-open', isOpen);
    releaseFocus();
}

/**
 * Fades the screen to black, runs a function while it is black and fades back in. If the function returns a
 * promise, the fade back in waits for it.
 * @param {function(): (void|Promise<void>)} onBlack - What to do while the screen is black.
 * @returns {void}
 */
function fadeThroughBlack(onBlack){
    const SCREEN_FADE = document.getElementById('screen-fade');
    SCREEN_FADE.classList.add('is-black');
    setTimeout(() => {
        Promise.resolve(onBlack()).then(() => SCREEN_FADE.classList.remove('is-black'));
    }, SCREEN_FADE_MS);
}

/**
 * Shows or hides the end screen of the game.
 * @param {boolean} isGameOver - True to show it.
 * @returns {void}
 */
function updateGameOverUi(isGameOver){
    toggleScreen('game-over-screen', isGameOver, 'game-container', 'is-game-over');
}

/**
 * Shows the Next button only after a victory and only if there is another level.
 * @param {boolean} isVictory - True after a victory.
 * @returns {void}
 */
function updateNextLevelUi(isVictory){
    const HAS_NEXT_LEVEL = gameWorld.levelData.levelNumber < LEVEL_LIST.length;
    document.getElementById('next-level-button').hidden = !(isVictory && HAS_NEXT_LEVEL);
}

/**
 * Shows the end of the game: sets the title, shows the screen and the Next button, stops the music, plays the
 * end sound and, after a victory, marks the level as cleared.
 * @param {boolean} isVictory - True for a victory, false for game over.
 * @returns {void}
 */
function showGameEnd(isVictory){
    releaseAllKeys();
    document.getElementById('game-over-title').textContent = isVictory ? 'VICTORY' : 'GAME OVER';
    updateGameOverUi(true);
    updateNextLevelUi(isVictory);
    soundManager.stopMusic();
    soundManager.playSound(isVictory ? 'victory' : 'gameOver');
    if(isVictory){
        levelProgress.markCleared(gameWorld.levelData.levelNumber);
    }
}

/**
 * Shows or hides the pause menu depending on the state of the world.
 * @returns {void}
 */
function updatePauseUi(){
    const IS_PAUSED = gameWorld?.isPauseActive() ?? false;
    toggleScreen('pause-menu', IS_PAUSED, 'pause-button', 'is-paused');
}

/**
 * Shows on the mute button whether the sound is muted.
 * @returns {void}
 */
function updateMuteUi(){
    const MUTE_BUTTON = document.getElementById('mute-button');
    MUTE_BUTTON.classList.toggle('is-muted', soundManager.isMuted);
    MUTE_BUTTON.setAttribute('aria-pressed', soundManager.isMuted);
}
