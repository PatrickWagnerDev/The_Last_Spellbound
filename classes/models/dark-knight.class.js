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
    hurtboxes: [
        { offsetX: 117, offsetY: 162, width: 30, height: 24 },
        { offsetX: 108, offsetY: 190, width: 39, height: 35 },
        { offsetX: 114, offsetY: 229, width: 30, height: 25 }
    ],
    spriteFacesLeft: false,
    deathSound: 'bossDeath',
    music: 'knightMusic',
    bodyShift: 5,
    jumpFrames: { windup: [0, 1, 2], up: 3, apex: 4, down: 5, land: [6, 7] }
};

/**
 * The dark knight, the boss of level three. On top of the sprint and the jump over gaps he has four melee
 * attacks: a thrust standing and one while walking, a slash upwards and an aura with a long wind-up. He does
 * not sneer but chases at once, follows the character onto platforms with the map of ways and walks back to
 * the ground when he has lost the character. His steps make a sound.
 */
class DarkKnight extends JumpBoss {
    attackName = 'thrust';
    hasAttackHit = false;
    lastStep = 0;
    lastStepFrame = -1;
    currentNode = null;
    afterJumpState = 'chase';
    cooldownsLeft = { thrust: 0, walkThrust: 0, upSlash: 0, aura: 0 };

    /**
     * Creates the dark knight on a map cell, looking to the left, and starts his game loop.
     * @param {number} column - Map column of the knight.
     * @param {number} row - Map row of the knight.
     */
    constructor(column, row){
        super(column, row, DARK_KNIGHT_CONFIG);
        this.otherDirection = true;
        this.startAnimation();
    }

    /**
     * Returns the update methods of the states, with the attacks and the way back to the ground added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), attack: () => this.updateAttack(), return: () => this.updateReturn() };
    }

    /**
     * Runs the behavior of one tick: finds the standing place, runs the boss behavior, remembers how far the
     * knight moved and plays the step sound.
     * @returns {void}
     */
    updateBehavior(){
        const START_X = this.x;
        this.updateNode();
        super.updateBehavior();
        this.lastStep = this.x - START_X;
        this.playStepSound();
    }

    /**
     * Plays the step sound at the frames in which a foot touches the ground, only while the knight really
     * moves. During the sprint it plays faster.
     * @returns {void}
     */
    playStepSound(){
        const IS_RUNNING = this.currentPath === DARK_KNIGHT_SPRITES.run.path;
        const IS_STEPPING = this.lastStep !== 0 && (IS_RUNNING || this.currentPath === DARK_KNIGHT_SPRITES.walk.path);
        const IS_NEW_FRAME = this.currentFrame !== this.lastStepFrame;
        this.lastStepFrame = this.currentFrame;
        if(IS_STEPPING && IS_NEW_FRAME && this.settings.stepFrames.includes(this.currentFrame)){
            soundManager.playSound('knightStep', IS_RUNNING ? this.settings.sprintStepRate : 1);
        }
    }

    /**
     * Counts the waiting times of the sprint and of all four attacks down by one tick.
     * @returns {void}
     */
    updateCooldowns(){
        super.updateCooldowns();
        Object.keys(this.cooldownsLeft).forEach(attackName => this.cooldownsLeft[attackName] = tickDown(this.cooldownsLeft[attackName]));
    }

    /**
     * Runs when the knight notices the character for the first time: the aura starts with its full waiting
     * time, so it is not used at once, and the music starts.
     * @returns {void}
     */
    onFirstNotice(){
        this.cooldownsLeft.aura = this.settings.attacks.aura.cooldownTicks;
        super.onFirstNotice();
    }

    /**
     * Replaces the sneer: the knight does not sneer, he looks at the character, notes that he has noticed it
     * and starts to chase at once.
     * @returns {void}
     */
    startSneer(){
        this.faceCharacter();
        this.markNoticed();
        this.startChase();
    }

    /**
     * Returns the map of ways of the knight. It is built at the first use, because it needs the level of the
     * world, and then it is reused.
     * @returns {PlatformNav} The map of ways.
     */
    getNav(){
        this.platformNav ??= new PlatformNav(this.world.level, this.settings);
        return this.platformNav;
    }

    /**
     * Keeps track of the standing place of the knight. It is only updated on the ground, in the air the last
     * place stays.
     * @returns {void}
     */
    updateNode(){
        if(!this.onGround){
            return;
        }
        const FOUND_NODE = this.getNav().getNodeAt(getRectCenterX(this.getHitbox()), this.y + this.height);
        this.currentNode = FOUND_NODE ?? this.currentNode;
    }

    /**
     * Walks towards the character along the cheapest way of the map of ways. If there is no way he walks
     * towards the character like any jump boss.
     * @returns {void}
     */
    walkTowardCharacter(){
        const GOAL_NODE = this.getNav().getGoalNode(this.world.character.getHitbox());
        const PATH_STEP = GOAL_NODE && this.getNav().findNextStep(this.currentNode, GOAL_NODE);
        if(PATH_STEP){
            this.followStep(PATH_STEP, true);
        } else {
            super.walkTowardCharacter();
        }
    }

