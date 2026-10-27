const DEMON_BOSS_SPRITES = {
    walk: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_walk.png', frames: 6 },
    run: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_run.png', frames: 8 },
    sneer: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_sneer.png', frames: 6 },
    jump: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_attack1.png', frames: 4 },
    melee: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_attack2.png', frames: 8 },
    hurt: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_hurt.png', frames: 4 },
    death: { path: './assets/image/04-bosses/2 Demon/Demon_Boss_death.png', frames: 4 }
};

const DEMON_MELEE_HITBOX = { offsetX: -48, offsetY: 120, width: 135, height: 165 };

const DEMON_BOSS_CONFIG = {
    settings: GAME_SETTINGS.demonBoss,
    sprites: DEMON_BOSS_SPRITES,
    frameSize: 96,
    hitbox: { offsetX: 70.5, offsetY: 138, width: 147, height: 150 },
    hurtboxes: [
        { offsetX: 80, offsetY: 143, width: 134, height: 47 },
        { offsetX: 83, offsetY: 194, width: 107, height: 47 },
        { offsetX: 101, offsetY: 245, width: 89, height: 41 }
    ],
    spriteFacesLeft: true,
    deathSound: 'bossDeath',
    music: 'demonMusic',
    bodyShift: -48,
    jumpFrames: { windup: [0], up: 1, down: 2, land: [3] }
};

/**
 * The demon boss of level two. On top of the sprint and the jump over gaps of the jump boss it fights with a
 * club: when the character is within reach it swings, the club only hits during a short part of the swing,
 * and then the demon has to wait before it can swing again.
 */
class DemonBoss extends JumpBoss {
    state = 'patrol';
    meleeCooldownLeft = 0;
    hasMeleeHit = false;

    /**
     * Creates the demon on a map cell, looking to the left, and starts its game loop. It starts on patrol.
     * @param {number} column - Map column of the demon.
     * @param {number} row - Map row of the demon.
     */
    constructor(column, row){
        super(column, row, DEMON_BOSS_CONFIG);
        this.otherDirection = true;
        this.startAnimation();
    }

    /**
     * Returns the update methods of the states, with the club swing added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), melee: () => this.updateMelee() };
    }

    /**
     * Counts the waiting times of the sprint and of the club swing down by one tick.
     * @returns {void}
     */
    updateCooldowns(){
        super.updateCooldowns();
        this.meleeCooldownLeft = tickDown(this.meleeCooldownLeft);
    }

    /**
     * Calculates the reach of the demon: its hitbox, extended by two tiles in the direction it looks.
     * @returns {{x: number, y: number, width: number, height: number}} The reach rectangle.
     */
    getMeleeReach(){
        const BOSS_RECT = this.getHitbox();
        const REACH_DISTANCE = this.settings.meleeRangeTiles * TILE_SIZE;
        return { x: this.otherDirection ? BOSS_RECT.x - REACH_DISTANCE : BOSS_RECT.x, y: BOSS_RECT.y, width: BOSS_RECT.width + REACH_DISTANCE, height: BOSS_RECT.height };
    }

    /**
     * Starts the club swing if the character is within reach and the waiting time is over.
     * @returns {boolean} True if the swing was started.
     */
    tryStartAttack(){
        const IN_REACH = areRectsOverlapping(this.world.character.getHitbox(), this.getMeleeReach());
        if(!IN_REACH || this.meleeCooldownLeft > 0){
            return false;
        }
        this.startMelee();
        return true;
    }

    /**
     * Starts the swing: ends a running sprint, notes that nothing was hit yet, switches to the melee state and
     * plays the club sound.
     * @returns {void}
     */
    startMelee(){
        this.sprintTicksLeft = 0;
        this.hasMeleeHit = false;
        this.setState('melee');
        soundManager.playSound('demonClub');
    }

    /**
     * Tells whether the club can hit at this moment, which is only in a short part of the swing animation.
     * @returns {boolean} True during the hit window of the swing.
     */
    isMeleeActive(){
        return this.state === 'melee' && this.stateTicks >= this.settings.meleeHitStartTick && this.stateTicks < this.settings.meleeHitEndTick;
    }

    /**
     * Runs a tick of the melee state: the demon aims before the hit window, plays the swing once, hits the
     * character at most once during the hit window, and starts its waiting time and the chase at the end.
     * @returns {void}
     */
    updateMelee(){
        if(this.stateTicks < this.settings.meleeHitStartTick){
            this.faceCharacter();
        }
        this.showProgressState('melee', this.stateTicks, this.settings.meleeTicks);
        if(this.isMeleeActive() && !this.hasMeleeHit){
            this.hasMeleeHit = this.hitCharacter(this.getBoxRect(DEMON_MELEE_HITBOX), this.settings.meleeDamage);
        }
        if(this.stateTicks >= this.settings.meleeTicks){
            this.meleeCooldownLeft = this.settings.meleeCooldownTicks;
            this.startChase();
        }
    }

    /**
     * Draws the sight area and, while the club can hit, the club zone, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawDebugArea(ctx){
        super.drawDebugArea(ctx);
        if(this.isMeleeActive()){
            this.drawRect(ctx, this.getBoxRect(DEMON_MELEE_HITBOX), 'orange');
        }
    }
}
