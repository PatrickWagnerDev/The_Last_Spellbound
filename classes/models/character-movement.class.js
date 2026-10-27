/**
 * Movement of the character: walking with the keys, jumping with crouch, flight and landing, the short extra
 * time to jump after leaving a platform, and counting the time without input. It is the lowest of the three
 * classes that make up the character, the actions (CharacterActions) and the whole character (Character)
 * build on it.
 */
class CharacterMovement extends MovableObject{
    settings = GAME_SETTINGS.character;
    width = this.settings.width;
    height = this.settings.height;
    speed = this.settings.speed;
    jumpPhase = 'none';
    coyoteTicksLeft = 0;
    phaseTicks = 0;
    idleTicks = 0;
    previousKeys = {};

    /**
     * Places the character on the start cell of the level, with its feet on the bottom edge of the cell.
     * @param {{column: number, row: number}} start - Start cell from the map.
     * @returns {void}
     */
    placeAt(start){
        this.x = start.column * TILE_SIZE;
        this.y = (start.row + 1) * TILE_SIZE - this.height;
    }

    /**
     * Sets the walking speed: the normal one on the ground, a faster one in the air.
     * @returns {void}
     */
    updateSpeed(){
        this.speed = this.onGround ? this.settings.speed : this.settings.speed * this.settings.airSpeedFactor;
    }

