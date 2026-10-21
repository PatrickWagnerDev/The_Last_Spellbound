const IMAGE_IDLE = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Jump.png';
const IMAGE_REST = './assets/image/craftpix-net-902518-wizard-pixel-art-sprites-pack-2/Fire Wizard/Rest.png';
const LEFT_WALL_X = -60;
const JUMP_SPEED = 11.5;
const REST_DELAY_TICKS = 600;
const REST_FRAME_TICKS = 15;
const CROUCH_TICKS = 6;
const LAND_TICKS = 9;
const APEX_SPEED = 3;

class Character extends MovableObject{
    width = 150;
    height = 150;
    x = TILE_SIZE;
    y = 9 * TILE_SIZE - this.height;
    speed = 3;
    jumpPhase = 'none';
    phaseTicks = 0;
    idleTicks = 0;

    constructor(){
        super().loadImage(IMAGE_IDLE);
        this.loadImages([IMAGE_IDLE, IMAGE_WALK, IMAGE_JUMP, IMAGE_REST]);
        this.currentPath = IMAGE_IDLE;
        this.animate();
    }

    update(){
        this.moveByKeyboard();
        this.limitToWall();
        this.handleJump();
        this.applyGravity();
        this.updateJumpPhase();
        this.updateIdleTicks();
        this.updateSprite();
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

    limitToWall(){
        this.x = Math.max(this.x, LEFT_WALL_X);
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

    updateIdleTicks(){
        const KEYS = this.world.keyboard;
        const HAS_INPUT = KEYS.RIGHT || KEYS.LEFT || KEYS.UP || KEYS.SPACE;
        if(HAS_INPUT || this.jumpPhase != 'none'){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }

    getRestFrame(){
        const FRAME_INDEX = Math.floor((this.idleTicks - REST_DELAY_TICKS) / REST_FRAME_TICKS);
        return Math.min(FRAME_INDEX, this.frameCount - 1);
    }

    updateSprite(){
        const IS_WALKING = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if(this.jumpPhase != 'none'){
            this.setSprite(IMAGE_JUMP, 9, 0);
            this.currentFrame = this.getJumpFrame();
        } else if(IS_WALKING){
            this.setSprite(IMAGE_WALK, 6, 8);
        } else if(this.idleTicks >= REST_DELAY_TICKS){
            this.setSprite(IMAGE_REST, 4, 0);
            this.currentFrame = this.getRestFrame();
        } else {
            this.setSprite(IMAGE_IDLE, 7, 5);
        }
    }
}
