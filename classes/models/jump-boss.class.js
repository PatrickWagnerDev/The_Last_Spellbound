const APEX_SPEED_LIMIT = 2;

/**
 * Base class of the demon and, through the knight attacks, of the dark knight. On top of the boss behavior it
 * adds the sprint, which makes the boss faster for a while, and the jump over gaps, and it stops at edges it
 * cannot jump over.
 */
class JumpBoss extends Boss {
    sprintCooldownLeft = 0;
    sprintTicksLeft = 0;
    landTicks = 0;

    /**
     * Builds the boss and remembers which frames of the jump sprite sheet belong to which jump phase.
     * @param {number} column - Map column of the boss.
     * @param {number} row - Map row of the boss.
     * @param {object} config - Config of the boss type, including its jump frames.
     */
    constructor(column, row, config){
        super(column, row, config);
        this.jumpFrames = config.jumpFrames;
    }

    /**
     * Returns the update methods of the states, with the jump state added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), jump: () => this.updateJump() };
    }

    /**
     * Counts the waiting time until the next sprint down by one tick.
     * @returns {void}
     */
    updateCooldowns(){
        this.sprintCooldownLeft = tickDown(this.sprintCooldownLeft);
    }

    /**
     * Reacts to a hit with the normal knockback, except during a jump.
     * @param {MovableObject} source - The object that caused the hit.
     * @returns {void}
     */
    reactToHit(source){
        if(this.state !== 'jump'){
            super.reactToHit(source);
        }
    }

    /**
     * Tells whether the boss is sprinting.
     * @returns {boolean} True while the sprint time has not run out.
     */
    isSprinting(){
        return this.sprintTicksLeft > 0;
    }

    /**
     * Measures the gap ahead of the boss in tiles, counting up to one more than it can jump.
     * @returns {number} 0 if there is ground ahead, otherwise the width of the gap in tiles, which is one
     * above the jump limit if the gap is too wide.
     */
    getGapAhead(){
        const PROBE_Y = this.y + this.height + 1;
        let gapTiles = 0;
        while(gapTiles <= this.settings.maxJumpGapTiles && !this.world.level.isWalkableAt(this.getProbeX(EDGE_PROBE_DISTANCE + gapTiles * TILE_SIZE), PROBE_Y)){
            gapTiles++;
        }
        return gapTiles;
    }

    /**
     * Tells whether the boss has to turn around: there is a gap ahead.
     * @returns {boolean} True if a gap lies ahead.
     */
    shouldTurn(){
        return this.getGapAhead() > 0;
    }

    /**
     * Patrols like any boss, always at the normal walking speed.
     * @returns {void}
     */
    updatePatrol(){
        this.speed = this.settings.speed;
        super.updatePatrol();
    }

    /**
     * Runs when the boss has lost the character: it looks to the side where the character vanished and
     * patrols at once.
     * @returns {void}
     */
    loseSight(){
        this.otherDirection = this.vanishSide > 0;
        this.setState('patrol');
    }

    /**
     * Walks towards the character depending on the gap ahead: it walks if there is ground, jumps over a gap
     * it can jump and waits at the edge of a gap that is too wide.
     * @returns {void}
     */
    walkTowardCharacter(){
        const GAP_TILES = this.getGapAhead();
        if(GAP_TILES === 0){
            this.moveTowardCharacter();
        } else if(GAP_TILES <= this.settings.maxJumpGapTiles){
            this.setState('jump');
        } else {
            this.waitAtEdge();
        }
    }

    /**
     * Stands at an edge it cannot cross: it shows the move animation without moving and lets a running sprint
     * run out.
     * @returns {void}
     */
    waitAtEdge(){
        this.showMoveAnimation();
        if(this.isSprinting()){
            this.updateSprint();
        }
    }

    /**
     * Walks or sprints one step towards the character, unless it is already very close.
     * @returns {void}
     */
    moveTowardCharacter(){
        if(Math.abs(this.getCharacterOffset()) <= 4){
            this.showLoopState('walk', this.settings.animationFps);
            return;
        }
        this.updateSprint();
        this.speed = this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
        this.showMoveAnimation();
        this.moveForward();
    }

    /**
     * Shows the sprint animation while sprinting and the walk animation otherwise.
     * @returns {void}
     */
    showMoveAnimation(){
        const IS_SPRINTING = this.isSprinting();
        this.showLoopState(IS_SPRINTING ? 'run' : 'walk', IS_SPRINTING ? this.settings.sprintFps : this.settings.animationFps);
    }

