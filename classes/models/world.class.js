class World {
    character = new Character();
    level = new Level(LEVEL_ONE);
    ctx;
    canvas;
    keyboard;
    cameraX = 0;

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
            this.addToMap(layer);
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
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.ctx.restore();
    }

    drawWorld(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateCamera();
        this.drawBackgroundObjects();
        this.drawScrollingObjects();
        requestAnimationFrame(() => this.drawWorld());
    }

    addObjectsToMap(objects){
        objects.forEach(object => {
            this.addToMap(object);
        });
    }

    addToMap(drawable){
        let drawX = drawable.x;
        this.ctx.save();
        if(drawable.isFlipped()){
            this.flipContext(drawable);
            drawX = 0;
        }
        this.ctx.drawImage(
            drawable.img,
            drawable.currentFrame * drawable.frameWidth, drawable.frameRow * drawable.frameHeight, drawable.frameWidth, drawable.frameHeight,
            Math.round(drawX), Math.round(drawable.y), drawable.width, drawable.height
        );
        this.ctx.restore();
    }

    flipContext(drawable){
        this.ctx.translate(Math.round(drawable.x + drawable.width), 0);
        this.ctx.scale(-1, 1);
    }
}