const MENU_BUTTON_SELECTOR = '.start-button, .close-button, .page-button, .menu-button, .choose-button, .character-card';
const HOVER_QUERY = window.matchMedia('(hover: hover)');

/**
 * Plays the hover sound when the mouse enters a menu button, only on devices with a mouse.
 * @param {MouseEvent} event - The mouseover event.
 * @returns {void}
 */
function playHoverSound(event){
    const MENU_BUTTON = event.target.closest(MENU_BUTTON_SELECTOR);
    if(HOVER_QUERY.matches && MENU_BUTTON && !MENU_BUTTON.contains(event.relatedTarget)){
        soundManager.playSound('menuHover');
    }
}

/**
 * Plays the click sound after a click on a menu button, except in the pause menu, which has its own sounds.
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
function playClickSound(event){
    const MENU_BUTTON = event.target.closest(MENU_BUTTON_SELECTOR);
    if(MENU_BUTTON && !MENU_BUTTON.closest('#pause-menu')){
        soundManager.playSound('menuClick');
    }
}

/**
 * Adds the hover and the click sound to the game container, which covers all menu buttons.
 * @returns {void}
 */
function addMenuSounds(){
    const GAME_CONTAINER = document.getElementById('game-container');
    GAME_CONTAINER.addEventListener('mouseover', playHoverSound);
    GAME_CONTAINER.addEventListener('click', playClickSound);
}