    /**
     * Runs one tick of the sprint: counts it down and starts the waiting time when it ends, or starts a new
     * sprint if the waiting time is over and the character is far enough away.
     * @returns {void}
     */
    updateSprint(){
        if(this.isSprinting()){
            this.sprintTicksLeft--;
            this.sprintCooldownLeft = this.sprintTicksLeft === 0 ? this.settings.sprintCooldownTicks : 0;
        } else if(this.sprintCooldownLeft === 0 && Math.abs(this.getCharacterOffset()) > this.settings.sprintMinTiles * TILE_SIZE){
            this.sprintTicksLeft = this.settings.sprintTicks;
        }
    }

    /**
     * Ends a running sprint at once and starts the waiting time until the next one.
     * @returns {void}
     */
    endSprint(){
        if(this.isSprinting()){
            this.sprintTicksLeft = 0;
            this.sprintCooldownLeft = this.settings.sprintCooldownTicks;
        }
    }

    /**
     * Hurts the character if it can be hurt.
     * @param {number} damage - Damage to deal.
     * @returns {boolean} True if the character was hit.
     */
    hurtCharacter(damage){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt()){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(damage, this);
        return true;
    }

    /**
     * Hurts the character if an attack zone touches its contact box.
     * @param {{x: number, y: number, width: number, height: number}} rect - The attack zone in world coordinates.
     * @param {number} damage - Damage to deal.
     * @returns {boolean} True if the character was hit.
     */
    hitCharacter(rect, damage){
        return areRectsOverlapping(this.world.character.getContactRect(), rect) && this.hurtCharacter(damage);
    }

    /**
     * Runs a tick of the jump state: the wind-up, the take-off, the flight and the landing.
     * @returns {void}
     */
    updateJump(){
        if(this.stateTicks < this.settings.jumpWindupTicks){
            this.showFrameState('jump', this.getWindupFrame());
        } else if(this.stateTicks === this.settings.jumpWindupTicks){
            this.launchJump();
        } else if(!this.onGround){
            this.flyJump();
        } else {
            this.landJump();
        }
    }

    /**
     * Picks the frame for the wind-up: the wind-up frames spread over its time.
     * @returns {number} Index of the frame in the jump sprite sheet.
     */
    getWindupFrame(){
        const WINDUP_FRAMES = this.jumpFrames.windup;
        return WINDUP_FRAMES[getProgressFrame(this.stateTicks, this.settings.jumpWindupTicks, WINDUP_FRAMES.length)];
    }

    /**
     * Picks the frame for the flight: rising, at the top or falling.
     * @returns {number} Index of the frame in the jump sprite sheet.
     */
    getAirFrame(){
        return pickAirFrame(this.jumpFrames, this.speedY, APEX_SPEED_LIMIT);
    }

    /**
     * Picks the frame for the landing: the landing frames spread over its time.
     * @returns {number} Index of the frame in the jump sprite sheet.
     */
    getLandFrame(){
        const LAND_FRAMES = this.jumpFrames.land;
        return LAND_FRAMES[getProgressFrame(this.landTicks, this.settings.jumpLandTicks, LAND_FRAMES.length)];
    }

    /**
     * Makes the boss take off: sets the upward speed, leaves the ground, restarts the landing counter and
     * plays the jump sound.
     * @returns {void}
     */
    launchJump(){
        this.speedY = this.settings.jumpPower;
        this.onGround = false;
        this.landTicks = 0;
        this.showFrameState('jump', this.getAirFrame());
        soundManager.playSound('jump');
    }

    /**
     * Runs a tick of the flight: moves the boss forward at the jump speed and shows the flight frame.
     * @returns {void}
     */
    flyJump(){
        this.speed = this.settings.jumpSpeed;
        this.moveForward();
        this.showFrameState('jump', this.getAirFrame());
    }

    /**
     * Runs a tick of the landing: shows the landing frame, plays the landing sound at the first tick and ends
     * the jump when the landing time is over.
     * @returns {void}
     */
    landJump(){
        this.landTicks++;
        this.showFrameState('jump', this.getLandFrame());
        if(this.landTicks === 1){
            soundManager.playSound('land');
        }
        if(this.landTicks >= this.settings.jumpLandTicks){
            this.endJump();
        }
    }

    /**
     * Runs when the jump has ended: the boss goes on chasing. Subclasses can do something else.
     * @returns {void}
     */
    endJump(){
        this.startChase();
    }
}
