/**
 * Marks a character on the selection page: plays its effect if it was not marked yet, shows the mark on its
 * card and enables the Choose button.
 * @param {string} characterId - 'fireWizard' or 'lightningMage'.
 * @returns {void}
 */
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

/**
 * Moves the mark to the neighbor card with the arrow keys and stops at the first and the last card.
 * @param {KeyboardEvent} event - The key press.
 * @returns {void}
 */
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

/**
 * Confirms the choice: the marked character becomes the selected one, its sounds are set, the effect ends
 * and the start screen goes on to the main menu.
 * @returns {void}
 */
function chooseCharacter(){
    const START_SCREEN = document.getElementById('start-screen');
    selectedCharacter = START_SCREEN.dataset.marked;
    START_SCREEN.dataset.character = selectedCharacter;
    soundManager.setCharacter(selectedCharacter);
    stopCharacterEffect();
    setStartPhase(['is-choose'], 'is-settle');
}
