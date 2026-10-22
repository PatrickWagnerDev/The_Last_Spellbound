class World {
    character = new Character();
    level = new Level(LEVEL_ONE);
    ctx;
    canvas;
    keyboard;
    cameraX = 0;
    showHitboxes = GAME_SETTINGS.debug.showHitboxes;

    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setWorld();
        this.drawWorld();
    }

    drawBackgroundObjects(){
        this.level.backgroundObjects.forEach(layer => {
            const LAYER_OFFSET = (this.cameraX * layer.parallaxFactor) % BACKGROUND_WIDTH;
            this.ctx.save();
            this.ctx.translate(-Math.round(LAYER_OFFSET), 0);
            layer.draw(this.ctx);
            this.ctx.restore();
        });
    }

    setWorld(){
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
    }

    updateCamera(){
        const TARGET_X = this.character.x + this.character.width / 2 - this.canvas.width / 2;
        const MAX_CAMERA_X = Math.max(this.level.width - this.canvas.width, 0);
        this.cameraX = Math.min(Math.max(TARGET_X, 0), MAX_CAMERA_X);
    }

    drawScrollingObjects(){
        this.ctx.save();
        this.ctx.translate(-Math.round(this.cameraX), 0);
        this.addObjectsToMap(this.level.tiles);
        this.character.draw(this.ctx);
        this.addObjectsToMap(this.level.enemies);
        this.drawHitboxes();
        this.ctx.restore();
    }

    drawWorld(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateCamera();
        this.drawBackgroundObjects();
        this.drawScrollingObjects();
        this.drawDebugHealth();
        requestAnimationFrame(() => this.drawWorld());
    }

    addObjectsToMap(objects){
        objects.forEach(object => object.draw(this.ctx));
    }

    drawHitboxes(){
        if(!this.showHitboxes){
            return;
        }
        this.character.drawHitbox(this.ctx, 'lime');
        this.level.enemies.forEach(enemy => {
            enemy.drawHitbox(this.ctx, enemy.isColliding(this.character) ? 'red' : 'lime');
        });
    }

    drawDebugHealth(){
        if(!this.showHitboxes){
            return;
        }
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('HP ' + this.character.health, 12, 24);
    }
}