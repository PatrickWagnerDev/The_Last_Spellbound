/**
 * The attacks of the dark knight, on top of the sprint and the jump over gaps of the jump boss: a thrust
 * standing and one while walking, a slash upwards and an aura with a long wind-up. Each attack has its own
 * waiting time. The dark knight builds on it.
 */
class KnightAttacks extends JumpBoss {
    attackName = 'thrust';
    hasAttackHit = false;
    lastStep = 0;
    cooldownsLeft = { thrust: 0, walkThrust: 0, upSlash: 0, aura: 0 };

    /**
     * Returns the update methods of the states, with the attack state added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), attack: () => this.updateAttack() };
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
