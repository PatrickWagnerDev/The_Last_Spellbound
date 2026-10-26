const DARK_KNIGHT_SPRITES = {
    idle: { path: './assets/image/05-mega-boss/1/Idle.png', frames: 8 },
    walk: { path: './assets/image/05-mega-boss/1/Walk.png', frames: 8 },
    run: { path: './assets/image/05-mega-boss/1/Run.png', frames: 8 },
    jump: { path: './assets/image/05-mega-boss/1/Jump.png', frames: 8 },
    thrust: { path: './assets/image/05-mega-boss/1/Attack.png', frames: 8 },
    walkThrust: { path: './assets/image/05-mega-boss/1/Walk_Attack.png', frames: 8 },
    upSlash: { path: './assets/image/05-mega-boss/1/Attack3.png', frames: 8 },
    aura: { path: './assets/image/05-mega-boss/1/Special.png', frames: 8 },
    hurt: { path: './assets/image/05-mega-boss/1/Hurt.png', frames: 2 },
    death: { path: './assets/image/05-mega-boss/1/Death.png', frames: 8 }
};

const JUMP_ALIGN_TOLERANCE = 4;

const DARK_KNIGHT_CONFIG = {
    settings: GAME_SETTINGS.darkKnight,
    sprites: DARK_KNIGHT_SPRITES,
    frameSize: 256,
    hitbox: { offsetX: 104, offsetY: 134, width: 48, height: 120 },
    spriteFacesLeft: false,
    deathSound: 'bossDeath',
    music: 'knightMusic',
    bodyShift: 5,
    jumpFrames: { windup: [0, 1, 2], up: 3, apex: 4, down: 5, land: [6, 7] }
};

class DarkKnight extends JumpBoss {
    attackName = 'thrust';
    hasAttackHit = false;
    lastStep = 0;
    currentNode = null;
    afterJumpState = 'chase';
    cooldownsLeft = { thrust: 0, walkThrust: 0, upSlash: 0, aura: 0 };

    constructor(column, row){
        super(column, row, DARK_KNIGHT_CONFIG);
        this.otherDirection = true;
        this.startAnimation();
    }

    getStateUpdates(){
        return { ...super.getStateUpdates(), attack: () => this.updateAttack(), return: () => this.updateReturn() };
    }

    updateBehavior(){
        const START_X = this.x;
        this.updateNode();
        super.updateBehavior();
        this.lastStep = this.x - START_X;
    }

    updateCooldowns(){
        super.updateCooldowns();
        Object.keys(this.cooldownsLeft).forEach(attackName => this.cooldownsLeft[attackName] = tickDown(this.cooldownsLeft[attackName]));
    }

    onFirstNotice(){
        this.cooldownsLeft.aura = this.settings.attacks.aura.cooldownTicks;
        super.onFirstNotice();
    }

    startSneer(){
        this.faceCharacter();
        this.markNoticed();
        this.startChase();
    }

    getNav(){
        this.platformNav ??= new PlatformNav(this.world.level, this.settings);
        return this.platformNav;
    }

    updateNode(){
        if(!this.onGround){
            return;
        }
        const FOUND_NODE = this.getNav().getNodeAt(getRectCenterX(this.getHitbox()), this.y + this.height);
        this.currentNode = FOUND_NODE ?? this.currentNode;
    }

    walkTowardCharacter(){
        const GOAL_NODE = this.getNav().getGoalNode(this.world.character.getHitbox());
        const PATH_STEP = GOAL_NODE && this.getNav().findNextStep(this.currentNode, GOAL_NODE);
        if(PATH_STEP){
            this.followStep(PATH_STEP, true);
        } else {
            super.walkTowardCharacter();
        }
    }

    followStep(step, canSprint){
        const CENTER_X = getRectCenterX(this.getHitbox());
        if(step.kind === 'jump' && Math.abs(CENTER_X - step.takeoffX) <= JUMP_ALIGN_TOLERANCE){
            this.otherDirection = step.direction < 0;
            this.afterJumpState = this.state;
            this.setState('jump');
            return;
        }
        this.otherDirection = this.getStepDirection(step, CENTER_X) < 0;
        this.speed = this.getStepSpeed(step, canSprint);
        this.showMoveAnimation();
        this.moveForward();
    }

    getStepDirection(step, centerX){
        return step.kind === 'jump' ? Math.sign(step.takeoffX - centerX) : step.direction;
    }

    getStepSpeed(step, canSprint){
        if(step.kind !== 'walk' || !canSprint){
            this.endSprint();
            return this.settings.speed;
        }
        this.updateSprint();
        return this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
    }

    isOnBottomLevel(){
        return this.currentNode?.row === this.getNav().bottomRow;
    }

    loseSight(){
        if(this.isOnBottomLevel()){
            super.loseSight();
        } else {
            this.setState('return');
        }
    }

    updateReturn(){
        const RETURN_STEP = this.getNav().findNextStep(this.currentNode, 'ground');
        if(this.isCharacterInSight()){
            this.startSneer();
        } else if(RETURN_STEP){
            this.followStep(RETURN_STEP, false);
        } else {
            super.loseSight();
        }
    }

    endJump(){
        if(this.afterJumpState === 'return'){
            this.setState('return');
        } else {
            super.endJump();
        }
    }

    isReady(attackName){
        return this.cooldownsLeft[attackName] === 0;
    }

