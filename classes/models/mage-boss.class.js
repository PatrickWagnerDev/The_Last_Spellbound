const MAGE_BOSS_SPRITES = {
    idle: { path: './assets/image/04-bosses/1 Mage/Mage_boss_walk.png', frames: 6 },
    walk: { path: './assets/image/04-bosses/1 Mage/Mage_boss_run.png', frames: 6 },
    sneer: { path: './assets/image/04-bosses/1 Mage/Mage_boss_sneer.png', frames: 6 },
    attack2: { path: './assets/image/04-bosses/1 Mage/Mage_boss_attack2.png', frames: 6 },
    attack3: { path: './assets/image/04-bosses/1 Mage/Mage_boss_attack3.png', frames: 6 },
    rayAttack: { path: './assets/image/04-bosses/1 Mage/Mage_boss_attack4.png', frames: 6 },
    hurt: { path: './assets/image/04-bosses/1 Mage/Mage_boss_hurt.png', frames: 4 },
    death: { path: './assets/image/04-bosses/1 Mage/Mage_boss_death.png', frames: 6 }
};

const BOSS_FIREBALL_SPAWN = {
    attack2: { offsetX: 7, offsetY: 52 },
    attack3: { offsetX: 8, offsetY: 31 }
};

const BOSS_RAY_SPAWN = { offsetX: 11, offsetY: 45.5 };

const MAGE_BOSS_CONFIG = {
    settings: GAME_SETTINGS.mageBoss,
    sprites: MAGE_BOSS_SPRITES,
    frameSize: 64,
    hitbox: { offsetX: 42, offsetY: 15, width: 120, height: 174 },
    hurtboxes: [
        { offsetX: 44, offsetY: 26, width: 83, height: 59 },
        { offsetX: 44, offsetY: 89, width: 137, height: 53 },
        { offsetX: 59, offsetY: 146, width: 95, height: 38 }
    ],
    spriteFacesLeft: true,
    deathSound: 'bossDeath',
    music: 'bossMusic'
};

/**
 * The mage boss of level one. On top of the boss behavior it has two ranged attacks: a fireball, shot low or
 * high depending on the height of the character, and a long ray that only hits targets near the ground. It
 * attacks only when it sees the character and prefers the ray when it is ready.
 */
class MageBoss extends Boss {
    attackVariant = 'attack2';
    fireballCooldownLeft = 0;
    rayCooldownLeft = 0;

    /**
     * Creates the mage boss on a map cell, looking to the left, and starts its game loop.
     * @param {number} column - Map column of the boss.
     * @param {number} row - Map row of the boss.
     */
    constructor(column, row){
        super(column, row, MAGE_BOSS_CONFIG);
        this.otherDirection = true;
        this.startAnimation();
    }

    /**
     * Returns the update methods of the states, with the fireball attack and the ray attack added.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return { ...super.getStateUpdates(), attack: () => this.updateAttack(), ray: () => this.updateRayAttack() };
    }

    /**
     * Counts the waiting times of the fireball and the ray down by one tick.
     * @returns {void}
     */
    updateCooldowns(){
        this.fireballCooldownLeft = tickDown(this.fireballCooldownLeft);
        this.rayCooldownLeft = tickDown(this.rayCooldownLeft);
    }

    /**
     * Runs when the boss notices the character for the first time: the ray starts with its full waiting time,
     * so it is not used at once, and the music starts.
     * @returns {void}
     */
    onFirstNotice(){
        this.rayCooldownLeft = this.settings.rayCooldownTicks;
        super.onFirstNotice();
    }

    /**
     * Starts an attack if the boss sees the character: the ray if it can be used, otherwise a fireball.
     * @returns {boolean} True if an attack was started.
     */
    tryStartAttack(){
        if(!this.isCharacterInSight()){
            return false;
        }
        if(this.canUseRay()){
            this.startRay();
            return true;
        }
        return this.tryStartFireball();
    }

    /**
     * Measures how much higher the feet of the character are than the feet of the boss.
     * @returns {number} Height difference in pixels, 0 on the same ground, positive on a platform.
     */
    getCharacterFeetHeight(){
        const BOSS_RECT = this.getHitbox();
        const CHARACTER_RECT = this.world.character.getHitbox();
        return (BOSS_RECT.y + BOSS_RECT.height) - (CHARACTER_RECT.y + CHARACTER_RECT.height);
    }

