const IMAGE_BEAR_WALK = './assets/image/03-monsters/1 Bear/Walk.png';

class Enemy extends MovableObject {
    settings = GAME_SETTINGS.enemy;
    width = this.settings.width;
    height = this.settings.height;
    frameWidth = 40;
    frameHeight = 40;
    frameCount = 6;
    hitbox = { offsetX: 28, offsetY: 20, width: 48, height: 60 };
    speed = this.settings.speed;
    animationFps = this.settings.animationFps;
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
