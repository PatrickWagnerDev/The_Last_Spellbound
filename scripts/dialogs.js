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
