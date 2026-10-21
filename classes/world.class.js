class World {
    character = new Character();
    level = new Level(LEVEL_ONE_MAP);
    enemies = [
        new Enemy(),
        new Enemy(),
        new Enemy()
    ]
    trees = [];
    backgroundObjects = [
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees3.png'),
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees2.png'),
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees1.png'),
    ];
    ctx;
    canvas;
    keyboard;
    cameraX = 0;

    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.buildTrees();
        this.setWorld();
        this.draw();
    }

    buildTrees(){
        const COPY_COUNT = Math.ceil(this.level.width / TREES_WIDTH);
        for(let copyIndex = 0; copyIndex < COPY_COUNT; copyIndex++){
            this.trees.push(new Trees(copyIndex * TREES_WIDTH));
        }
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
        this.addObjectsToMap(this.trees);
        this.addObjectsToMap(this.level.tiles);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
        this.ctx.restore();
    }

    draw(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateCamera();
        this.addObjectsToMap(this.backgroundObjects);
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