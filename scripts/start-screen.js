const START_WIZARD_IMAGE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const PRESS_EVENTS = ['keydown', 'pointerdown'];

function loadStartAssets(){
    const WIZARD_IMAGE = createImage(START_WIZARD_IMAGE);
    return Promise.all([document.fonts.load('24px "Straight Pixel Gothic"'), document.fonts.load('16px "Planes ValMore"'), WIZARD_IMAGE.decode()]);
}

function setStartPhase(removedClasses, addedClass){
    const START_SCREEN = document.getElementById('start-screen');
    START_SCREEN.classList.remove(...removedClasses);
    START_SCREEN.classList.add(addedClass);
}

function centerTitleLines(){
    const START_TITLE = document.querySelector('.start-title');
    const FIRST_LINE = START_TITLE.querySelector('.title-line');
    START_TITLE.style.setProperty('--title-line-shift', `${(START_TITLE.offsetWidth - FIRST_LINE.offsetWidth) / 2}px`);
}

function showPressScreen(){
    centerTitleLines();
    setStartPhase(['is-waiting'], 'is-press');
    PRESS_EVENTS.forEach(eventName => window.addEventListener(eventName, leavePressScreen));
}

function leavePressScreen(){
    PRESS_EVENTS.forEach(eventName => window.removeEventListener(eventName, leavePressScreen));
    soundManager.playMusic('menuMusic');
    setStartPhase(['is-press'], 'is-settle');
}

function playStartIntro(){
    setStartPhase(['is-waiting', 'is-ready'], 'is-intro');
}

function finishStartIntro(){
    setStartPhase(['is-intro', 'is-settle'], 'is-ready');
}

function updateStartScreenUi(isOpen){
    toggleScreen('start-screen', isOpen, 'game-container', 'is-start-screen');
}
