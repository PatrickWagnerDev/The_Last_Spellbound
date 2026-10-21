class World {
    character = new Character();
    level = new Level(LEVEL_ONE_MAP);
    enemies = [
        new Enemy(),
        new Enemy(),
        new Enemy()
    ]
    trees = [
        new Trees()
    ];
    backgroundObjects = [
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees3.png'),
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees2.png'),
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees1.png'),
    ];
    ctx;
    canvas;
    keyboard;

    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setWorld();
        this.draw();
    }

    setWorld(){
        this.character.world = this;
        this.enemies.forEach(enemy => enemy.world = this);
    }

    draw(){
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.trees);
        this.addObjectsToMap(this.level.tiles);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
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