const VISIBLE_MARGIN = 128;

/**
 * The running world of a level. It holds the level, the character, the projectiles, the display, the camera
 * and the portal transition. It draws everything again for every frame, checks for the end of the game and
 * knows the pause and the debug displays.
 */
class World {
    level;
    levelData;
    restartLevelData;
    frameRequest;
    onGameEnd;
    isGameEnded = false;
    hud = new Hud(this);
    ctx;
    canvas;
    keyboard;
    cameraX = 0;
    projectiles = [];
    isPaused = false;
    transition = null;
    showHitboxes = GAME_SETTINGS.debug.showHitboxes;

    /**
     * Builds the world: the level, the character at the start point, the links between all objects and the
     * drawing loop.
     * @param {HTMLCanvasElement} canvas - The game canvas.
     * @param {Keyboard} keyboard - The state of the keys.
     * @param {object} levelData - Data of the level part to build.
     * @param {function(boolean): void} onGameEnd - Called when the game ends, with true for a victory.
     * @param {string} characterId - 'fireWizard' or 'lightningMage'.
     */
    constructor(canvas, keyboard, levelData, onGameEnd, characterId){
        this.onGameEnd = onGameEnd;
        this.setLevel(levelData);
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.character = new Character(characterId);
        this.character.placeAt(this.level.playerStart);
        this.setWorld();
        this.drawWorld();
    }

    /**
     * Draws the background layers with the parallax effect: every layer is shifted by the camera position
     * times its own factor, so far layers move slowly and near layers move fast.
     * @returns {void}
     */
    drawBackgroundObjects(){
        this.level.backgroundObjects.forEach(layer => {
            const LAYER_OFFSET = (this.cameraX * layer.parallaxFactor) % BACKGROUND_WIDTH;
            this.ctx.save();
            this.ctx.translate(-Math.round(LAYER_OFFSET), 0);
            layer.drawObject(this.ctx);
            this.ctx.restore();
        });
    }

    /**
     * Gives the character, the enemies and the items a link to this world.
     * @returns {void}
     */
    setWorld(){
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
        this.level.items.forEach(item => item.world = this);
    }

    /**
     * Adds an item to the running level and links it to the world.
     * @param {LevelItem} item - The item to add.
     * @returns {void}
     */
    addItem(item){
        item.world = this;
        this.level.items.push(item);
    }

    /**
     * Builds the level from its data and remembers which data a restart starts with.
     * @param {object} levelData - Data of the level part.
     * @returns {void}
     */
    setLevel(levelData){
        this.levelData = levelData;
        this.level = new Level(levelData);
        this.restartLevelData = levelData.restartLevel ?? levelData;
    }

    /**
     * Stops and removes all projectiles.
     * @returns {void}
     */
    clearProjectiles(){
        this.projectiles.forEach(projectile => projectile.stopAnimation());
        this.projectiles = [];
    }

    /**
     * Finds the boss of the level.
     * @returns {Boss|undefined} The boss, or undefined if the level part has none.
     */
    findBoss(){
        return this.level.enemies.find(enemy => enemy.isBoss);
    }

    /**
     * Switches to a new level part: stops the old objects and projectiles, builds the new level, links
     * everything, puts the character on the new start and resets the camera.
     * @param {object} levelData - Data of the new level part.
     * @returns {void}
     */
    loadLevel(levelData){
        this.level.stopAll();
        this.clearProjectiles();
        this.setLevel(levelData);
        this.setWorld();
        this.character.placeAt(this.level.playerStart);
        this.cameraX = 0;
    }

    /**
     * Stops the world completely: the drawing loop and the timers of the level, the character, the
     * projectiles, the transition and the display.
     * @returns {void}
     */
    stopWorld(){
        cancelAnimationFrame(this.frameRequest);
        this.level.stopAll();
        this.character.stopAnimation();
        this.clearProjectiles();
        this.transition?.stopAnimation();
        this.hud.stopTimer();
    }

    /**
     * Starts the portal transition: pauses the game and creates the transition at the portal.
     * @param {Portal} portal - The portal the character entered.
     * @returns {void}
     */
    startTransition(portal){
        this.isPaused = true;
        this.transition = new PortalTransition(this, portal.centerX - this.cameraX, portal.centerY, portal.width, this.levelData.getNextLevel());
    }

    /**
     * Checks whether the game has ended and ends it: game over when the death of the character has finished,
     * victory when the character is alive and the boss is defeated.
     * @returns {void}
     */
    checkGameEnd(){
        if(this.isGameEnded){
            return;
        }
        if(this.character.hasDeathFinished()){
            this.endGame(false);
        } else if(!this.character.isDead() && this.hasBossDefeated()){
            this.endGame(true);
        }
    }

    /**
     * Tells whether the boss is defeated, which means it has finished dying.
     * @returns {boolean} True if there is a boss and its death has finished.
     */
    hasBossDefeated(){
        const BOSS_ENEMY = this.findBoss();
        return BOSS_ENEMY?.hasDeathFinished() ?? false;
    }

