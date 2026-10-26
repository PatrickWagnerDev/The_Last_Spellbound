const SCREEN_FADE_MS = 400;

function releaseFocus(){
    document.activeElement?.blur();
}

function toggleScreen(screenId, isOpen, markerId, markerClass){
    document.getElementById(markerId).classList.toggle(markerClass, isOpen);
    document.getElementById(screenId).classList.toggle('is-open', isOpen);
    releaseFocus();
}

function fadeThroughBlack(onBlack){
    const SCREEN_FADE = document.getElementById('screen-fade');
    SCREEN_FADE.classList.add('is-black');
    setTimeout(() => {
        onBlack();
        SCREEN_FADE.classList.remove('is-black');
    }, SCREEN_FADE_MS);
}

function updateGameOverUi(isGameOver){
    toggleScreen('game-over-screen', isGameOver, 'game-container', 'is-game-over');
}

function showGameEnd(isVictory){
    releaseAllKeys();
    document.getElementById('game-over-title').textContent = isVictory ? 'VICTORY' : 'GAME OVER';
    updateGameOverUi(true);
    soundManager.stopMusic();
    soundManager.playSound(isVictory ? 'victory' : 'gameOver');
    if(isVictory){
        levelProgress.markCleared(gameWorld.levelData.levelNumber);
    }
}

function updatePauseUi(){
    const IS_PAUSED = gameWorld?.isPauseActive() ?? false;
    toggleScreen('pause-menu', IS_PAUSED, 'pause-button', 'is-paused');
}

function updateMuteUi(){
    const MUTE_BUTTON = document.getElementById('mute-button');
    MUTE_BUTTON.classList.toggle('is-muted', soundManager.isMuted);
    MUTE_BUTTON.setAttribute('aria-pressed', soundManager.isMuted);
}
