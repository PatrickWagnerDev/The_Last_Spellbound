const PRESS_EVENTS = ['keydown', 'click'];

/**
 * Loads what the start screen needs before it is shown: the effect pictures, the standing picture of each
 * character and the two fonts.
 * @returns {Promise<void[]>} Resolves when everything is ready.
 */
function loadStartAssets(){
    preloadEffectFrames();
    const IDLE_DECODES = Object.values(CHARACTER_SPRITES).map(sprites => createImage(sprites.idle.path).decode());
    return Promise.all([document.fonts.load('24px "Straight Pixel Gothic"'), document.fonts.load('16px "Planes ValMore"'), ...IDLE_DECODES]);
}

/**
 * Switches the phase of the start screen: removes the classes of the old phases and adds the class of the new one.
 * @param {string[]} removedClasses - Classes of the phases to leave.
 * @param {string} addedClass - Class of the phase to enter.
 * @returns {void}
 */
function setStartPhase(removedClasses, addedClass){
    const START_SCREEN = document.getElementById('start-screen');
    START_SCREEN.classList.remove(...removedClasses);
    START_SCREEN.classList.add(addedClass);
}

/**
 * Measures how much narrower the first line of the title is than the second and stores half of it for the
 * stylesheet, which uses it to center the first line.
 * @returns {void}
 */
function centerTitleLines(){
    const START_TITLE = document.querySelector('.start-title');
    const FIRST_LINE = START_TITLE.querySelector('.title-line');
    START_TITLE.style.setProperty('--title-line-shift', `${(START_TITLE.offsetWidth - FIRST_LINE.offsetWidth) / 2}px`);
}

/**
 * Shows the Press any key page: centers the title, switches the phase and waits for a key press or a click.
 * @returns {void}
 */
function showPressScreen(){
    centerTitleLines();
    setStartPhase(['is-waiting'], 'is-press');
    PRESS_EVENTS.forEach(eventName => window.addEventListener(eventName, leavePressScreen));
}

/**
 * Leaves the Press any key page at the first key press or click: starts the menu music, which the browser
 * only allows after an input, and goes on to the character selection.
 * @returns {void}
 */
function leavePressScreen(){
    PRESS_EVENTS.forEach(eventName => window.removeEventListener(eventName, leavePressScreen));
    soundManager.playMusic('menuMusic');
    setStartPhase(['is-press'], 'is-choose');
}

/**
 * Plays the intro of the main menu, for example when coming back from a game.
 * @returns {void}
 */
function playStartIntro(){
    setStartPhase(['is-waiting', 'is-ready', 'is-levels'], 'is-intro');
}

/**
 * Ends the intro and makes the main menu ready for use.
 * @returns {void}
 */
function finishStartIntro(){
    setStartPhase(['is-intro', 'is-settle'], 'is-ready');
}

/**
 * Shows the Boss Killer coin in the main menu if all levels are cleared.
 * @returns {void}
 */
function updateBadgeUi(){
    document.getElementById('start-screen').classList.toggle('is-complete', levelProgress.areAllCleared());
}

/**
 * Reacts to the end of an animation on the start screen: the intro is over when the last element has faded
 * in, which is the coin if it is shown and otherwise the menu buttons.
 * @param {AnimationEvent} event - The animationend event.
 * @returns {void}
 */
function handleIntroEnd(event){
    const IS_COMPLETE = document.getElementById('start-screen').classList.contains('is-complete');
    if(event.target.matches(IS_COMPLETE ? '.boss-badge' : '.start-buttons')){
        finishStartIntro();
    }
}

/**
 * Shows or hides the start screen.
 * @param {boolean} isOpen - True to show it.
 * @returns {void}
 */
function updateStartScreenUi(isOpen){
    toggleScreen('start-screen', isOpen, 'game-container', 'is-start-screen');
}
