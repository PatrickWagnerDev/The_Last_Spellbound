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

function chooseCharacter(){
    const START_SCREEN = document.getElementById('start-screen');
    selectedCharacter = START_SCREEN.dataset.marked;
    START_SCREEN.dataset.character = selectedCharacter;
    soundManager.setCharacter(selectedCharacter);
    stopCharacterEffect();
    setStartPhase(['is-choose'], 'is-settle');
}
