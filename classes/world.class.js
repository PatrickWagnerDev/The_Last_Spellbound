class World {
    character = new Character();
    enemies = [
        new Enemy(),
        new Enemy(),
        new Enemy()
    ]
    trees = [
        new Trees()
    ];
    backgroundObjects = [
        new BackgroundObject('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees3.png')
    ];
    ctx;
    canvas;
    
    constructor(canvas){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw;
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.trees);
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
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.height, mo.width)
    }
}