const HITBOX_STANDING = { offsetX: 39, offsetY: 73, width: 40, height: 77 };
const HITBOX_WALKING = { offsetX: 52, offsetY: 73, width: 40, height: 77 };
const CONTACT_STANDING = { offsetX: 45, offsetY: 75, width: 28, height: 75 };
const CONTACT_WALKING = { offsetX: 58, offsetY: 75, width: 28, height: 75 };
const STANDING_STATES = ['idle', 'jump', 'hurt', 'dead', 'attack', 'cast'];

/**
 * The player character. It adds to movement and actions what is needed to play: health and damage with grace
 * time and knockback, collecting items, touching enemies, falling into holes, dying, looping sounds and the
 * choice of the animation.
 */
class Character extends CharacterActions{
    maxHealth = this.settings.maxHealth;
    health = this.maxHealth;
    invincibleTicks = 0;
    keyCount = 0;

    /**
     * Creates the character of the chosen figure, loads its images and starts its game loop.
     * @param {string} [characterId] - 'fireWizard' (default) or 'lightningMage'.
     */
    constructor(characterId = 'fireWizard'){
        super();
        this.sprites = CHARACTER_SPRITES[characterId];
        this.traits = CHARACTER_TRAITS[characterId];
        this.hitbox = HITBOX_STANDING;
        this.contactBox = CONTACT_STANDING;
        this.supportBox = HITBOX_STANDING;
        this.frameCount = this.sprites.idle.frames;
        this.setupSprites(Object.values(this.sprites).map(sprite => sprite.path));
        this.startAnimation();
    }

    /**
     * Runs one tick of the character: first the status, then, if it is alive, the movement, the actions, the
     * physics and the animation. A dead character only plays its death.
     * @returns {void}
     */
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

    /**
     * Updates the status for one tick: grace time, hurt phase, contact with enemies and falling out of the level.
     * @returns {void}
     */
    updateStatus(){
        this.updateInvincibility();
        this.updateHurt();
        this.checkCollisions();
        this.checkFall();
    }

    /**
     * Kills the character at once and stops its loop if it has fallen out of the level.
     * @returns {void}
     */
    checkFall(){
        if(this.hasFallenOut()){
            this.dieByFall();
            this.stopAnimation();
        }
    }

    /**
     * Runs one tick of a dead character: it still falls to the ground, its death animation plays and the
     * looping sounds stop.
     * @returns {void}
     */
    updateDeadState(){
        this.applyGravity();
        this.limitToWall();
        this.advanceDeath('dead');
        this.stopLoopSounds();
    }

    /**
     * Tells whether the character stands still, which is while the game is paused, and stops the looping
     * sounds in that case.
     * @returns {boolean} True if the tick is skipped.
     */
    isFrozen(){
        const IS_FROZEN = super.isFrozen();
        if(IS_FROZEN){
            this.stopLoopSounds();
        }
        return IS_FROZEN;
    }

    /**
     * Stops the game loop of the character and its looping sounds.
     * @returns {void}
     */
    stopAnimation(){
        super.stopAnimation();
        this.stopLoopSounds();
    }

    /**
     * Runs the movement of one tick: speed, walking, roll, level borders, jump and the start of a roll.
     * @returns {void}
     */
    updateMovement(){
        this.updateSpeed();
        this.moveByKeyboard();
        this.updateRoll();
        this.limitToWall();
        this.handleJump();
        this.handleRoll();
    }

    /**
     * Runs the actions of one tick: attack and spell, and collecting items.
     * @returns {void}
     */
    updateActions(){
        this.updateCombat();
        this.checkItems();
    }

    /**
     * Collects every item the character can collect and touches.
     * @returns {void}
     */
    checkItems(){
        this.world.level.items.forEach(item => {
            if(item.isCollectable(this) && this.isColliding(item)){
                item.collectItem(this);
            }
        });
    }

    /**
     * Runs the physics of one tick: gravity, the support box, the grace time for a late jump and the jump phase.
     * @returns {void}
     */
    updatePhysics(){
        this.applyGravity();
        if(this.onGround){
            this.supportBox = this.hitbox;
        }
        this.updateCoyoteTime();
        this.updateJumpPhase();
    }