    tryStartAttack(){
        const NEXT_ATTACK = this.pickAttack();
        if(!NEXT_ATTACK){
            return false;
        }
        this.startAttack(NEXT_ATTACK);
        return true;
    }

    pickAttack(){
        if(this.isReady('upSlash') && this.isCharacterAbove()){
            return 'upSlash';
        }
        if(this.isReady('aura') && this.isCharacterInRadius()){
            return 'aura';
        }
        const FRONT_ATTACK = this.lastStep === 0 ? 'thrust' : 'walkThrust';
        const IN_FRONT = areRectsOverlapping(this.world.character.getHitbox(), this.getFrontZone(FRONT_ATTACK));
        return IN_FRONT && this.isReady(FRONT_ATTACK) ? FRONT_ATTACK : null;
    }

    getFrontZone(attackName){
        const BOSS_RECT = this.getHitbox();
        const REACH_DISTANCE = this.settings.attacks[attackName].reachTiles * TILE_SIZE;
        return { x: this.otherDirection ? BOSS_RECT.x - REACH_DISTANCE : BOSS_RECT.x, y: BOSS_RECT.y, width: BOSS_RECT.width + REACH_DISTANCE, height: BOSS_RECT.height };
    }

    getUpZone(){
        const BOSS_RECT = this.getHitbox();
        const REACH_HEIGHT = this.settings.attacks.upSlash.reachTiles * TILE_SIZE;
        return { x: BOSS_RECT.x - TILE_SIZE, y: BOSS_RECT.y - REACH_HEIGHT, width: BOSS_RECT.width + 2 * TILE_SIZE, height: REACH_HEIGHT };
    }

    isCharacterAbove(){
        const CHARACTER_RECT = this.world.character.getHitbox();
        const IS_ABOVE = CHARACTER_RECT.y + CHARACTER_RECT.height <= this.getHitbox().y + TILE_SIZE / 2;
        return IS_ABOVE && areRectsOverlapping(CHARACTER_RECT, this.getUpZone());
    }

    isCharacterInRadius(){
        const BOSS_RECT = this.getHitbox();
        const CHARACTER_RECT = this.world.character.getHitbox();
        const CENTER_X = getRectCenterX(BOSS_RECT);
        const CENTER_Y = BOSS_RECT.y + BOSS_RECT.height / 2;
        const NEAR_X = clampValue(CENTER_X, CHARACTER_RECT.x, CHARACTER_RECT.x + CHARACTER_RECT.width);
        const NEAR_Y = clampValue(CENTER_Y, CHARACTER_RECT.y, CHARACTER_RECT.y + CHARACTER_RECT.height);
        return Math.hypot(NEAR_X - CENTER_X, NEAR_Y - CENTER_Y) <= this.settings.attacks.aura.reachTiles * TILE_SIZE;
    }

    startAttack(attackName){
        this.attackName = attackName;
        this.hasAttackHit = false;
        if(attackName !== 'walkThrust'){
            this.sprintTicksLeft = 0;
        }
        this.speed = this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
        this.setState('attack');
        soundManager.playSound(attackName === 'aura' ? 'bossRay' : 'attack');
    }

    isAttackActive(){
        const ATTACK_DATA = this.settings.attacks[this.attackName];
        return this.state === 'attack' && this.stateTicks >= ATTACK_DATA.hitStartTick && this.stateTicks < ATTACK_DATA.hitEndTick;
    }

    updateAttack(){
        const ATTACK_DATA = this.settings.attacks[this.attackName];
        this.advanceAttack(ATTACK_DATA);
        this.showProgressState(this.attackName, this.stateTicks, ATTACK_DATA.ticks);
        if(this.isAttackActive() && !this.hasAttackHit){
            this.hasAttackHit = this.hitWithAttack(ATTACK_DATA);
        }
        this.finishAttack(ATTACK_DATA);
    }

    advanceAttack(attack){
        if(this.stateTicks < attack.hitStartTick){
            this.faceCharacter();
        }
        if(this.attackName === 'walkThrust' && this.getGapAhead() === 0){
            this.moveForward();
        }
    }

    finishAttack(attack){
        if(this.stateTicks >= attack.ticks){
            this.cooldownsLeft[this.attackName] = attack.cooldownTicks;
            this.startChase();
        }
    }

    hitWithAttack(attack){
        if(this.attackName === 'aura'){
            return this.isCharacterInRadius() && this.hurtCharacter(attack.damage);
        }
        return this.hitCharacter(this.getAttackZone(), attack.damage);
    }

    getAttackZone(){
        return this.attackName === 'upSlash' ? this.getUpZone() : this.getFrontZone(this.attackName);
    }

    drawDebugArea(ctx){
        super.drawDebugArea(ctx);
        if(!this.isAttackActive()){
            return;
        }
        if(this.attackName === 'aura'){
            this.drawAuraCircle(ctx);
        } else {
            this.drawRect(ctx, this.getAttackZone(), 'orange');
        }
    }

    drawAuraCircle(ctx){
        const BOSS_RECT = this.getHitbox();
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(getRectCenterX(BOSS_RECT), BOSS_RECT.y + BOSS_RECT.height / 2, this.settings.attacks.aura.reachTiles * TILE_SIZE, 0, Math.PI * 2);
        ctx.stroke();
    }
}
