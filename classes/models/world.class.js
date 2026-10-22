const IMAGE_HEALTH_EMPTY = './assets/image/09-ui/2 Bars/Healthbar_empty.png';
const IMAGE_HEALTH_FULL = './assets/image/09-ui/2 Bars/Healthbar_full.png';
const IMAGE_ENERGY_EMPTY = './assets/image/09-ui/2 Bars/Energybar_empty.png';
const IMAGE_ENERGY_FULL = './assets/image/09-ui/2 Bars/Energybar_full.png';

class World {
    level = new Level(LEVEL_ONE);
    character = new Character();
    keyIcon = this.createKeyIcon();
    energyBar = new StatusBar(IMAGE_ENERGY_EMPTY, IMAGE_ENERGY_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.energyBarY, { blink: false });
    healthBar = new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.statusBarY);
    ctx;
    canvas;
    keyboard;
    cameraX = 0;
    projectiles = [];
    showHitboxes = GAME_SETTINGS.debug.showHitboxes;

    constructor(canvas, keyboard){
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
        this.setWorld();
        this.character.placeAt(this.level.playerStart);
        this.cameraX = 0;
    }

    createKeyIcon(){
        const ICON = new DrawableObject();
        ICON.loadImage(IMAGE_KEY);
        ICON.frameWidth = 16;
        ICON.frameHeight = 16;
        ICON.width = 16 * GAME_SETTINGS.ui.keyIconScale;
        ICON.height = 16 * GAME_SETTINGS.ui.keyIconScale;
        ICON.y = GAME_SETTINGS.ui.keyIconY;
        return ICON;
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
        this.updateCamera();
        this.drawBackgroundObjects();
        this.drawScrollingObjects();
        this.drawStatusBars();
        requestAnimationFrame(() => this.drawWorld());
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
        });
        this.projectiles.forEach(projectile => projectile.drawHitbox(this.ctx, 'orange'));
    }

    drawStatusBars(){
        this.healthBar.setValue(this.character.health, this.character.maxHealth);
        this.healthBar.drawObject(this.ctx);
        this.energyBar.setValue(this.character.energy, this.character.maxEnergy);
        this.energyBar.drawObject(this.ctx);
        this.drawKeyIcons();
    }

    drawKeyIcons(){
        for(let keyIndex = 0; keyIndex < this.character.keyCount; keyIndex++){
            this.keyIcon.x = GAME_SETTINGS.ui.statusBarX + keyIndex * GAME_SETTINGS.ui.keyIconSpacing;
            this.keyIcon.drawObject(this.ctx);
        }
    }
}