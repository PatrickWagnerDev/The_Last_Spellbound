const IMAGE_IDLE = './assets/image/01-wizard/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/01-wizard/Fire Wizard/Walk.png';
const IMAGE_JUMP = './assets/image/01-wizard/Fire Wizard/Jump.png';
const IMAGE_REST = './assets/image/02-wizard-extras/Fire Wizard/Rest.png';
const IMAGE_HURT = './assets/image/01-wizard/Fire Wizard/Hurt.png';
const IMAGE_DEAD = './assets/image/01-wizard/Fire Wizard/Dead.png';
const IMAGE_ROLL = './assets/image/02-wizard-extras/Fire Wizard/Roll.png';
const IMAGE_ATTACK = './assets/image/02-wizard-extras/Fire Wizard/Attack_1.png';
const IMAGE_CAST = './assets/image/01-wizard/Fire Wizard/Fireball.png';
const HITBOX_STANDING = { offsetX: 39, offsetY: 73, width: 40, height: 77 };
const HITBOX_WALKING = { offsetX: 52, offsetY: 73, width: 40, height: 77 };
const ATTACK_HITBOX = { offsetX: 79, offsetY: 65, width: 51, height: 50 };

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
    deadTicks = 0;
    rollTicksLeft = 0;
    rollCooldownLeft = 0;
    attackTicksLeft = 0;
    attackHits = [];
    previousKeys = {};
    castTicksLeft = 0;
    castCooldownLeft = 0;
    maxEnergy = GAME_SETTINGS.energy.maxCharges;
    energy = GAME_SETTINGS.energy.startCharges;

    constructor(){
        super();
        this.setupSprites([IMAGE_IDLE, IMAGE_WALK, IMAGE_JUMP, IMAGE_REST, IMAGE_HURT, IMAGE_DEAD, IMAGE_ROLL, IMAGE_ATTACK, IMAGE_CAST]);
        this.startAnimation();
    }

    updateObject(){
        this.updateStatus();
        if(this.isDead()){
            this.updateDeadState();
            return;
        }
        this.updateMovement();
        this.updateActions();
        this.updatePhysics();
        this.updateAnimation();
    }

    updateStatus(){
        this.updateInvincibility();
        this.updateHurt();
        this.checkCollisions();
    }

    updateDeadState(){
        this.applyGravity();
        this.limitToWall();
        this.updateDeathSprite();
    }

    updateMovement(){
        this.updateSpeed();
        this.moveByKeyboard();
        this.updateRoll();
        this.limitToWall();
        this.handleJump();
        this.handleRoll();
    }

    updateActions(){
        this.handleAttack();
        this.updateAttack();
        this.handleCast();
        this.updateCast();
    }

    updatePhysics(){
        this.applyGravity();
        this.updateJumpPhase();
    }

    updateAnimation(){
        this.updateIdleTicks();
        this.updateSprite();
    }

    updateInvincibility(){
        this.invincibleTicks = tickDown(this.invincibleTicks);
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
        if(this.invincibleTicks > 0 || this.isDead() || this.isRolling()){
            return;
        }
        this.takeDamage(damage);
        this.invincibleTicks = GAME_SETTINGS.combat.invincibleTicks;
        this.startHurt(source);
    }

    startHurt(source){
        this.startKnockback(source);
        this.otherDirection = this.knockbackDirection > 0;
        this.attackTicksLeft = 0;
        this.castTicksLeft = 0;
        if(this.jumpPhase == 'crouch' || this.jumpPhase == 'land'){
            this.startPhase('none');
        }
    }

    updateDeathSprite(){
        this.deadTicks++;
        this.setProgressSprite(IMAGE_DEAD, 6, this.deadTicks, this.settings.deadFrameTicks * 6);
    }

    updateSpeed(){
        if(this.isRolling()){
            this.speed = this.settings.rollSpeed;
            return;
        }
        this.speed = this.onGround ? this.settings.speed : this.settings.speed * this.settings.airSpeedFactor;
    }

    isWalking(){
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    wantsJump(){
        return this.world.keyboard.UP || this.world.keyboard.SPACE;
    }

    hasInput(){
        return this.isWalking() || this.wantsJump() || this.wantsRoll() || this.wantsAttack() || this.wantsCast();
    }

    isRolling(){
        return this.rollTicksLeft > 0;
    }

    wantsRoll(){
        return this.world.keyboard.DOWN;
    }

    handleRoll(){
        this.rollCooldownLeft = tickDown(this.rollCooldownLeft);
        const CAN_ROLL = this.onGround && this.jumpPhase == 'none' && !this.isHurt() && !this.isRolling();
        if(this.wantsRoll() && CAN_ROLL && this.rollCooldownLeft == 0){
            this.rollTicksLeft = this.settings.rollTicks;
            this.attackTicksLeft = 0;
            this.castTicksLeft = 0;
        }
    }

    updateRoll(){
        if(!this.isRolling()){
            return;
        }
        this.moveForward();
        this.rollTicksLeft--;
        if(!this.isRolling()){
            this.rollCooldownLeft = this.settings.rollCooldownTicks;
        }
    }

    isNewPress(keyName){
        const IS_PRESSED = this.world.keyboard[keyName];
        const IS_NEW = IS_PRESSED && !this.previousKeys[keyName];
        this.previousKeys[keyName] = IS_PRESSED;
        return IS_NEW;
    }

    isAttacking(){
        return this.attackTicksLeft > 0;
    }

    wantsAttack(){
        return this.world.keyboard.ATTACK;
    }

    handleAttack(){
        const JUST_PRESSED = this.isNewPress('ATTACK');
        const CAN_ATTACK = !this.isAttacking() && !this.isCasting() && !this.isRolling() && !this.isHurt();
        if(JUST_PRESSED && CAN_ATTACK){
            this.attackTicksLeft = this.settings.attackTicks;
            this.attackHits = [];
        }
    }

    getAttackElapsed(){
        return this.settings.attackTicks - this.attackTicksLeft;
    }

    isAttackActive(){
        const ELAPSED_TICKS = this.getAttackElapsed();
        return this.isAttacking() && ELAPSED_TICKS >= this.settings.attackHitStartTick && ELAPSED_TICKS < this.settings.attackHitEndTick;
    }

    updateAttack(){
        if(!this.isAttacking()){
            return;
        }
        if(this.isAttackActive()){
            this.hitEnemies();
        }
        this.attackTicksLeft--;
    }

    hitEnemies(){
        const ATTACK_RECT = this.getBoxRect(ATTACK_HITBOX);
        this.world.level.getCollidables().forEach(enemy => {
            if(!this.attackHits.includes(enemy) && enemy.isOverlapping(ATTACK_RECT)){
                enemy.receiveHit(GAME_SETTINGS.combat.hitDamage, this);
                this.attackHits.push(enemy);
            }
        });
    }

    drawAttackBox(ctx){
        if(this.isAttackActive()){
            this.drawRect(ctx, this.getBoxRect(ATTACK_HITBOX), 'orange');
        }
    }

    isCasting(){
        return this.castTicksLeft > 0;
    }

    wantsCast(){
        return this.world.keyboard.SHOOT;
    }

    handleCast(){
        const JUST_PRESSED = this.isNewPress('SHOOT');
        const CAN_CAST = !this.isCasting() && !this.isAttacking() && !this.isRolling() && !this.isHurt() && this.castCooldownLeft == 0 && this.energy >= 1;
        this.castCooldownLeft = tickDown(this.castCooldownLeft);
        if(JUST_PRESSED && CAN_CAST){
            this.castTicksLeft = this.settings.castTicks;
        }
    }

    updateCast(){
        if(!this.isCasting()){
            return;
        }
        if(this.settings.castTicks - this.castTicksLeft == this.settings.castReleaseTick){
            this.world.addProjectile(new Fireball(this));
            this.castCooldownLeft = this.settings.castCooldownTicks;
            this.energy -= 1;
        }
        this.castTicksLeft--;
    }

    addEnergy(amount){
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    }

    isMovementLocked(){
        return this.jumpPhase == 'crouch' || this.jumpPhase == 'land' || this.isHurt() || this.isRolling();
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
        this.x = clampValue(this.x, this.settings.leftWallX, MAX_X);
    }

    handleJump(){
        if(this.wantsJump() && this.onGround && this.jumpPhase == 'none' && !this.isHurt() && !this.isRolling()){
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
        return startFrame + getProgressFrame(this.phaseTicks, totalTicks, 3);
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
        if(this.hasInput() || this.jumpPhase != 'none' || this.isRolling() || this.isAttacking() || this.isCasting()){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }

    setSprite(path, count, fps){
        super.setSprite(path, count, fps);
        const IS_STANDING = [IMAGE_IDLE, IMAGE_JUMP, IMAGE_HURT, IMAGE_DEAD, IMAGE_ATTACK, IMAGE_CAST].includes(path);
        this.hitbox = IS_STANDING ? HITBOX_STANDING : HITBOX_WALKING;
    }

    getSpriteState(){
        const STATE_CHECKS = [
            ['hurt', this.isHurt()],
            ['roll', this.isRolling()],
            ['attack', this.isAttacking()],
            ['cast', this.isCasting()],
            ['jump', this.jumpPhase != 'none'],
            ['walk', this.isWalking()],
            ['rest', this.idleTicks >= this.settings.restDelayTicks]
        ];
        const ACTIVE_STATE = STATE_CHECKS.find(check => check[1]);
        return ACTIVE_STATE ? ACTIVE_STATE[0] : 'idle';
    }

    updateSprite(){
        const SPRITE_PLAYERS = {
            hurt: () => this.setProgressSprite(IMAGE_HURT, 3, this.getHurtElapsed(), this.settings.hurtTicks),
            roll: () => this.setProgressSprite(IMAGE_ROLL, 6, this.settings.rollTicks - this.rollTicksLeft, this.settings.rollTicks),
            attack: () => this.setProgressSprite(IMAGE_ATTACK, 5, this.getAttackElapsed(), this.settings.attackTicks),
            cast: () => this.setProgressSprite(IMAGE_CAST, 8, this.settings.castTicks - this.castTicksLeft, this.settings.castTicks),
            jump: () => this.setJumpSprite(),
            walk: () => this.setSprite(IMAGE_WALK, 6, this.settings.walkFps),
            rest: () => this.setProgressSprite(IMAGE_REST, 4, this.idleTicks - this.settings.restDelayTicks, this.settings.restFrameTicks * 4),
            idle: () => this.setSprite(IMAGE_IDLE, 7, this.settings.idleFps)
        };
        SPRITE_PLAYERS[this.getSpriteState()]();
    }

    setJumpSprite(){
        this.setSprite(IMAGE_JUMP, 9, 0);
        this.currentFrame = this.getJumpFrame();
    }
}
