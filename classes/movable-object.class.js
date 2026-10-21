const GRAVITY = 0.5;

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
    speedY = 0;
    onGround = false;
    otherDirection = false;
    spriteFacesLeft = false;
    imageCache = {};
    currentPath;
    world;

    constructor(){
    }

    animate(){
        setInterval(() => {
            this.update();
            this.nextFrame();
        }, 1000 / 60);
    }

    update(){
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

    isFlipped(){
        return this.otherDirection !== this.spriteFacesLeft;
    }

    moveForward(){
        if(this.otherDirection){
            this.moveLeft();
        } else {
            this.moveRight();
        }
    }

    applyGravity(){
        const PREVIOUS_FEET = this.y + this.height;
        this.y -= this.speedY;
        this.onGround = this.speedY <= 0 && this.landOnTile(PREVIOUS_FEET);
        if(!this.onGround){
            this.speedY -= GRAVITY;
        }
    }

    landOnTile(previousFeet){
        const FEET_X = this.x + this.width / 2;
        const FEET_Y = this.y + this.height;
        const TILE_TOP = Math.floor(FEET_Y / TILE_SIZE) * TILE_SIZE;
        if(!this.world.level.isWalkableAt(FEET_X, FEET_Y) || previousFeet > TILE_TOP){
            return false;
        }
        this.y = TILE_TOP - this.height;
        this.speedY = 0;
        return true;
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
}
