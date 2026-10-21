class MovableObject{
    x = 120;
    y = 350;
    img;
    height = 150;
    width = 100;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 7;
    currentFrame = 0;
    frameRow = 0;
    animationFps = 8;
    tickCount = 0;
    speed = 5;
    otherDirection = false;
    imageCache = {};

    constructor(){
    }

    animate(){
        setInterval(() => this.nextFrame(), 1000 / 60);
    }

    nextFrame(){
        this.tickCount++;
        if(this.tickCount >= 60 / this.animationFps){
            this.tickCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    loadImage(path){
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(paths){
        paths.forEach(path => {
            const NEW_IMAGE = new Image();
            NEW_IMAGE.src = path;
            this.imageCache[path] = NEW_IMAGE;
        });
    }

    moveRight(){
        this.x += this.speed;
    }

    moveLeft(){
        this.x -= this.speed;
    }
}