const CLEARED_STORAGE_KEY = 'spellbound-cleared-levels';

/**
 * The progress of the player: which levels are cleared, which means their boss is defeated. It is saved in
 * the local storage of the browser. From it follows which levels can be chosen and whether all are cleared.
 */
class LevelProgress {
    clearedLevels = this.readClearedLevels();

    /**
     * Reads the cleared levels from the local storage. If there is nothing valid, or the storage is blocked,
     * the result is an empty list.
     * @returns {number[]} The numbers of the cleared levels.
     */
    readClearedLevels(){
        try {
            const SAVED_LEVELS = JSON.parse(localStorage.getItem(CLEARED_STORAGE_KEY));
            return Array.isArray(SAVED_LEVELS) ? SAVED_LEVELS : [];
        } catch {
            return [];
        }
    }

    /**
     * Saves the cleared levels in the local storage. A blocked storage is ignored.
     * @returns {void}
     */
    saveClearedLevels(){
        try {
            localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(this.clearedLevels));
        } catch {
            return;
        }
    }

    /**
     * Marks a level as cleared and saves it, if it was not cleared before.
     * @param {number} levelNumber - Number of the level.
     * @returns {void}
     */
    markCleared(levelNumber){
        if(!this.clearedLevels.includes(levelNumber)){
            this.clearedLevels.push(levelNumber);
            this.saveClearedLevels();
        }
    }

    /**
     * Tells whether a level can be chosen: the first one always, the others when the level before is cleared,
     * and all of them with the debug setting.
     * @param {number} levelNumber - Number of the level.
     * @returns {boolean} True if the level is unlocked.
     */
    isUnlocked(levelNumber){
        return levelNumber === 1 || GAME_SETTINGS.debug.unlockAllLevels || this.clearedLevels.includes(levelNumber - 1);
    }

    /**
     * Tells whether every level is cleared, or the debug setting is on. The main menu then shows the Boss Killer coin.
     * @returns {boolean} True if all levels are cleared.
     */
    areAllCleared(){
        return GAME_SETTINGS.debug.unlockAllLevels || LEVEL_LIST.every(level => this.clearedLevels.includes(level.levelNumber));
    }
}
