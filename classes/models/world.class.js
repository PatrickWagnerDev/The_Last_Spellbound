const IMAGE_HEALTH_EMPTY = './assets/image/09-ui/2 Bars/Healthbar_empty.png';
const IMAGE_HEALTH_FULL = './assets/image/09-ui/2 Bars/Healthbar_full.png';
const IMAGE_ENERGY_EMPTY = './assets/image/09-ui/2 Bars/Energybar_empty.png';
const IMAGE_ENERGY_FULL = './assets/image/09-ui/2 Bars/Energybar_full.png';

class World {
    level;
    restartLevelData;
    frameRequest;
    onGameEnd;
    isGameEnded = false;
    character = new Character();
    keyIcon = this.createKeyIcon();
    energyBar = new StatusBar(IMAGE_ENERGY_EMPTY, IMAGE_ENERGY_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.energyBarY, { blink: false });
    healthBar = new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.statusBarY);
    bossBars = this.createBossBars();
    ctx;
    canvas;
    keyboard;
    cameraX = 0;
    projectiles = [];
    isPaused = false;
    transition = null;
    showHitboxes = GAME_SETTINGS.debug.showHitboxes;

    constructor(canvas, keyboard, levelData, onGameEnd){
        this.onGameEnd = onGameEnd;
        this.level = new Level(levelData);
        this.restartLevelData = levelData.restartLevel ?? levelData;
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
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

    loadLevel(levelData){
        this.level.stopAll();
        this.projectiles.forEach(projectile => projectile.stopAnimation());
        this.projectiles = [];
        this.level = new Level(levelData);
        this.restartLevelData = levelData.restartLevel ?? levelData;
        this.setWorld();
        this.character.placeAt(this.level.playerStart);
        this.cameraX = 0;
    }

    stopWorld(){
        cancelAnimationFrame(this.frameRequest);
        this.level.stopAll();
        this.character.stopAnimation();
        this.projectiles.forEach(projectile => projectile.stopAnimation());
        this.transition?.stopAnimation();
        [this.healthBar, this.energyBar, ...this.bossBars].forEach(bar => bar.stopBlink());
    }

    startTransition(portal, levelData){
        this.isPaused = true;
        this.transition = new PortalTransition(this, portal.centerX - this.cameraX, portal.centerY, portal.width, levelData);
    }

    checkGameEnd(){
        if(this.isGameEnded){
            return;
        }
        if(this.character.hasDeathFinished()){
            this.endGame(false);
        } else if(this.hasBossDefeated()){
            this.endGame(true);
        }
    }

    hasBossDefeated(){
        const BOSS_ENEMY = this.level.enemies.find(enemy => enemy instanceof MageBoss);
        return BOSS_ENEMY?.hasDeathFinished() ?? false;
    }

    endGame(isVictory){
        this.isGameEnded = true;
        if(isVictory){
            this.projectiles.forEach(projectile => projectile.stopAnimation());
            this.projectiles = [];
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

    createKeyIcon(){
        const KEY_ICON = new DrawableObject();
        KEY_ICON.loadImage(IMAGE_KEY);
        KEY_ICON.frameWidth = 16;
        KEY_ICON.frameHeight = 16;
        KEY_ICON.width = 16 * GAME_SETTINGS.ui.keyIconScale;
        KEY_ICON.height = 16 * GAME_SETTINGS.ui.keyIconScale;
        KEY_ICON.y = GAME_SETTINGS.ui.keyIconY;
        return KEY_ICON;
    }

    addProjectile(projectile){
        projectile.world = this;
        this.projectiles.push(projectile);
    }

    removeProjectile(projectile){
        this.projectiles = this.projectiles.filter(other => other != projectile);
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
        this.drawStatusBars();
        this.drawPauseOverlay();
        this.drawTransition();
        this.frameRequest = requestAnimationFrame(() => this.drawWorld());
    }

    addObjectsToMap(objects){
        objects.forEach(object => object.drawObject(this.ctx));
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

    drawStatusBars(){
        if(this.isGameEnded){
            return;
        }
        this.healthBar.setValue(this.character.health, this.character.maxHealth);
        this.healthBar.drawObject(this.ctx);
        this.energyBar.setValue(this.character.energy, this.character.maxEnergy);
        this.energyBar.drawObject(this.ctx);
        this.drawKeyIcons();
        this.drawBossBars();
    }

    createBossBars(){
        const BAR_COUNT = GAME_SETTINGS.mageBoss.maxHealth / GAME_SETTINGS.ui.bossBarHealthPerBar;
        const BAR_OPTIONS = { scale: GAME_SETTINGS.ui.bossBarScale };
        return Array.from({ length: BAR_COUNT }, () => new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, 0, 0, BAR_OPTIONS));
    }

    drawBossBars(){
        const BOSS_ENEMY = this.level.enemies.find(enemy => enemy instanceof MageBoss);
        if(!BOSS_ENEMY || (BOSS_ENEMY.state == 'wait' && BOSS_ENEMY.health == BOSS_ENEMY.maxHealth)){
            return;
        }
        const BAR_STEP = this.bossBars[0].width + GAME_SETTINGS.ui.bossBarGap;
        const START_X = (this.canvas.width - (this.bossBars.length * BAR_STEP - GAME_SETTINGS.ui.bossBarGap)) / 2;
        this.bossBars.forEach((bar, barIndex) => this.drawBossBar(bar, BOSS_ENEMY, START_X + barIndex * BAR_STEP, barIndex));
    }

    drawBossBar(bar, boss, barX, barIndex){
        const HEALTH_PER_BAR = GAME_SETTINGS.ui.bossBarHealthPerBar;
        bar.x = barX;
        bar.y = this.canvas.height - bar.height - GAME_SETTINGS.ui.bossBarMargin;
        bar.setValue(clampValue(boss.health - barIndex * HEALTH_PER_BAR, 0, HEALTH_PER_BAR), HEALTH_PER_BAR);
        bar.drawObject(this.ctx);
    }

    drawKeyIcons(){
        for(let keyIndex = 0; keyIndex < this.character.keyCount; keyIndex++){
            this.keyIcon.x = GAME_SETTINGS.ui.statusBarX + keyIndex * GAME_SETTINGS.ui.keyIconSpacing;
            this.keyIcon.drawObject(this.ctx);
        }
    }
}