    /**
     * Picks the fireball variant for the height of the character: the low shot, the high shot, or none if the
     * character is too high to hit.
     * @returns {string|null} 'attack2', 'attack3' or null.
     */
    getAttackVariant(){
        const FEET_HEIGHT = this.getCharacterFeetHeight();
        if(FEET_HEIGHT > this.settings.fireballMaxHeight){
            return null;
        }
        return FEET_HEIGHT <= this.settings.fireballLowHeight ? 'attack2' : 'attack3';
    }

    /**
     * Tells whether the ray can be used: its waiting time is over and the character is low enough to be hit.
     * @returns {boolean} True if the ray may start.
     */
    canUseRay(){
        return this.rayCooldownLeft === 0 && this.getCharacterFeetHeight() <= this.settings.rayMaxHeight;
    }

    /**
     * Starts the ray attack: starts the waiting time, switches to the ray state and plays the ray sound.
     * @returns {void}
     */
    startRay(){
        this.rayCooldownLeft = this.settings.rayCooldownTicks;
        this.setState('ray');
        soundManager.playSound('bossRay');
    }

    /**
     * Starts a fireball attack if there is a variant for the height of the character and the waiting time is
     * over.
     * @returns {boolean} True if the attack was started.
     */
    tryStartFireball(){
        const ATTACK_VARIANT = this.getAttackVariant();
        if(!ATTACK_VARIANT || this.fireballCooldownLeft > 0){
            return false;
        }
        this.attackVariant = ATTACK_VARIANT;
        this.setState('attack');
        soundManager.playSound('bossFireball');
        return true;
    }

    /**
     * Picks the frame of the ray animation: two frames for the wind-up, then four frames while the ray lasts.
     * @returns {number} Index of the frame in the ray sprite sheet.
     */
    getRayFrame(){
        const WINDUP_TICKS = this.settings.rayWindupTicks;
        if(this.stateTicks < WINDUP_TICKS){
            return getProgressFrame(this.stateTicks, WINDUP_TICKS, 2);
        }
        return 2 + getProgressFrame(this.stateTicks - WINDUP_TICKS, this.settings.rayTicks, 4);
    }

    /**
     * Runs a tick of the ray state: the boss aims at the character during the wind-up, releases the ray at the
     * end of it and goes back to chasing when the ray is over.
     * @returns {void}
     */
    updateRayAttack(){
        if(this.stateTicks < this.settings.rayWindupTicks){
            this.faceCharacter();
        }
        this.showFrameState('rayAttack', this.getRayFrame());
        if(this.stateTicks === this.settings.rayWindupTicks){
            this.spawnRay();
        }
        if(this.stateTicks >= this.settings.rayWindupTicks + this.settings.rayTicks){
            this.startChase();
        }
    }

    /**
     * Creates the ray at the start point of the boss and gives it to the world.
     * @returns {void}
     */
    spawnRay(){
        const ORIGIN_POINT = this.getSpawnPoint(BOSS_RAY_SPAWN);
        this.world.addProjectile(new BossRay(this, ORIGIN_POINT.x, ORIGIN_POINT.y));
    }

    /**
     * Runs a tick of the fireball state: plays the animation of the chosen variant once, releases the fireball
     * at the right tick and goes back to chasing at the end.
     * @returns {void}
     */
    updateAttack(){
        this.showProgressState(this.attackVariant, this.stateTicks, this.settings.attackTicks);
        if(this.stateTicks === this.settings.fireballReleaseTick){
            this.spawnFireball();
        }
        if(this.stateTicks >= this.settings.attackTicks){
            this.startChase();
        }
    }

    /**
     * Shoots the fireball from the start point of the chosen variant and starts the waiting time until the
     * next one.
     * @returns {void}
     */
    spawnFireball(){
        this.spawnEnemyFireball(BOSS_FIREBALL, BOSS_FIREBALL_SPAWN[this.attackVariant]);
        this.fireballCooldownLeft = this.settings.fireballCooldownTicks;
    }
}
