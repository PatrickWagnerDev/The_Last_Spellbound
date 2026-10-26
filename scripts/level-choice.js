function openLevelChoice(){
    updateLevelButtons();
    setStartPhase(['is-ready'], 'is-levels');
    releaseFocus();
}

function closeLevelChoice(){
    setStartPhase(['is-levels'], 'is-ready');
    releaseFocus();
}

function updateLevelButtons(){
    document.querySelectorAll('.level-button').forEach(button => {
        button.disabled = !levelProgress.isUnlocked(Number(button.dataset.level));
    });
}
