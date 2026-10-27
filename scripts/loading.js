const LOADING_HINT_MS = 20000;

const UI_IMAGE_PATHS = [
    './assets/image/09-ui/canvas-frame.png',
    './assets/image/09-ui/Window.png',
    './assets/image/09-ui/3 Icons/Icons_01.png',
    './assets/image/09-ui/3 Icons/Icons_14.png',
    './assets/image/09-ui/3 Icons/Icons_15.png',
    './assets/image/09-ui/3 Icons/Icons_22.png',
    './assets/image/09-ui/3 Icons/Icons_23.png',
    './assets/image/09-ui/3 Icons/Icons_25.png',
    './assets/image/09-ui/3 Icons/Icons_29.png',
    './assets/image/09-ui/3 Icons/Icons_31.png',
    './assets/image/09-ui/3 Icons/Icons_35.png',
    './assets/image/09-ui/3 Icons/Icons_37.png',
    './assets/image/09-ui/3 Icons/Icons_45.png',
    './assets/image/09-ui/3 Icons/Icons_55.png',
    './assets/image/09-ui/3 Icons/Icons_63.png',
    './assets/image/09-ui/3 Icons/Icons_64.png',
    './assets/icons/Fullscreen_exit.png',
    './assets/image/06-tileset/Objects_Animated/Golden_Key.png',
    './assets/image/06-tileset/Objects_Animated/Coin.png',
    './assets/image/06-tileset/Objects/Food/Pizza.png',
    './assets/image/06-tileset/Objects/Food/Donut.png'
];

const GAME_IMAGE_PATHS = [
    IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, IMAGE_ENERGY_EMPTY, IMAGE_ENERGY_FULL, IMAGE_KEY, IMAGE_PICKUP, IMAGE_CHEST,
    IMAGE_BOSS_RAY, BOSS_FIREBALL.path, MAGE_FIREBALL.path, ...IMAGES_PORTAL
];

/**
 * Returns the parts of a level that belong together: the level and, if there is one, its boss part.
 * @param {object} levelData - Data of the level part to start.
 * @returns {object[]} The data of the level and of its boss part.
 */
function getLevelParts(levelData){
    return [levelData, levelData.getNextLevel?.()].filter(Boolean);
}

/**
 * Builds a level for each part, which makes the browser request all their pictures, and stops the objects
 * at once.
 * @param {object} levelData - Data of the level part to start.
 * @returns {Level[]} The built levels.
 */
function buildPreviewLevels(levelData){
    const PREVIEW_LEVELS = getLevelParts(levelData).map(partData => new Level(partData));
    PREVIEW_LEVELS.forEach(level => level.stopAll());
    return PREVIEW_LEVELS;
}

/**
 * Collects the names of the music a level start needs: the music of every part and of the bosses in them.
 * @param {object} levelData - Data of the level part to start.
 * @param {Level[]} previewLevels - The built levels.
 * @returns {string[]} The names of the music pieces, without duplicates.
 */
function getMusicNames(levelData, previewLevels){
    const BOSS_MUSIC_NAMES = previewLevels.flatMap(level => level.enemies.map(enemy => enemy.musicName));
    const LEVEL_MUSIC_NAMES = getLevelParts(levelData).map(partData => partData.music);
    return [...new Set([...LEVEL_MUSIC_NAMES, ...BOSS_MUSIC_NAMES])].filter(Boolean);
}

/**
 * Preloads the pictures that do not come from the level: the menus, the display, the projectiles, the portal
 * and the chosen character.
 * @returns {void}
 */
function preloadStaticImages(){
    const CHARACTER_PATHS = Object.values(CHARACTER_SPRITES[selectedCharacter]).map(sprite => sprite.path);
    [...UI_IMAGE_PATHS, ...GAME_IMAGE_PATHS, ...CHARACTER_PATHS].forEach(createImage);
}

/**
 * Loads everything for a level start: shows the loading screen, requests all pictures and sounds and waits
 * for them. After the waiting time the hint to reload the page appears.
 * @param {object} levelData - Data of the level part to start.
 * @returns {Promise<void>} Resolves when everything is loaded.
 */
function loadLevelAssets(levelData){
    const HINT_TIMER = setTimeout(() => toggleLoadingHint(true), LOADING_HINT_MS);
    showLoadingScreen();
    const PREVIEW_LEVELS = buildPreviewLevels(levelData);
    preloadStaticImages();
    const AUDIO_LOAD = soundManager.preloadAudio(getMusicNames(levelData, PREVIEW_LEVELS));
    return Promise.all([waitForImages(), AUDIO_LOAD]).then(() => clearTimeout(HINT_TIMER));
}

/**
 * Loads everything for a level, then runs the function that starts the world and hides the loading screen.
 * @param {object} levelData - Data of the level part to start.
 * @param {function(): void} startWorld - Builds the world, runs when everything is loaded.
 * @returns {Promise<void>} Resolves after the world was started.
 */
function loadThenStart(levelData, startWorld){
    return loadLevelAssets(levelData).then(() => {
        startWorld();
        hideLoadingScreen();
    });
}

/**
 * Shows the loading screen.
 * @returns {void}
 */
function showLoadingScreen(){
    document.getElementById('loading-screen').classList.add('is-open');
}

/**
 * Hides the loading screen and its hint.
 * @returns {void}
 */
function hideLoadingScreen(){
    document.getElementById('loading-screen').classList.remove('is-open');
    toggleLoadingHint(false);
}

/**
 * Shows or hides the hint to reload the page.
 * @param {boolean} isVisible - True to show the hint.
 * @returns {void}
 */
function toggleLoadingHint(isVisible){
    document.getElementById('loading-hint').hidden = !isVisible;
}
