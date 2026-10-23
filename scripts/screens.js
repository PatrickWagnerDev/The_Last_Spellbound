const START_WIZARD_IMAGE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const SCREEN_FADE_MS = 400;

function releaseFocus(){
    document.activeElement?.blur();
}

function toggleScreen(screenId, isOpen, markerId, markerClass){
    document.getElementById(markerId).classList.toggle(markerClass, isOpen);
    document.getElementById(screenId).classList.toggle('is-open', isOpen);
    releaseFocus();
}

function loadStartAssets(){
    const WIZARD_IMAGE = createImage(START_WIZARD_IMAGE);
    return Promise.all([document.fonts.load('24px "Straight Pixel Gothic"'), document.fonts.load('16px "Planes ValMore"'), WIZARD_IMAGE.decode()]);
}

function setStartPhase(removedClasses, addedClass){
    const START_SCREEN = document.getElementById('start-screen');
    START_SCREEN.classList.remove(...removedClasses);
    START_SCREEN.classList.add(addedClass);
}

function playStartIntro(){
    setStartPhase(['is-waiting', 'is-ready'], 'is-intro');
}

function finishStartIntro(){
    setStartPhase(['is-intro'], 'is-ready');
}

function updateStartScreenUi(isOpen){
    toggleScreen('start-screen', isOpen, 'game-container', 'is-start-screen');
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
    document.getElementById('game-over-title').textContent = isVictory ? 'VICTORY' : 'GAME OVER';
    updateGameOverUi(true);
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

function openDialog(dialogId){
    const DIALOG_SCREEN = document.getElementById(dialogId);
    DIALOG_SCREEN.classList.remove('is-second-page');
    DIALOG_SCREEN.classList.add('is-open');
    releaseFocus();
}

function toggleControlsPage(){
    document.getElementById('controls-screen').classList.toggle('is-second-page');
    releaseFocus();
}

function hideDialogs(){
    document.querySelectorAll('.dialog-screen.is-open').forEach(dialog => dialog.classList.remove('is-open'));
}

function closeDialog(event){
    if(event.target === event.currentTarget || event.target.closest('.close-button')){
        hideDialogs();
    }
}

function isDialogOpen(){
    return document.querySelector('.dialog-screen.is-open') !== null;
}
