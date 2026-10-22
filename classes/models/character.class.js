const HITBOX_STANDING = { offsetX: 39, offsetY: 73, width: 40, height: 77 };
const HITBOX_WALKING = { offsetX: 52, offsetY: 73, width: 40, height: 77 };
const ATTACK_HITBOX = { offsetX: 79, offsetY: 65, width: 51, height: 50 };
const STANDING_STATES = ['idle', 'jump', 'hurt', 'dead', 'attack', 'cast'];

class Character extends CharacterMovement{
    maxHealth = this.settings.maxHealth;
    health = this.maxHealth;
    invincibleTicks = 0;
    deadTicks = 0;
    rollTicksLeft = 0;
    rollCooldownLeft = 0;
    attackTicksLeft = 0;
    attackHits = [];
    castTicksLeft = 0;
    castCooldownLeft = 0;
    maxEnergy = GAME_SETTINGS.energy.maxCharges;
    energy = GAME_SETTINGS.energy.startCharges;
    keyCount = 0;

    constructor(spriteSet = CHARACTER_SPRITES.fireWizard){
        super();
        this.sprites = spriteSet;
        this.hitbox = HITBOX_STANDING;
        this.frameCount = this.sprites.idle.frames;
        this.setupSprites(Object.values(this.sprites).map(sprite => sprite.path));
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
        this.checkItems();
    }

    checkItems(){
        this.world.level.items.forEach(item => {
            if(item.isCollectable(this) && this.isColliding(item)){
                item.collect(this);
            }
        });
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
        this.showProgressState('dead', this.deadTicks, this.settings.deadFrameTicks * this.sprites.dead.frames);
    }

    updateSpeed(){
        if(this.isRolling()){
            this.speed = this.settings.rollSpeed;
            return;
        }
        super.updateSpeed();
    }

    hasInput(){
        return super.hasInput() || this.wantsRoll() || this.wantsAttack() || this.wantsCast();
    }

    isMovementLocked(){
        return super.isMovementLocked() || this.isHurt() || this.isRolling();
    }

    isReadyOnGround(){
        return super.isReadyOnGround() && !this.isHurt() && !this.isRolling();
    }

    isBusy(){
        return this.isRolling() || this.isAttacking() || this.isCasting();
    }

    isRolling(){
        return this.rollTicksLeft > 0;
    }

    wantsRoll(){
        return this.world.keyboard.DOWN;
    }

    handleRoll(){
        this.rollCooldownLeft = tickDown(this.rollCooldownLeft);
        if(this.wantsRoll() && this.isReadyOnGround() && this.rollCooldownLeft == 0){
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

    getStateHitbox(stateName){
        return STANDING_STATES.includes(stateName) ? HITBOX_STANDING : HITBOX_WALKING;
    }

    showProgressState(stateName, elapsedTicks, totalTicks){
        const SPRITE = this.sprites[stateName];
        this.hitbox = this.getStateHitbox(stateName);
        this.setProgressSprite(SPRITE.path, SPRITE.frames, elapsedTicks, totalTicks);
    }

    showLoopState(stateName, fps){
        const SPRITE = this.sprites[stateName];
        this.hitbox = this.getStateHitbox(stateName);
        this.setSprite(SPRITE.path, SPRITE.frames, fps);
    }

    showFrameState(stateName, frameIndex){
        this.showLoopState(stateName, 0);
        this.currentFrame = frameIndex;
    }

    updateSprite(){
        const SPRITE_PLAYERS = {
            hurt: () => this.showProgressState('hurt', this.getHurtElapsed(), this.settings.hurtTicks),
            roll: () => this.showProgressState('roll', this.settings.rollTicks - this.rollTicksLeft, this.settings.rollTicks),
            attack: () => this.showProgressState('attack', this.getAttackElapsed(), this.settings.attackTicks),
            cast: () => this.showProgressState('cast', this.settings.castTicks - this.castTicksLeft, this.settings.castTicks),
            jump: () => this.showFrameState('jump', this.getJumpFrame()),
            walk: () => this.showLoopState('walk', this.settings.walkFps),
            rest: () => this.showProgressState('rest', this.idleTicks - this.settings.restDelayTicks, this.settings.restFrameTicks * this.sprites.rest.frames),
            idle: () => this.showLoopState('idle', this.settings.idleFps)
        };
        SPRITE_PLAYERS[this.getSpriteState()]();
    }
}
