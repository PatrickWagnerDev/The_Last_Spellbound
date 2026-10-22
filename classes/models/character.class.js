const IMAGE_IDLE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/01-wizard/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/01-wizard/Fire Wizard/Jump.png';
const IMAGE_REST = './assets/image/02-wizard-extras/Fire Wizard/Rest.png';
const HITBOX_STANDING = { offsetX: 39, offsetY: 73, width: 40, height: 77 };
const HITBOX_WALKING = { offsetX: 52, offsetY: 73, width: 40, height: 77 };

class Character extends MovableObject{
    settings = GAME_SETTINGS.character;
    width = this.settings.width;
    height = this.settings.height;
    frameCount = 7;
    hitbox = HITBOX_STANDING;
    x = TILE_SIZE;
    y = 9 * TILE_SIZE - this.height;
    speed = this.settings.speed;
    jumpPhase = 'none';
    phaseTicks = 0;
    idleTicks = 0;
    maxHealth = this.settings.maxHealth;
    health = this.maxHealth;
    invincibleTicks = 0;

    constructor(){
        super().loadImage(IMAGE_IDLE);
        this.loadImages([IMAGE_IDLE, IMAGE_WALK, IMAGE_JUMP, IMAGE_REST]);
        this.currentPath = IMAGE_IDLE;
        this.startAnimation();
    }

    updateObject(){
        this.updateInvincibility();
        this.checkCollisions();
        if(this.isDead()){
            this.applyGravity();
            return;
        }
        this.updateSpeed();
        this.moveByKeyboard();
        this.limitToWall();
        this.handleJump();
        this.applyGravity();
        this.updateJumpPhase();
        this.updateIdleTicks();
        this.updateSprite();
    }

    updateInvincibility(){
        if(this.invincibleTicks > 0){
            this.invincibleTicks--;
        }
    }

    checkCollisions(){
        this.world.level.getCollidables().forEach(object => this.handleCollision(object));
    }

    handleCollision(object){
        if(this.isColliding(object) && object instanceof Enemy){
            this.receiveHit(GAME_SETTINGS.combat.hitDamage);
        }
    }

    receiveHit(damage){
        if(this.invincibleTicks > 0 || this.isDead()){
            return;
        }
        this.takeDamage(damage);
        this.invincibleTicks = GAME_SETTINGS.combat.invincibleTicks;
    }

    updateSpeed(){
        this.speed = this.onGround ? this.settings.speed : this.settings.speed * this.settings.airSpeedFactor;
    }

    isWalking(){
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    wantsJump(){
        return this.world.keyboard.UP || this.world.keyboard.SPACE;
    }

    hasInput(){
        return this.isWalking() || this.wantsJump();
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
        const MAX_X = this.world.level.width - this.width + this.settings.rightWallOffset;
        this.x = Math.min(Math.max(this.x, this.settings.leftWallX), MAX_X);
    }

    handleJump(){
        if(this.wantsJump() && this.onGround && this.jumpPhase == 'none'){
            this.startPhase('crouch');
        }
    }

    startPhase(phaseName){
        this.jumpPhase = phaseName;
        this.phaseTicks = 0;
    }

    launchJump(){
        this.speedY = this.settings.jumpSpeed;
        this.startPhase('air');
    }

    updateJumpPhase(){
        this.phaseTicks++;
        if(!this.onGround && this.jumpPhase != 'air'){
            this.startPhase('air');
        } else if(this.jumpPhase == 'crouch' && this.phaseTicks >= this.settings.crouchTicks){
            this.launchJump();
        } else if(this.jumpPhase == 'air' && this.onGround){
            this.startPhase('land');
        } else if(this.jumpPhase == 'land' && this.phaseTicks >= this.settings.landTicks){
            this.startPhase('none');
        }
    }

    getJumpFrame(){
        if(this.jumpPhase == 'crouch'){
            return this.getPhaseFrame(0, this.settings.crouchTicks);
        }
        if(this.jumpPhase == 'land'){
            return this.getPhaseFrame(6, this.settings.landTicks);
        }
        return this.getAirFrame();
    }

    getPhaseFrame(startFrame, totalTicks){
        const FRAME_INDEX = Math.floor(this.phaseTicks / (totalTicks / 3));
        return startFrame + Math.min(FRAME_INDEX, 2);
    }

    getAirFrame(){
        if(this.speedY > this.settings.apexSpeed){
            return 3;
        }
        if(this.speedY < -this.settings.apexSpeed){
            return 5;
        }
        return 4;
    }

    updateIdleTicks(){
        if(this.hasInput() || this.jumpPhase != 'none'){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }

    getRestFrame(){
        const FRAME_INDEX = Math.floor((this.idleTicks - this.settings.restDelayTicks) / this.settings.restFrameTicks);
        return Math.min(FRAME_INDEX, this.frameCount - 1);
    }

    setSprite(path, count, fps){
        super.setSprite(path, count, fps);
        const IS_STANDING = path == IMAGE_IDLE || path == IMAGE_JUMP;
        this.hitbox = IS_STANDING ? HITBOX_STANDING : HITBOX_WALKING;
    }

    updateSprite(){
        if(this.jumpPhase != 'none'){
            this.setSprite(IMAGE_JUMP, 9, 0);
            this.currentFrame = this.getJumpFrame();
        } else if(this.isWalking()){
            this.setSprite(IMAGE_WALK, 6, this.settings.walkFps);
        } else if(this.idleTicks >= this.settings.restDelayTicks){
            this.setSprite(IMAGE_REST, 4, 0);
            this.currentFrame = this.getRestFrame();
        } else {
            this.setSprite(IMAGE_IDLE, 7, this.settings.idleFps);
        }
    }
}
