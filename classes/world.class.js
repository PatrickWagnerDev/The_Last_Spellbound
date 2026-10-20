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
    ctx;
    canvas;
    
    constructor(canvas){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw;
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.height, this.character.width);
        this.enemies.forEach(Enemy => {
            this.ctx.drawImage(Enemy.img, Enemy.x, Enemy.y, Enemy.height, Enemy.width)
        });
        this.trees.forEach(Tree => {
            this.ctx.drawImage(Tree.img, Tree.x, Tree.y, Tree.height, Tree.width)
        });
        let self = this;
        requestAnimationFrame(function(){
            self.draw();
        });
    }
}