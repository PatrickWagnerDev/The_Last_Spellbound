/**
 * Opens the level selection: updates the buttons by the progress and switches the start screen to it.
 * @returns {void}
 */
function openLevelChoice(){
    updateLevelButtons();
    setStartPhase(['is-ready'], 'is-levels');
    releaseFocus();
}

/**
 * Closes the level selection and goes back to the main menu.
 * @returns {void}
 */
function closeLevelChoice(){
    setStartPhase(['is-levels'], 'is-ready');
    releaseFocus();
}

/**
 * Disables the buttons of the levels that are not unlocked yet.
 * @returns {void}
 */
function updateLevelButtons(){
    document.querySelectorAll('.level-button').forEach(button => {
        button.disabled = !levelProgress.isUnlocked(Number(button.dataset.level));
    });
}