    /**
     * Tells whether the left or the right key is pressed.
     * @returns {boolean} True if the player wants to walk.
     */
    isWalking(){
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    /**
     * Tells whether the jump key (up arrow or space) is pressed.
     * @returns {boolean} True if the player wants to jump.
     */
    wantsJump(){
        return this.world.keyboard.UP || this.world.keyboard.SPACE;
    }

    /**
     * Tells whether the player is giving any input. Subclasses add more inputs.
     * @returns {boolean} True if the player walks or wants to jump.
     */
    hasInput(){
        return this.isWalking() || this.wantsJump();
    }

    /**
     * Tells whether a key was pressed just now, which means it was not pressed at the last call. It remembers
     * the state of the key, so it has to be called once per tick and key.
     * @param {string} keyName - Name of the key in the keyboard, for example 'UP' or 'SHOOT'.
     * @returns {boolean} True only at the first tick of a press.
     */
    isNewPress(keyName){
        const IS_PRESSED = this.world.keyboard[keyName];
        const IS_NEW = IS_PRESSED && !this.previousKeys[keyName];
        this.previousKeys[keyName] = IS_PRESSED;
        return IS_NEW;
    }

    /**
     * Tells whether walking with the keys is blocked, which is the case while crouching before a jump and
     * while landing. Subclasses add more states.
     * @returns {boolean} True if the keys do not move the character.
     */
    isMovementLocked(){
        return this.jumpPhase === 'crouch' || this.jumpPhase === 'land';
    }

    /**
     * Tells whether the character stands on the ground and is not in any jump phase. Subclasses add more
     * conditions.
     * @returns {boolean} True if a new jump may start with the crouch.
     */
    isReadyOnGround(){
        return this.onGround && this.jumpPhase === 'none';
    }

    /**
     * Tells whether the character is busy with an action. Subclasses override it, it is always false here.
     * @returns {boolean} True if the idle time must not count.
     */
    isBusy(){
        return false;
    }

    /**
     * Tells whether the character may still jump a moment after it left a platform. Subclasses add conditions.
     * @returns {boolean} True while the grace time runs and the character is in the air.
     */
    isInCoyoteTime(){
        return this.coyoteTicksLeft > 0 && this.jumpPhase === 'air';
    }

    /**
     * Tells whether a jump may start now.
     * @returns {boolean} True if the character is ready on the ground or in the grace time.
     */
    canJump(){
        return this.isReadyOnGround() || this.isInCoyoteTime();
    }

    /**
     * Moves the character with the arrow keys and turns it in the direction of the key, unless the movement
     * is locked.
     * @returns {void}
     */
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

    /**
     * Keeps the character inside the level between the left wall and the end of the level.
     * @returns {void}
     */
    limitToWall(){
        const MAX_X = this.world.level.width - this.width + this.settings.rightWallOffset;
        this.x = clampValue(this.x, this.settings.leftWallX, MAX_X);
    }

    /**
     * Starts a jump if the jump key is pressed and a jump is possible.
     * @returns {void}
     */
    handleJump(){
        if(this.wantsJump() && this.canJump()){
            this.startJump();
        }
    }

    /**
     * Starts a jump: with the crouch if the character stands on the ground, at once if it is already in the
     * air in the grace time.
     * @returns {void}
     */
    startJump(){
        if(this.isReadyOnGround()){
            this.startPhase('crouch');
        } else {
            this.launchJump();
        }
    }

    /**
     * Keeps the grace time up to date: it is full on the ground and counts down in the air.
     * @returns {void}
     */
    updateCoyoteTime(){
        this.coyoteTicksLeft = this.onGround ? this.settings.coyoteTicks : tickDown(this.coyoteTicksLeft);
    }

    /**
     * Switches to a jump phase and restarts its tick counter.
     * @param {string} phaseName - 'none', 'crouch', 'air' or 'land'.
     * @returns {void}
     */
    startPhase(phaseName){
        this.jumpPhase = phaseName;
        this.phaseTicks = 0;
    }

    /**
     * Makes the character take off: sets the upward speed, ends the grace time, switches to the air phase and
     * plays the jump sound.
     * @returns {void}
     */
    launchJump(){
        this.speedY = this.settings.jumpSpeed;
        this.coyoteTicksLeft = 0;
        this.startPhase('air');
        soundManager.playSound('jump');
    }

    /**
     * Starts the landing phase and plays the landing sound.
     * @returns {void}
     */
    startLanding(){
        this.startPhase('land');
        soundManager.playSound('land');
    }

    /**
     * Runs one tick of the jump sequence: crouch, take-off, flight, landing, and back to no phase.
     * @returns {void}
     */
    updateJumpPhase(){
        this.phaseTicks++;
        if(!this.onGround && this.jumpPhase !== 'air'){
            this.startPhase('air');
        } else if(this.jumpPhase === 'crouch' && this.phaseTicks >= this.settings.crouchTicks){
            this.launchJump();
        } else if(this.jumpPhase === 'air' && this.onGround){
            this.startLanding();
        } else if(this.jumpPhase === 'land' && this.phaseTicks >= this.settings.landTicks){
            this.startPhase('none');
        }
    }

    /**
     * Picks the jump picture for the current phase: the crouch and landing pictures follow the time of the
     * phase, in the air the picture depends on the flight.
     * @returns {number} Index of the frame in the jump sprite sheet.
     */
    getJumpFrame(){
        const JUMP_FRAMES = this.traits.jumpFrames;
        if(this.jumpPhase === 'crouch'){
            return JUMP_FRAMES.crouch[getProgressFrame(this.phaseTicks, this.settings.crouchTicks, JUMP_FRAMES.crouch.length)];
        }
        if(this.jumpPhase === 'land'){
            return JUMP_FRAMES.land[getProgressFrame(this.phaseTicks, this.settings.landTicks, JUMP_FRAMES.land.length)];
        }
        return this.getAirFrame();
    }

    /**
     * Picks the picture for the flight: rising, at the top or falling.
     * @returns {number} Index of the frame in the jump sprite sheet.
     */
    getAirFrame(){
        return pickAirFrame(this.traits.jumpFrames, this.speedY, this.settings.apexSpeed);
    }

    /**
     * Counts the ticks without input, the counter restarts at any input, jump phase or action.
     * @returns {void}
     */
    updateIdleTicks(){
        if(this.hasInput() || this.jumpPhase !== 'none' || this.isBusy()){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }
}
