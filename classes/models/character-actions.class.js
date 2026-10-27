const ATTACK_HITBOX = { offsetX: 79, offsetY: 65, width: 51, height: 50 };

/**
 * Actions of the character: the roll, the sword attack and the fireball spell with their durations, waiting
 * times and keys, and the energy the fireball costs. It also changes some methods of the movement so that
 * rolling, being hurt and acting affect it. Character builds on it.
 */
class CharacterActions extends CharacterMovement{
    rollTicksLeft = 0;
    rollCooldownLeft = 0;
    attackTicksLeft = 0;
    attackHits = [];
    castTicksLeft = 0;
    castCooldownLeft = 0;
    maxEnergy = GAME_SETTINGS.energy.maxCharges;
    energy = GAME_SETTINGS.energy.startCharges;

    /**
     * Runs the fight logic of one tick: the sword attack and then the fireball spell.
     * @returns {void}
     */
    updateCombat(){
        this.handleAttack();
        this.updateAttack();
        this.handleCast();
        this.updateCast();
    }

    /**
     * Sets the speed: the roll speed while rolling, otherwise the normal walking speed.
     * @returns {void}
     */
    updateSpeed(){
        if(this.isRolling()){
            this.speed = this.settings.rollSpeed;
            return;
        }
        super.updateSpeed();
    }

    /**
     * Tells whether the player gives any input, now including roll, attack and spell.
     * @returns {boolean} True if any key of the character is pressed.
     */
    hasInput(){
        return super.hasInput() || this.wantsRoll() || this.wantsAttack() || this.wantsCast();
    }

    /**
     * Tells whether walking with the keys is blocked, now also while hurt and while rolling.
     * @returns {boolean} True if the keys do not move the character.
     */
    isMovementLocked(){
        return super.isMovementLocked() || this.isHurt() || this.isRolling();
    }

    /**
     * Tells whether the character stands ready on the ground, now also not hurt and not rolling.
     * @returns {boolean} True if a new jump or roll may start.
     */
    isReadyOnGround(){
        return super.isReadyOnGround() && !this.isHurt() && !this.isRolling();
    }

    /**
     * Tells whether the grace time for a late jump runs, now also not hurt and not rolling.
     * @returns {boolean} True if a jump in the air is allowed.
     */
    isInCoyoteTime(){
        return super.isInCoyoteTime() && !this.isHurt() && !this.isRolling();
    }

    /**
     * Tells whether the character is busy: rolling, attacking, casting or hurt.
     * @returns {boolean} True if the idle time must not count.
     */
    isBusy(){
        return this.isRolling() || this.isAttacking() || this.isCasting() || this.isHurt();
    }

    /**
     * Tells whether a new attack or spell may start: the character is not attacking, casting, rolling or hurt.
     * @returns {boolean} True if no action or hurt phase is running.
     */
    isActionFree(){
        return !this.isAttacking() && !this.isCasting() && !this.isRolling() && !this.isHurt();
    }

    /**
     * Tells whether the character is rolling.
     * @returns {boolean} True while the roll time has not run out.
     */
    isRolling(){
        return this.rollTicksLeft > 0;
    }

    /**
     * Returns how many ticks the roll has already lasted.
     * @returns {number} Ticks since the roll started.
     */
    getRollElapsed(){
        return this.settings.rollTicks - this.rollTicksLeft;
    }

    /**
     * Tells whether the roll key (down arrow) is pressed.
     * @returns {boolean} True if the player wants to roll.
     */
    wantsRoll(){
        return this.world.keyboard.DOWN;
    }

    /**
     * Counts the waiting time between rolls down and starts a roll if the key is pressed, the character is
     * ready on the ground and the waiting time is over.
     * @returns {void}
     */
    handleRoll(){
        this.rollCooldownLeft = tickDown(this.rollCooldownLeft);
        if(this.wantsRoll() && this.isReadyOnGround() && this.rollCooldownLeft === 0){
            this.startRoll();
        }
    }

    /**
     * Starts the roll: sets its duration, cancels a running attack or spell and plays the roll sound.
     * @returns {void}
     */
    startRoll(){
        this.rollTicksLeft = this.settings.rollTicks;
        this.attackTicksLeft = 0;
        this.castTicksLeft = 0;
        soundManager.playSound('roll');
    }

    /**
     * Runs one tick of the roll: moves the character forward and starts the waiting time when the roll ends.
     * @returns {void}
     */
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

    /**
     * Starts a jump like the movement does, but a new press of the jump key first ends a running roll.
     * @returns {void}
     */
    handleJump(){
        const JUST_PRESSED = this.isJumpNewlyPressed();
        if(this.isRolling() && JUST_PRESSED){
            this.endRoll();
        }
        super.handleJump();
    }

    /**
     * Tells whether a jump key (up arrow or space) was pressed just now.
     * @returns {boolean} True only at the first tick of a press.
     */
    isJumpNewlyPressed(){
        const UP_PRESSED = this.isNewPress('UP');
        const SPACE_PRESSED = this.isNewPress('SPACE');
        return UP_PRESSED || SPACE_PRESSED;
    }

