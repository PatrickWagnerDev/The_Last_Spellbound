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
 * The dark knight, the boss of level three. On top of the attacks he chases at once without a sneer, follows
 * the character onto platforms with the map of ways, walks back to the ground when he has lost the character
 * and makes a sound with his steps.
 */
class DarkKnight extends KnightAttacks {
    lastStepFrame = -1;
    currentNode = null;
    afterJumpState = 'chase';

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
     * Returns the update methods of the states, with the way back to the ground added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), return: () => this.updateReturn() };
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
}