    /**
     * Runs the animation of one tick: counts the idle time, picks the picture and updates the looping sounds.
     * @returns {void}
     */
    updateAnimation(){
        this.updateIdleTicks();
        this.updateSprite();
        this.updateLoopSounds();
    }

    /**
     * Turns the looping sounds on or off: the steps while the character walks, the snoring while it sleeps.
     * @returns {void}
     */
    updateLoopSounds(){
        this.toggleLoop('walk', this.getSpriteState() === 'walk');
        this.toggleLoop('snore', this.isSleeping());
    }

    /**
     * Starts a looping sound or stops it.
     * @param {string} soundName - Name of the sound in the sound manager.
     * @param {boolean} isActive - True to play the sound, false to stop it.
     * @returns {void}
     */
    toggleLoop(soundName, isActive){
        if(isActive){
            soundManager.startLoop(soundName);
        } else {
            soundManager.stopLoop(soundName);
        }
    }

    /**
     * Tells whether the character sleeps: it has rested without input for the delay plus the duration of
     * the sitting animation, and the game has not ended.
     * @returns {boolean} True if the snoring has to play.
     */
    isSleeping(){
        const SIT_TICKS = this.settings.restDelayTicks + this.settings.restTicks;
        return !this.world.isGameEnded && this.getSpriteState() === 'rest' && this.idleTicks >= SIT_TICKS;
    }

    /**
     * Stops the steps and the snoring.
     * @returns {void}
     */
    stopLoopSounds(){
        soundManager.stopLoop('walk');
        soundManager.stopLoop('snore');
    }

    /**
     * Counts the grace time after a hit down by one tick.
     * @returns {void}
     */
    updateInvincibility(){
        this.invincibleTicks = tickDown(this.invincibleTicks);
    }

    /**
     * Checks the character against every living enemy.
     * @returns {void}
     */
    checkCollisions(){
        this.world.level.getCollidables().forEach(object => this.handleCollision(object));
    }

    /**
     * Hurts the character if a hurt box of the enemy touches its contact box.
     * @param {MovableObject} object - A living object of the level.
     * @returns {void}
     */
    handleCollision(object){
        if(object instanceof Enemy && object.touchesRect(this.getContactRect())){
            this.receiveHit(GAME_SETTINGS.combat.hitDamage, object);
        }
    }

    /**
     * Tells whether the character can take damage: no grace time, not dead and not rolling.
     * @returns {boolean} True if a hit would hurt.
     */
    canBeHurt(){
        return this.invincibleTicks === 0 && !this.isDead() && !this.isRolling();
    }

    /**
     * Takes a hit: if the character can be hurt it loses health, gets its grace time, starts the hurt phase and
     * plays the hurt sound.
     * @param {number} damage - Damage to take.
     * @param {MovableObject} source - The object that caused the hit, the knockback points away from it.
     * @returns {void}
     */
    receiveHit(damage, source){
        if(!this.canBeHurt()){
            return;
        }
        this.takeDamage(damage);
        this.invincibleTicks = GAME_SETTINGS.combat.invincibleTicks;
        this.startHurt(source);
        soundManager.playSound('hurt');
    }

    /**
     * Starts the hurt phase: the knockback, a look towards the source, and it cancels a running attack, spell,
     * crouch or landing.
     * @param {MovableObject} source - The object that caused the hit.
     * @returns {void}
     */
    startHurt(source){
        this.startKnockback(source);
        this.otherDirection = this.knockbackDirection > 0;
        this.attackTicksLeft = 0;
        this.castTicksLeft = 0;
        if(this.jumpPhase === 'crouch' || this.jumpPhase === 'land'){
            this.startPhase('none');
        }
    }

    /**
     * Returns the duration of the death animation.
     * @returns {number} Duration in ticks.
     */
    getDeathTicks(){
        return this.settings.deathTicks;
    }

