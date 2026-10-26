const PRESS_EVENTS = ['keydown', 'click'];

function loadStartAssets(){
    preloadEffectFrames();
    const IDLE_DECODES = Object.values(CHARACTER_SPRITES).map(sprites => createImage(sprites.idle.path).decode());
    return Promise.all([document.fonts.load('24px "Straight Pixel Gothic"'), document.fonts.load('16px "Planes ValMore"'), ...IDLE_DECODES]);
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
    setStartPhase(['is-press'], 'is-choose');
}

function markCharacter(characterId){
    const START_SCREEN = document.getElementById('start-screen');
    if(START_SCREEN.dataset.marked !== characterId){
        playCharacterEffect(characterId);
    }
    START_SCREEN.dataset.marked = characterId;
    document.querySelectorAll('.character-card').forEach(card => {
        const IS_MARKED = card.dataset.character === characterId;
        card.classList.toggle('is-marked', IS_MARKED);
        card.setAttribute('aria-checked', IS_MARKED);
    });
    document.getElementById('choose-button').disabled = false;
}

function moveCharacterMark(event){
    const OFFSETS = { ArrowLeft: -1, ArrowRight: 1 };
    if(!(event.code in OFFSETS)){
        return;
    }
    const CARDS = [...document.querySelectorAll('.character-card')];
    const MARKED_INDEX = CARDS.findIndex(card => card.classList.contains('is-marked'));
    const NEXT_CARD = CARDS[clampValue(MARKED_INDEX + OFFSETS[event.code], 0, CARDS.length - 1)];
    NEXT_CARD.focus();
    markCharacter(NEXT_CARD.dataset.character);
}

function chooseCharacter(){
    const START_SCREEN = document.getElementById('start-screen');
    selectedCharacter = START_SCREEN.dataset.marked;
    START_SCREEN.dataset.character = selectedCharacter;
    soundManager.setCharacter(selectedCharacter);
    stopCharacterEffect();
    setStartPhase(['is-choose'], 'is-settle');
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
