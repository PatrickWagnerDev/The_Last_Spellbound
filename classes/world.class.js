class World {
    character = new Character();
    level = new Level(LEVEL_ONE_MAP);
    enemies = [
        new Enemy(),
        new Enemy(),
        new Enemy()
    ]
    backgroundObjects = [];
    ctx;
    canvas;
    keyboard;
    cameraX = 0;

    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.buildBackgrounds();
        this.setWorld();
        this.draw();
    }

    buildBackgrounds(){
        BACKGROUND_LAYERS.forEach(layer => {
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, 0));
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, BACKGROUND_WIDTH));
        });
    }

    drawBackgroundObjects(){
        this.backgroundObjects.forEach(layer => {
            const OFFSET = (this.cameraX * layer.parallaxFactor) % BACKGROUND_WIDTH;
            this.ctx.save();
            this.ctx.translate(-Math.round(OFFSET), 0);
            this.addToMap(layer);
            this.ctx.restore();
        });
    }

    setWorld(){
        this.character.world = this;
        this.enemies.forEach(enemy => enemy.world = this);
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
        this.addObjectsToMap(this.enemies);
        this.ctx.restore();
    }

    draw(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateCamera();
        this.drawBackgroundObjects();
        this.drawScrollingObjects();
        let self = this;
        requestAnimationFrame(function(){
            self.draw();
        });
    }

    addObjectsToMap(objects){
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo){
        let drawX = mo.x;
        this.ctx.save();
        if(mo.isFlipped()){
            this.flipContext(mo);
            drawX = 0;
        }
        this.ctx.drawImage(
            mo.img,
            mo.currentFrame * mo.frameWidth, mo.frameRow * mo.frameHeight, mo.frameWidth, mo.frameHeight,
            Math.round(drawX), Math.round(mo.y), mo.width, mo.height
        );
        this.ctx.restore();
    }

    flipContext(mo){
        this.ctx.translate(Math.round(mo.x + mo.width), 0);
        this.ctx.scale(-1, 1);
    }
}