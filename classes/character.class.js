const IMAGE_IDLE = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Jump.png';
const GRAVITY = 1;
const JUMP_SPEED = 16;

class Character extends MovableObject{
    width = 150;
    height = 150;
    x = TILE_SIZE;
    y = 9 * TILE_SIZE - this.height;
    speedY = 0;
    onGround = false;
    world;
    currentPath;

    constructor(){
        super().loadImage(IMAGE_IDLE);
        this.loadImages([IMAGE_IDLE, IMAGE_WALK, IMAGE_JUMP]);
        this.currentPath = IMAGE_IDLE;
        this.animate();
    }

    animate(){
        super.animate();
        setInterval(() => {
            this.moveByKeyboard();
            this.handleJump();
            this.applyGravity();
            this.updateSprite();
        }, 1000 / 60);
    }

    moveByKeyboard(){
        if(this.world.keyboard.RIGHT){
            this.moveRight();
            this.otherDirection = false;
        }
        if(this.world.keyboard.LEFT){
            this.moveLeft();
            this.otherDirection = true;
        }
    }

    handleJump(){
        const WANTS_JUMP = this.world.keyboard.UP || this.world.keyboard.SPACE;
        if(WANTS_JUMP && this.onGround){
            this.jump();
        }
    }

    jump(){
        this.speedY = JUMP_SPEED;
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

    updateSprite(){
        const IS_WALKING = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if(!this.onGround){
            this.setSprite(IMAGE_JUMP, 9);
        } else if(IS_WALKING){
            this.setSprite(IMAGE_WALK, 6);
        } else {
            this.setSprite(IMAGE_IDLE, 7);
        }
    }

    setSprite(path, count){
        if(this.currentPath == path){
            return;
        }
        this.img = this.imageCache[path];
        this.frameCount = count;
        this.currentFrame = 0;
        this.currentPath = path;
    }
}
