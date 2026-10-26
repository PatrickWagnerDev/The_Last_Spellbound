const VISIBLE_MARGIN = 128;

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

    drawBackgroundObjects(){
        this.level.backgroundObjects.forEach(layer => {
            const LAYER_OFFSET = (this.cameraX * layer.parallaxFactor) % BACKGROUND_WIDTH;
            this.ctx.save();
            this.ctx.translate(-Math.round(LAYER_OFFSET), 0);
            layer.drawObject(this.ctx);
            this.ctx.restore();
        });
    }

    setWorld(){
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
        this.level.items.forEach(item => item.world = this);
    }

    addItem(item){
        item.world = this;
        this.level.items.push(item);
    }

    setLevel(levelData){
        this.levelData = levelData;
        this.level = new Level(levelData);
        this.restartLevelData = levelData.restartLevel ?? levelData;
    }

    clearProjectiles(){
        this.projectiles.forEach(projectile => projectile.stopAnimation());
        this.projectiles = [];
    }

    findBoss(){
        return this.level.enemies.find(enemy => enemy.isBoss);
    }

    loadLevel(levelData){
        this.level.stopAll();
        this.clearProjectiles();
        this.setLevel(levelData);
        this.setWorld();
        this.character.placeAt(this.level.playerStart);
        this.cameraX = 0;
    }

    stopWorld(){
        cancelAnimationFrame(this.frameRequest);
        this.level.stopAll();
        this.character.stopAnimation();
        this.clearProjectiles();
        this.transition?.stopAnimation();
        this.hud.stopTimer();
    }

    startTransition(portal){
        this.isPaused = true;
        this.transition = new PortalTransition(this, portal.centerX - this.cameraX, portal.centerY, portal.width, this.levelData.getNextLevel());
    }

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

    hasBossDefeated(){
        const BOSS_ENEMY = this.findBoss();
        return BOSS_ENEMY?.hasDeathFinished() ?? false;
    }

    endGame(isVictory){
        this.isGameEnded = true;
        if(isVictory){
            this.clearProjectiles();
            this.keyboard = new Keyboard();
        }
        this.onGameEnd?.(isVictory);
    }

    togglePause(){
        if(!this.transition && !this.isGameEnded){
            this.isPaused = !this.isPaused;
        }
    }

    isPauseActive(){
        return this.isPaused && !this.transition && !this.isGameEnded;
    }

    endTransition(){
        this.transition.stopAnimation();
        this.transition = null;
        this.isPaused = false;
    }

    drawPauseOverlay(){
        if(this.isPauseActive()){
            this.ctx.fillStyle = `rgba(0, 0, 0, ${GAME_SETTINGS.ui.pauseOverlayAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawTransition(){
        if(this.transition){
            this.transition.drawObject(this.ctx);
        }
    }

    addProjectile(projectile){
        projectile.world = this;
        this.projectiles.push(projectile);
    }

    removeProjectile(projectile){
        this.projectiles = this.projectiles.filter(other => other !== projectile);
    }

    updateCamera(){
        const TARGET_X = this.character.x + this.character.width / 2 - this.canvas.width / 2;
        const MAX_CAMERA_X = Math.max(this.level.width - this.canvas.width, 0);
        this.cameraX = clampValue(TARGET_X, 0, MAX_CAMERA_X);
    }

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

    isVisible(object){
        return object.x + object.width + VISIBLE_MARGIN > this.cameraX && object.x - VISIBLE_MARGIN < this.cameraX + this.canvas.width;
    }

    addObjectsToMap(objects){
        objects.filter(object => this.isVisible(object)).forEach(object => object.drawObject(this.ctx));
    }

    drawHitboxes(){
        if(!this.showHitboxes){
            return;
        }
        this.character.drawHitbox(this.ctx, 'lime');
        this.character.drawAttackBox(this.ctx);
        this.level.enemies.forEach(enemy => {
            enemy.drawHitbox(this.ctx, enemy.isColliding(this.character) ? 'red' : 'lime');
            enemy.drawDebugArea(this.ctx);
        });
        this.projectiles.forEach(projectile => projectile.drawHitbox(this.ctx, 'orange'));
    }

}