    /**
     * Follows one step of the map of ways: a jump starts when the knight stands at its take-off point,
     * otherwise he turns in the direction of the step and moves one step.
     * @param {object} step - A way of the map: walk, fall or jump, with its direction.
     * @param {boolean} canSprint - True if he may sprint on a walk step.
     * @returns {void}
     */
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

    /**
     * Returns the direction to the next step: towards the take-off point for a jump, the direction of the step
     * itself otherwise.
     * @param {object} step - A way of the map.
     * @param {number} centerX - Horizontal middle of the knight.
     * @returns {number} -1 for left, 1 for right, 0 if he is exactly at the take-off point.
     */
    getStepDirection(step, centerX){
        return step.kind === 'jump' ? Math.sign(step.takeoffX - centerX) : step.direction;
    }

    /**
     * Returns the speed for a step. He sprints only on a walk step when it is allowed, otherwise a running
     * sprint ends first, so he never sprints into a jump or a fall.
     * @param {object} step - A way of the map.
     * @param {boolean} canSprint - True if he may sprint.
     * @returns {number} The speed in pixels per tick.
     */
    getStepSpeed(step, canSprint){
        if(step.kind !== 'walk' || !canSprint){
            this.endSprint();
            return this.settings.speed;
        }
        this.updateSprint();
        return this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
    }

    /**
     * Tells whether the knight stands in the lowest row, which means on the ground and not on a platform.
     * @returns {boolean} True if his standing place is in the lowest row.
     */
    isOnBottomLevel(){
        return this.currentNode?.row === this.getNav().bottomRow;
    }

    /**
     * Runs when the knight has lost the character: on the ground he patrols, on a platform he first goes back
     * to the ground.
     * @returns {void}
     */
    loseSight(){
        if(this.isOnBottomLevel()){
            super.loseSight();
        } else {
            this.setState('return');
        }
    }

    /**
     * Runs a tick of the return state: the knight chases again if he sees the character, otherwise he follows
     * the way to the ground without sprinting, or patrols if there is none.
     * @returns {void}
     */
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

    /**
     * Runs when a jump has ended: back to the return state if the jump was part of the way to the ground,
     * otherwise the chase goes on.
     * @returns {void}
     */
    endJump(){
        if(this.afterJumpState === 'return'){
            this.setState('return');
        } else {
            super.endJump();
        }
    }

    /**
     * Tells whether the waiting time of an attack is over.
     * @param {string} attackName - 'thrust', 'walkThrust', 'upSlash' or 'aura'.
     * @returns {boolean} True if the attack may be used.
     */
    isReady(attackName){
        return this.cooldownsLeft[attackName] === 0;
    }

    /**
     * Starts an attack if one fits the situation.
     * @returns {boolean} True if an attack was started.
     */
    tryStartAttack(){
        const NEXT_ATTACK = this.pickAttack();
        if(!NEXT_ATTACK){
            return false;
        }
        this.startAttack(NEXT_ATTACK);
        return true;
    }

    /**
     * Picks the attack for the situation: the slash upwards if the character is above, the aura if the
     * character is close, otherwise the thrust in front (standing or walking, depending on whether he moved).
     * @returns {string|null} The name of the attack, or null if none fits or is ready.
     */
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

    /**
     * Calculates the zone in front of the knight for a thrust: his hitbox, extended forward by the reach of
     * the attack.
     * @param {string} attackName - 'thrust' or 'walkThrust'.
     * @returns {{x: number, y: number, width: number, height: number}} The zone rectangle.
     */
    getFrontZone(attackName){
        const BOSS_RECT = this.getHitbox();
        const REACH_DISTANCE = this.settings.attacks[attackName].reachTiles * TILE_SIZE;
        return { x: this.otherDirection ? BOSS_RECT.x - REACH_DISTANCE : BOSS_RECT.x, y: BOSS_RECT.y, width: BOSS_RECT.width + REACH_DISTANCE, height: BOSS_RECT.height };
    }

    /**
     * Calculates the zone above the knight for the slash upwards: one tile wider on each side than his hitbox
     * and as high as the reach of the attack.
     * @returns {{x: number, y: number, width: number, height: number}} The zone rectangle.
     */
    getUpZone(){
        const BOSS_RECT = this.getHitbox();
        const REACH_HEIGHT = this.settings.attacks.upSlash.reachTiles * TILE_SIZE;
        return { x: BOSS_RECT.x - TILE_SIZE, y: BOSS_RECT.y - REACH_HEIGHT, width: BOSS_RECT.width + 2 * TILE_SIZE, height: REACH_HEIGHT };
    }

    /**
     * Tells whether the character is above the knight: its feet are at most half a tile below the top of the
     * knight and it is inside the zone above him.
     * @returns {boolean} True if the slash upwards fits.
     */
    isCharacterAbove(){
        const CHARACTER_RECT = this.world.character.getHitbox();
        const IS_ABOVE = CHARACTER_RECT.y + CHARACTER_RECT.height <= this.getHitbox().y + TILE_SIZE / 2;
        return IS_ABOVE && areRectsOverlapping(CHARACTER_RECT, this.getUpZone());
    }

