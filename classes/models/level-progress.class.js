const CLEARED_STORAGE_KEY = 'spellbound-cleared-levels';

class LevelProgress {
    clearedLevels = this.readClearedLevels();

    readClearedLevels(){
        try {
            const SAVED_LEVELS = JSON.parse(localStorage.getItem(CLEARED_STORAGE_KEY));
            return Array.isArray(SAVED_LEVELS) ? SAVED_LEVELS : [];
        } catch {
            return [];
        }
    }

    saveClearedLevels(){
        try {
            localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(this.clearedLevels));
        } catch {
            return;
        }
    }

    markCleared(levelNumber){
        if(!this.clearedLevels.includes(levelNumber)){
            this.clearedLevels.push(levelNumber);
            this.saveClearedLevels();
        }
    }

    isUnlocked(levelNumber){
        return levelNumber === 1 || GAME_SETTINGS.debug.unlockAllLevels || this.clearedLevels.includes(levelNumber - 1);
    }

    areAllCleared(){
        return GAME_SETTINGS.debug.unlockAllLevels || LEVEL_LIST.every(level => this.clearedLevels.includes(level.levelNumber));
    }
}
