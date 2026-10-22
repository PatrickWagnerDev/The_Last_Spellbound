class DrawableObject{
    x = 0;
    y = 0;
    img;
    width = 100;
    height = 100;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    currentFrame = 0;
    frameRow = 0;
    animationFps = 8;
    tickCount = 0;
    otherDirection = false;
    spriteFacesLeft = false;
    imageCache = {};
    currentPath;

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

    setSprite(path, count, fps){
        if(this.currentPath == path){
            return;
        }
        this.img = this.imageCache[path];
        this.frameCount = count;
        this.animationFps = fps;
        this.tickCount = 0;
        this.currentFrame = 0;
        this.currentPath = path;
    }

    nextFrame(){
        this.tickCount++;
        if(this.tickCount >= 60 / this.animationFps){
            this.tickCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    isFlipped(){
        return this.otherDirection !== this.spriteFacesLeft;
    }

    drawObject(ctx){
        let drawX = this.x;
        ctx.save();
        if(this.isFlipped()){
            this.flipContext(ctx);
            drawX = 0;
        }
        ctx.drawImage(
            this.img,
            this.currentFrame * this.frameWidth, this.frameRow * this.frameHeight, this.frameWidth, this.frameHeight,
            Math.round(drawX), Math.round(this.y), this.width, this.height
        );
        ctx.restore();
    }

    flipContext(ctx){
        ctx.translate(Math.round(this.x + this.width), 0);
        ctx.scale(-1, 1);
    }
}