    /**
     * Ends the game: after a victory the projectiles are removed and the keys are released, then the end
     * function of the page is called.
     * @param {boolean} isVictory - True for a victory, false for game over.
     * @returns {void}
     */
    endGame(isVictory){
        this.isGameEnded = true;
        if(isVictory){
            this.clearProjectiles();
            this.keyboard = new Keyboard();
        }
        this.onGameEnd?.(isVictory);
    }

    /**
     * Switches the pause on or off, not during the portal transition and not after the end of the game.
     * @returns {void}
     */
    togglePause(){
        if(!this.transition && !this.isGameEnded){
            this.isPaused = !this.isPaused;
        }
    }

    /**
     * Tells whether the pause chosen by the player is active, not the stop during a transition or after the end.
     * @returns {boolean} True if the pause menu has to be shown.
     */
    isPauseActive(){
        return this.isPaused && !this.transition && !this.isGameEnded;
    }

    /**
     * Ends the portal transition: stops and removes it and lets the game run again.
     * @returns {void}
     */
    endTransition(){
        this.transition.stopAnimation();
        this.transition = null;
        this.isPaused = false;
    }

    /**
     * Darkens the whole canvas with a transparent black layer while the pause is active.
     * @returns {void}
     */
    drawPauseOverlay(){
        if(this.isPauseActive()){
            this.ctx.fillStyle = `rgba(0, 0, 0, ${GAME_SETTINGS.ui.pauseOverlayAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Draws the portal transition if one is running.
     * @returns {void}
     */
    drawTransition(){
        if(this.transition){
            this.transition.drawObject(this.ctx);
        }
    }

    /**
     * Adds a projectile to the world and links it to it.
     * @param {Projectile} projectile - The projectile to add.
     * @returns {void}
     */
    addProjectile(projectile){
        projectile.world = this;
        this.projectiles.push(projectile);
    }

    /**
     * Takes a projectile out of the list of the world.
     * @param {Projectile} projectile - The projectile to remove.
     * @returns {void}
     */
    removeProjectile(projectile){
        this.projectiles = this.projectiles.filter(other => other !== projectile);
    }

    /**
     * Centers the camera on the character, but never beyond the start or the end of the level.
     * @returns {void}
     */
    updateCamera(){
        const TARGET_X = this.character.x + this.character.width / 2 - this.canvas.width / 2;
        const MAX_CAMERA_X = Math.max(this.level.width - this.canvas.width, 0);
        this.cameraX = clampValue(TARGET_X, 0, MAX_CAMERA_X);
    }

    /**
     * Draws everything that scrolls with the camera, from back to front: tiles, items, character, enemies,
     * projectiles and the debug outlines.
     * @returns {void}
     */
    drawScrollingObjects(){
        this.ctx.save();
        this.ctx.translate(-Math.round(this.cameraX), 0);
        this.addObjectsToMap(this.level.tiles);
        this.addObjectsToMap(this.level.items);
        this.character.drawObject(this.ctx);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.projectiles);
        this.drawHitboxes();
        this.ctx.restore();
    }

    /**
     * Draws one frame: clears the canvas, checks for the end of the game, moves the camera, draws background,
     * objects, display, pause layer and transition, and asks the browser for the next frame.
     * @returns {void}
     */
    drawWorld(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.checkGameEnd();
        this.updateCamera();
        this.drawBackgroundObjects();
        this.drawScrollingObjects();
        this.hud.drawHud(this.ctx);
        this.drawPauseOverlay();
        this.drawTransition();
        this.frameRequest = requestAnimationFrame(() => this.drawWorld());
    }

    /**
     * Tells whether an object is inside the visible area, which is the width of the canvas plus a margin.
     * @param {DrawableObject} object - The object to check.
     * @returns {boolean} True if it has to be drawn.
     */
    isVisible(object){
        return object.x + object.width + VISIBLE_MARGIN > this.cameraX && object.x - VISIBLE_MARGIN < this.cameraX + this.canvas.width;
    }

    /**
     * Draws the visible objects of a list.
     * @param {DrawableObject[]} objects - The objects to draw.
     * @returns {void}
     */
    addObjectsToMap(objects){
        objects.filter(object => this.isVisible(object)).forEach(object => object.drawObject(this.ctx));
    }

    /**
     * Draws the hitboxes of the character, the enemies and the projectiles, only while the debug setting is on.
     * @returns {void}
     */
    drawHitboxes(){
        if(!this.showHitboxes){
            return;
        }
        this.character.drawHitbox(this.ctx, 'lime');
        this.character.drawRect(this.ctx, this.character.getContactRect(), 'cyan');
        this.character.drawAttackBox(this.ctx);
        this.level.enemies.forEach(enemy => {
            enemy.drawHitbox(this.ctx, 'lime');
            enemy.drawHurtboxes(this.ctx, enemy.touchesRect(this.character.getContactRect()) ? 'red' : 'cyan');
            enemy.drawDebugArea(this.ctx);
        });
        this.projectiles.forEach(projectile => projectile.drawHitbox(this.ctx, 'orange'));
    }

}