    /**
     * Ends the roll at once and starts the waiting time until the next roll.
     * @returns {void}
     */
    endRoll(){
        this.rollTicksLeft = 0;
        this.rollCooldownLeft = this.settings.rollCooldownTicks;
    }

    /**
     * Tells whether the character is attacking.
     * @returns {boolean} True while the attack time has not run out.
     */
    isAttacking(){
        return this.attackTicksLeft > 0;
    }

    /**
     * Tells whether the attack key is pressed.
     * @returns {boolean} True if the player wants to attack.
     */
    wantsAttack(){
        return this.world.keyboard.ATTACK;
    }

    /**
     * Starts the sword attack when the attack key was pressed just now and no other action is running.
     * @returns {void}
     */
    handleAttack(){
        const JUST_PRESSED = this.isNewPress('ATTACK');
        const CAN_ATTACK = this.isActionFree();
        if(JUST_PRESSED && CAN_ATTACK){
            this.startAttack();
        }
    }

    /**
     * Starts the attack: sets its duration, forgets the enemies hit so far and plays the attack sound.
     * @returns {void}
     */
    startAttack(){
        this.attackTicksLeft = this.settings.attackTicks;
        this.attackHits = [];
        soundManager.playSound('attack');
    }

    /**
     * Returns how many ticks the attack has already lasted.
     * @returns {number} Ticks since the attack started.
     */
    getAttackElapsed(){
        return this.settings.attackTicks - this.attackTicksLeft;
    }

    /**
     * Tells whether the sword can hit at this moment, which is only in a short part of the attack animation.
     * @returns {boolean} True during the hit window of the attack.
     */
    isAttackActive(){
        const ELAPSED_TICKS = this.getAttackElapsed();
        return this.isAttacking() && ELAPSED_TICKS >= this.settings.attackHitStartTick && ELAPSED_TICKS < this.settings.attackHitEndTick;
    }

    /**
     * Runs one tick of the attack: hits enemies during the hit window and counts the attack time down.
     * @returns {void}
     */
    updateAttack(){
        if(!this.isAttacking()){
            return;
        }
        if(this.isAttackActive()){
            this.hitEnemies();
        }
        this.attackTicksLeft--;
    }

    /**
     * Hits every living enemy that touches the sword box. One attack hits an enemy only once.
     * @returns {void}
     */
    hitEnemies(){
        const ATTACK_RECT = this.getBoxRect(ATTACK_HITBOX);
        this.world.level.getCollidables().forEach(enemy => {
            if(!this.attackHits.includes(enemy) && enemy.isOverlapping(ATTACK_RECT)){
                enemy.receiveHit(GAME_SETTINGS.combat.hitDamage, this);
                this.attackHits.push(enemy);
            }
        });
    }

    /**
     * Draws the sword box while it can hit, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawAttackBox(ctx){
        if(this.isAttackActive()){
            this.drawRect(ctx, this.getBoxRect(ATTACK_HITBOX), 'orange');
        }
    }

    /**
     * Tells whether the character is casting the fireball spell.
     * @returns {boolean} True while the cast time has not run out.
     */
    isCasting(){
        return this.castTicksLeft > 0;
    }

    /**
     * Returns how many ticks the cast has already lasted.
     * @returns {number} Ticks since the cast started.
     */
    getCastElapsed(){
        return this.settings.castTicks - this.castTicksLeft;
    }

    /**
     * Tells whether the fireball key is pressed.
     * @returns {boolean} True if the player wants to cast.
     */
    wantsCast(){
        return this.world.keyboard.SHOOT;
    }

    /**
     * Starts the fireball spell when the key was pressed just now, no other action runs, the waiting time is
     * over and there is energy. Without energy a warning sound plays.
     * @returns {void}
     */
    handleCast(){
        const JUST_PRESSED = this.isNewPress('SHOOT');
        const CAN_CAST = this.isActionFree() && this.castCooldownLeft === 0 && this.energy >= 1;
        this.castCooldownLeft = tickDown(this.castCooldownLeft);
        if(JUST_PRESSED && CAN_CAST){
            this.startCast();
        } else if(JUST_PRESSED && this.energy < 1){
            soundManager.playSound('noEnergy');
        }
    }

    /**
     * Starts the spell: sets its duration and plays the cast sound.
     * @returns {void}
     */
    startCast(){
        this.castTicksLeft = this.settings.castTicks;
        soundManager.playSound('cast');
    }

    /**
     * Runs one tick of the spell. At the release tick of the animation the fireball is created, the waiting
     * time starts and one energy is used.
     * @returns {void}
     */
    updateCast(){
        if(!this.isCasting()){
            return;
        }
        if(this.getCastElapsed() === this.settings.castReleaseTick){
            this.world.addProjectile(new Fireball(this));
            this.castCooldownLeft = this.settings.castCooldownTicks;
            this.energy -= 1;
        }
        this.castTicksLeft--;
    }

    /**
     * Adds energy, but not above the maximum.
     * @param {number} amount - Energy to add.
     * @returns {void}
     */
    addEnergy(amount){
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    }
}