    /**
     * Returns the three x positions with which the character feels the ground: the middle of its support box
     * and one on each side at the edge tolerance.
     * @returns {number[]} The x positions of the support points.
     */
    getSupportXs(){
        const CENTER_X = getRectCenterX(this.getBoxRect(this.supportBox));
        const EDGE_TOLERANCE = this.settings.edgeTolerance;
        return [CENTER_X - EDGE_TOLERANCE, CENTER_X, CENTER_X + EDGE_TOLERANCE];
    }

    /**
     * Decides which animation state is shown. The states are checked in order of priority: hurt, roll, attack,
     * cast, jump, walk, rest, and idle if none applies.
     * @returns {string} The key of the state in this.sprites.
     */
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

    /**
     * Calculates the speed of the walk animation so that one walk cycle lasts the same time for every figure.
     * @returns {number} Animation speed in frames per second.
     */
    getWalkFps(){
        return this.sprites.walk.frames / (this.settings.walkCycleTicks / TICKS_PER_SECOND);
    }

    /**
     * Returns the hitbox for a state: the standing one for idle, jump, hurt, dead, attack and cast, the walking
     * one for all others, because the figure sits further right in the walking pictures.
     * @param {string} stateName - Key of the state in this.sprites.
     * @returns {{offsetX: number, offsetY: number, width: number, height: number}} The hitbox box.
     */
    getStateHitbox(stateName){
        return STANDING_STATES.includes(stateName) ? HITBOX_STANDING : HITBOX_WALKING;
    }

    /**
     * Sets the hitbox and the contact box that fit the shown state, the standing or the walking pair.
     * @param {string} stateName - Key of the state that is shown.
     * @returns {void}
     */
    applyStateHitbox(stateName){
        this.hitbox = this.getStateHitbox(stateName);
        this.contactBox = STANDING_STATES.includes(stateName) ? CONTACT_STANDING : CONTACT_WALKING;
    }

    /**
     * Draws the current frame, shifted by the jump shift of the figure.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {number} drawX - Horizontal position to draw at, this.x or 0 when the context is mirrored.
     * @returns {void}
     */
    drawFrame(ctx, drawX){
        super.drawFrame(ctx, drawX + this.getJumpShift());
    }

    /**
     * Returns how far the jump picture is shifted sideways so that the body stays in the hitbox. It is 0 for
     * figures without jump shifts and outside of the jump animation.
     * @returns {number} Shift in drawing pixels.
     */
    getJumpShift(){
        const JUMP_SHIFTS = this.traits.jumpShifts;
        const IS_JUMPING = this.currentPath === this.sprites.jump.path;
        return JUMP_SHIFTS && IS_JUMPING ? JUMP_SHIFTS[this.currentFrame] * this.width / this.frameWidth : 0;
    }

    /**
     * Returns the contact box of the character in world coordinates, the area with which it takes damage.
     * @returns {{x: number, y: number, width: number, height: number}} The contact box rectangle.
     */
    getContactRect(){
        return this.getBoxRect(this.contactBox);
    }

    /**
     * Shows the animation of the current state: hurt, roll, attack, cast and rest play once over their time,
     * the jump shows a single frame, walk and idle loop.
     * @returns {void}
     */
    updateSprite(){
        const SPRITE_PLAYERS = {
            hurt: () => this.showProgressState('hurt', this.getHurtElapsed(), this.settings.hurtTicks),
            roll: () => this.showProgressState('roll', this.getRollElapsed(), this.settings.rollTicks),
            attack: () => this.showProgressState('attack', this.getAttackElapsed(), this.settings.attackTicks),
            cast: () => this.showProgressState('cast', this.getCastElapsed(), this.settings.castTicks),
            jump: () => this.showFrameState('jump', this.getJumpFrame()),
            walk: () => this.showLoopState('walk', this.getWalkFps()),
            rest: () => this.showProgressState('rest', this.idleTicks - this.settings.restDelayTicks, this.settings.restTicks),
            idle: () => this.showLoopState('idle', this.settings.idleFps)
        };
        SPRITE_PLAYERS[this.getSpriteState()]();
    }
}
