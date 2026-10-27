/**
 * Sets up the fullscreen button: it is hidden if the browser does not allow fullscreen, and it follows
 * every change of the fullscreen state.
 * @returns {void}
 */
function initFullscreen(){
    document.getElementById('fullscreen-button').hidden = !document.fullscreenEnabled;
    document.addEventListener('fullscreenchange', updateFullscreenUi);
}

/**
 * Switches fullscreen on or off and releases the focus of the button.
 * @returns {void}
 */
function toggleFullscreen(){
    if(document.fullscreenElement){
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    releaseFocus();
}

/**
 * Shows on the fullscreen button whether fullscreen is on.
 * @returns {void}
 */
function updateFullscreenUi(){
    const IS_FULLSCREEN = document.fullscreenElement !== null;
    const FULLSCREEN_BUTTON = document.getElementById('fullscreen-button');
    FULLSCREEN_BUTTON.classList.toggle('is-fullscreen', IS_FULLSCREEN);
    FULLSCREEN_BUTTON.setAttribute('aria-pressed', IS_FULLSCREEN);
}
