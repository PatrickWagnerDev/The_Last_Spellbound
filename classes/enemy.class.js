const IMAGE_BEAR_WALK = './assets/image/craftpix-987745-tiny-monsters-pixel-art-pack/1 Bear/Walk.png';

class Enemy extends MovableObject {
    width = 80;
    height = 80;
    frameWidth = 40;
    frameHeight = 40;
    frameCount = 6;
    speed = 0.5;
    spriteFacesLeft = true;

    constructor(column, row){
        super().loadImage(IMAGE_BEAR_WALK);
        this.x = column * TILE_SIZE;
        this.y = row * TILE_SIZE - this.height;
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateObject(){
        this.patrol();
        this.applyGravity();
    }

    patrol(){
        if(!this.onGround){
            return;
        }
        if(this.shouldTurn()){
            this.otherDirection = !this.otherDirection;
        }
        this.moveForward();
    }

    shouldTurn(){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        const PROBE_X = this.x + this.width / 2 + STEP_DIRECTION * this.width / 2;
        const PROBE_Y = this.y + this.height + 1;
        const IS_OUT_OF_BOUNDS = PROBE_X < 0 || PROBE_X > this.world.level.width;
        return IS_OUT_OF_BOUNDS || !this.world.level.isWalkableAt(PROBE_X, PROBE_Y);
    }
}
