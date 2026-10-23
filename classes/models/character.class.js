const HITBOX_STANDING = { offsetX: 39, offsetY: 73, width: 40, height: 77 };
const HITBOX_WALKING = { offsetX: 52, offsetY: 73, width: 40, height: 77 };
const STANDING_STATES = ['idle', 'jump', 'hurt', 'dead', 'attack', 'cast'];

class Character extends CharacterActions{
    maxHealth = this.settings.maxHealth;
    health = this.maxHealth;
    invincibleTicks = 0;
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
        this.advanceDeath('dead');
        this.stopLoopSounds();
    }

    isFrozen(){
        const IS_FROZEN = super.isFrozen();
        if(IS_FROZEN){
            this.stopLoopSounds();
        }
        return IS_FROZEN;
    }

    stopAnimation(){
        super.stopAnimation();
        this.stopLoopSounds();
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
        this.updateCombat();
        this.checkItems();
    }

    checkItems(){
        this.world.level.items.forEach(item => {
            if(item.isCollectable(this) && this.isColliding(item)){
                item.collectItem(this);
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
        this.updateLoopSounds();
    }

    updateLoopSounds(){
        this.toggleLoop('walk', this.getSpriteState() === 'walk');
        this.toggleLoop('snore', this.isSleeping());
    }

    toggleLoop(soundName, isActive){
        if(isActive){
            soundManager.startLoop(soundName);
        } else {
            soundManager.stopLoop(soundName);
        }
    }

    isSleeping(){
        const SIT_TICKS = this.settings.restDelayTicks + this.settings.restFrameTicks * this.sprites.rest.frames;
        return !this.world.isGameEnded && this.getSpriteState() === 'rest' && this.idleTicks >= SIT_TICKS;
    }

    stopLoopSounds(){
        soundManager.stopLoop('walk');
        soundManager.stopLoop('snore');
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

    canBeHurt(){
        return this.invincibleTicks === 0 && !this.isDead() && !this.isRolling();
    }

    receiveHit(damage, source){
        if(!this.canBeHurt()){
            return;
        }
        this.takeDamage(damage);
        this.invincibleTicks = GAME_SETTINGS.combat.invincibleTicks;
        this.startHurt(source);
        soundManager.playSound('hurt');
    }

    startHurt(source){
        this.startKnockback(source);
        this.otherDirection = this.knockbackDirection > 0;
        this.attackTicksLeft = 0;
        this.castTicksLeft = 0;
        if(this.jumpPhase === 'crouch' || this.jumpPhase === 'land'){
            this.startPhase('none');
        }
    }

    getDeathTicks(){
        return this.settings.deadFrameTicks * this.sprites.dead.frames;
    }

    getSupportXs(){
        const CENTER_X = getRectCenterX(this.getHitbox());
        const EDGE_TOLERANCE = this.settings.edgeTolerance;
        return [CENTER_X - EDGE_TOLERANCE, CENTER_X, CENTER_X + EDGE_TOLERANCE];
    }

    getSpriteState(){
        const STATE_CHECKS = [
            ['hurt', this.isHurt()],
            ['roll', this.isRolling()],
            ['attack', this.isAttacking()],
            ['cast', this.isCasting()],
            ['jump', this.jumpPhase !== 'none'],
            ['walk', this.isWalking()],
            ['rest', this.idleTicks >= this.settings.restDelayTicks]
        ];
        const ACTIVE_STATE = STATE_CHECKS.find(check => check[1]);
        return ACTIVE_STATE ? ACTIVE_STATE[0] : 'idle';
    }

    getStateHitbox(stateName){
        return STANDING_STATES.includes(stateName) ? HITBOX_STANDING : HITBOX_WALKING;
    }

    applyStateHitbox(stateName){
        this.hitbox = this.getStateHitbox(stateName);
    }

    updateSprite(){
        const SPRITE_PLAYERS = {
            hurt: () => this.showProgressState('hurt', this.getHurtElapsed(), this.settings.hurtTicks),
            roll: () => this.showProgressState('roll', this.getRollElapsed(), this.settings.rollTicks),
            attack: () => this.showProgressState('attack', this.getAttackElapsed(), this.settings.attackTicks),
            cast: () => this.showProgressState('cast', this.getCastElapsed(), this.settings.castTicks),
            jump: () => this.showFrameState('jump', this.getJumpFrame()),
            walk: () => this.showLoopState('walk', this.settings.walkFps),
            rest: () => this.showProgressState('rest', this.idleTicks - this.settings.restDelayTicks, this.settings.restFrameTicks * this.sprites.rest.frames),
            idle: () => this.showLoopState('idle', this.settings.idleFps)
        };
        SPRITE_PLAYERS[this.getSpriteState()]();
    }
}
