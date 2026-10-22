const IMAGE_IDLE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/01-wizard/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/01-wizard/Fire Wizard/Jump.png';
const IMAGE_REST = './assets/image/02-wizard-extras/Fire Wizard/Rest.png';
const IMAGE_HURT = './assets/image/01-wizard/Fire Wizard/Hurt.png';
const IMAGE_DEAD = './assets/image/01-wizard/Fire Wizard/Dead.png';
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
    hurtTicksLeft = 0;
    knockbackDirection = 1;
    deadTicks = 0;

    constructor(){
        super().loadImage(IMAGE_IDLE);
        this.loadImages([IMAGE_IDLE, IMAGE_WALK, IMAGE_JUMP, IMAGE_REST, IMAGE_HURT, IMAGE_DEAD]);
        this.currentPath = IMAGE_IDLE;
        this.startAnimation();
    }

    updateObject(){
        this.updateInvincibility();
        this.updateHurt();
        this.checkCollisions();
        if(this.isDead()){
            this.applyGravity();
            this.limitToWall();
            this.updateDeathSprite();
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
            this.receiveHit(GAME_SETTINGS.combat.hitDamage, object);
        }
    }

    receiveHit(damage, source){
        if(this.invincibleTicks > 0 || this.isDead()){
            return;
        }
        this.takeDamage(damage);
        this.invincibleTicks = GAME_SETTINGS.combat.invincibleTicks;
        this.startHurt(source);
    }

    isHurt(){
        return this.hurtTicksLeft > 0;
    }

    updateHurt(){
        if(!this.isHurt()){
            return;
        }
        this.x += this.getKnockbackStep();
        this.hurtTicksLeft--;
    }

    getKnockbackStep(){
        return this.knockbackDirection * this.settings.knockbackSpeed * this.hurtTicksLeft / this.settings.hurtTicks;
    }

    startHurt(source){
        const SOURCE_RECT = source.getHitbox();
        const OWN_RECT = this.getHitbox();
        const IS_SOURCE_RIGHT = SOURCE_RECT.x + SOURCE_RECT.width / 2 > OWN_RECT.x + OWN_RECT.width / 2;
        this.knockbackDirection = IS_SOURCE_RIGHT ? -1 : 1;
        this.otherDirection = !IS_SOURCE_RIGHT;
        this.hurtTicksLeft = this.settings.hurtTicks;
        if(this.jumpPhase == 'crouch' || this.jumpPhase == 'land'){
            this.startPhase('none');
        }
    }

    getHurtFrame(){
        const FRAME_INDEX = Math.floor((this.settings.hurtTicks - this.hurtTicksLeft) / (this.settings.hurtTicks / 3));
        return Math.min(FRAME_INDEX, 2);
    }

    updateDeathSprite(){
        this.deadTicks++;
        this.setSprite(IMAGE_DEAD, 6, 0);
        this.currentFrame = Math.min(Math.floor(this.deadTicks / this.settings.deadFrameTicks), this.frameCount - 1);
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
        return this.jumpPhase == 'crouch' || this.jumpPhase == 'land' || this.isHurt();
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
        if(this.wantsJump() && this.onGround && this.jumpPhase == 'none' && !this.isHurt()){
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
        const IS_STANDING = [IMAGE_IDLE, IMAGE_JUMP, IMAGE_HURT, IMAGE_DEAD].includes(path);
        this.hitbox = IS_STANDING ? HITBOX_STANDING : HITBOX_WALKING;
    }

    updateSprite(){
        if(this.isHurt()){
            this.setSprite(IMAGE_HURT, 3, 0);
            this.currentFrame = this.getHurtFrame();
        } else if(this.jumpPhase != 'none'){
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
