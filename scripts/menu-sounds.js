const MENU_BUTTON_SELECTOR = '.start-button, .close-button, .page-button, .menu-button';
const HOVER_QUERY = window.matchMedia('(hover: hover)');

function playHoverSound(event){
    const MENU_BUTTON = event.target.closest(MENU_BUTTON_SELECTOR);
    if(HOVER_QUERY.matches && MENU_BUTTON && !MENU_BUTTON.contains(event.relatedTarget)){
        soundManager.playSound('menuHover');
    }
}

function playClickSound(event){
    const MENU_BUTTON = event.target.closest(MENU_BUTTON_SELECTOR);
    if(MENU_BUTTON && !MENU_BUTTON.closest('#pause-menu')){
        soundManager.playSound('menuClick');
    }
}

function addMenuSounds(){
    const GAME_CONTAINER = document.getElementById('game-container');
    GAME_CONTAINER.addEventListener('mouseover', playHoverSound);
    GAME_CONTAINER.addEventListener('click', playClickSound);
}
