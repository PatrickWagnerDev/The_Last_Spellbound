const IMAGE_IDLE = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Jump.png';
const GRAVITY = 0.5;
const JUMP_SPEED = 11.5;
const CROUCH_TICKS = 6;
const LAND_TICKS = 9;
const APEX_SPEED = 3;

class Character extends MovableObject{
    width = 150;
    height = 150;
    x = TILE_SIZE;
    y = 9 * TILE_SIZE - this.height;
    speed = 3;
    speedY = 0;
    onGround = false;
    jumpPhase = 'none';
    phaseTicks = 0;
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
            this.updateJumpPhase();
            this.updateSprite();
        }, 1000 / 60);
    }

    isMovementLocked(){
        return this.jumpPhase == 'crouch' || this.jumpPhase == 'land';
    }

    moveByKeyboard(){
        if(this.isMovementLocked()){
            return;
        }
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
        if(WANTS_JUMP && this.onGround && this.jumpPhase == 'none'){
            this.startPhase('crouch');
        }
    }

    startPhase(phaseName){
        this.jumpPhase = phaseName;
        this.phaseTicks = 0;
    }

    jump(){
        this.speedY = JUMP_SPEED;
        this.startPhase('air');
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

    updateJumpPhase(){
        this.phaseTicks++;
        if(!this.onGround && this.jumpPhase != 'air'){
            this.startPhase('air');
        } else if(this.jumpPhase == 'crouch' && this.phaseTicks >= CROUCH_TICKS){
            this.jump();
        } else if(this.jumpPhase == 'air' && this.onGround){
            this.startPhase('land');
        } else if(this.jumpPhase == 'land' && this.phaseTicks >= LAND_TICKS){
            this.startPhase('none');
        }
    }

    getJumpFrame(){
        if(this.jumpPhase == 'crouch'){
            return this.getPhaseFrame(0, CROUCH_TICKS);
        }
        if(this.jumpPhase == 'land'){
            return this.getPhaseFrame(6, LAND_TICKS);
        }
        return this.getAirFrame();
    }

    getPhaseFrame(startFrame, totalTicks){
        const FRAME_INDEX = Math.floor(this.phaseTicks / (totalTicks / 3));
        return startFrame + Math.min(FRAME_INDEX, 2);
    }

    getAirFrame(){
        if(this.speedY > APEX_SPEED){
            return 3;
        }
        if(this.speedY < -APEX_SPEED){
            return 5;
        }
        return 4;
    }

    updateSprite(){
        const IS_WALKING = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if(this.jumpPhase != 'none'){
            this.setSprite(IMAGE_JUMP, 9, 0);
            this.currentFrame = this.getJumpFrame();
        } else if(IS_WALKING){
            this.setSprite(IMAGE_WALK, 6, 8);
        } else {
            this.setSprite(IMAGE_IDLE, 7, 5);
        }
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