    /**
     * Tells whether the character is inside the radius of the aura: the nearest point of its contact box is
     * not further from the middle of the knight than the reach.
     * @returns {boolean} True if the aura can hit.
     */
    isCharacterInRadius(){
        const BOSS_RECT = this.getHitbox();
        const CHARACTER_RECT = this.world.character.getContactRect();
        const CENTER_X = getRectCenterX(BOSS_RECT);
        const CENTER_Y = BOSS_RECT.y + BOSS_RECT.height / 2;
        const NEAR_X = clampValue(CENTER_X, CHARACTER_RECT.x, CHARACTER_RECT.x + CHARACTER_RECT.width);
        const NEAR_Y = clampValue(CENTER_Y, CHARACTER_RECT.y, CHARACTER_RECT.y + CHARACTER_RECT.height);
        return Math.hypot(NEAR_X - CENTER_X, NEAR_Y - CENTER_Y) <= this.settings.attacks.aura.reachTiles * TILE_SIZE;
    }

    /**
     * Starts an attack: notes its name, ends a running sprint unless it is the walking thrust, switches to the
     * attack state and plays the sound of the attack.
     * @param {string} attackName - 'thrust', 'walkThrust', 'upSlash' or 'aura'.
     * @returns {void}
     */
    startAttack(attackName){
        this.attackName = attackName;
        this.hasAttackHit = false;
        if(attackName !== 'walkThrust'){
            this.sprintTicksLeft = 0;
        }
        this.speed = this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
        this.setState('attack');
        attackName === 'aura' ? soundManager.playSound('bossRay') : soundManager.playSound('knightSwing', this.settings.attackSoundRate, false);
    }

    /**
     * Tells whether the current attack can hit at this moment, which is only in the hit window of its animation.
     * @returns {boolean} True during the hit window.
     */
    isAttackActive(){
        const ATTACK_DATA = this.settings.attacks[this.attackName];
        return this.state === 'attack' && this.stateTicks >= ATTACK_DATA.hitStartTick && this.stateTicks < ATTACK_DATA.hitEndTick;
    }

    /**
     * Runs a tick of the attack state: moves the attack on, plays its animation once, hits once during the hit
     * window and ends the attack when its time is over.
     * @returns {void}
     */
    updateAttack(){
        const ATTACK_DATA = this.settings.attacks[this.attackName];
        this.advanceAttack(ATTACK_DATA);
        this.showProgressState(this.attackName, this.stateTicks, ATTACK_DATA.ticks);
        if(this.isAttackActive() && !this.hasAttackHit){
            this.hasAttackHit = this.hitWithAttack(ATTACK_DATA);
        }
        this.finishAttack(ATTACK_DATA);
    }

    /**
     * Handles the movement during an attack: the knight looks at the character before the hit window, and the
     * walking thrust moves him forward unless there is a gap ahead.
     * @param {object} attack - Settings of the current attack.
     * @returns {void}
     */
    advanceAttack(attack){
        if(this.stateTicks < attack.hitStartTick){
            this.faceCharacter();
        }
        if(this.attackName === 'walkThrust' && this.getGapAhead() === 0){
            this.moveForward();
        }
    }

    /**
     * Ends the attack when its time is over: starts its waiting time and goes back to chasing.
     * @param {object} attack - Settings of the current attack.
     * @returns {void}
     */
    finishAttack(attack){
        if(this.stateTicks >= attack.ticks){
            this.cooldownsLeft[this.attackName] = attack.cooldownTicks;
            this.startChase();
        }
    }

    /**
     * Hits the character with the current attack: the aura if the character is inside the radius, any other
     * attack if its zone touches the character.
     * @param {object} attack - Settings of the current attack, with its damage.
     * @returns {boolean} True if the character was hit.
     */
    hitWithAttack(attack){
        if(this.attackName === 'aura'){
            return this.isCharacterInRadius() && this.hurtCharacter(attack.damage);
        }
        return this.hitCharacter(this.getAttackZone(), attack.damage);
    }

    /**
     * Returns the hit zone of the current attack: the zone above him for the slash upwards, otherwise the
     * zone in front of him.
     * @returns {{x: number, y: number, width: number, height: number}} The zone rectangle.
     */
    getAttackZone(){
        return this.attackName === 'upSlash' ? this.getUpZone() : this.getFrontZone(this.attackName);
    }

    /**
     * Draws the sight area and, while an attack can hit, its hit zone or the circle of the aura, used while
     * debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
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

    /**
     * Draws the radius of the aura as an orange circle around the middle of the knight, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawAuraCircle(ctx){
        const BOSS_RECT = this.getHitbox();
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(getRectCenterX(BOSS_RECT), BOSS_RECT.y + BOSS_RECT.height / 2, this.settings.attacks.aura.reachTiles * TILE_SIZE, 0, Math.PI * 2);
        ctx.stroke();
    }
}
