/**
 * Opens a dialog on its first page.
 * @param {string} dialogId - Id of the dialog element, for example 'controls-screen'.
 * @returns {void}
 */
function openDialog(dialogId){
    const DIALOG_SCREEN = document.getElementById(dialogId);
    DIALOG_SCREEN.classList.remove('is-second-page');
    DIALOG_SCREEN.classList.add('is-open');
    releaseFocus();
}

/**
 * Switches the controls dialog between its first and its second page.
 * @returns {void}
 */
function toggleControlsPage(){
    document.getElementById('controls-screen').classList.toggle('is-second-page');
    releaseFocus();
}

/**
 * Closes all open dialogs.
 * @returns {void}
 */
function hideDialogs(){
    document.querySelectorAll('.dialog-screen.is-open').forEach(dialog => dialog.classList.remove('is-open'));
}

/**
 * Closes the dialogs after a click on the area around the window or on the close button.
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
function closeDialog(event){
    if(event.target === event.currentTarget || event.target.closest('.close-button')){
        hideDialogs();
    }
}

/**
 * Tells whether a dialog is open.
 * @returns {boolean} True if at least one dialog is open.
 */
function isDialogOpen(){
    return document.querySelector('.dialog-screen.is-open') !== null;
}
