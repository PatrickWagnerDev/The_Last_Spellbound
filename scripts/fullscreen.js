function initFullscreen(){
    document.getElementById('fullscreen-button').hidden = !document.fullscreenEnabled;
    document.addEventListener('fullscreenchange', updateFullscreenUi);
}

function toggleFullscreen(){
    if(document.fullscreenElement){
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    releaseFocus();
}

function updateFullscreenUi(){
    const IS_FULLSCREEN = document.fullscreenElement !== null;
    const FULLSCREEN_BUTTON = document.getElementById('fullscreen-button');
    FULLSCREEN_BUTTON.classList.toggle('is-fullscreen', IS_FULLSCREEN);
    FULLSCREEN_BUTTON.setAttribute('aria-pressed', IS_FULLSCREEN);
}
