const MAGE_SPRITES = {
    idle: { path: './assets/image/03-monsters/2 Mage/Idle.png', frames: 4 },
    walk: { path: './assets/image/03-monsters/2 Mage/Walk.png', frames: 4 },
    attack: { path: './assets/image/03-monsters/2 Mage/Attack.png', frames: 8 },
    hurt: { path: './assets/image/03-monsters/2 Mage/Hurt.png', frames: 4 },
    death: { path: './assets/image/03-monsters/2 Mage/Death.png', frames: 6 }
};

const MAGE_FIREBALL_SPAWN = { offsetX: 5, offsetY: 20.5 };

/**
 * The mage, a ranged enemy. It patrols until it sees the character, then it stands still, looks at the
 * character and shoots a fireball whenever its waiting time is over. It patrols again after it lost sight.
 */
class Mage extends SightEnemy {
    state = 'patrol';
    stateTicks = 0;
    outOfSightTicks = 0;
    attackCooldownLeft = 0;

    /**
     * Creates a mage on a map cell, looking in a random direction, and starts its game loop.
     * @param {number} column - Map column of the mage.
     * @param {number} row - Map row of the mage.
     */
    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.mage,
            sprites: MAGE_SPRITES,
            frameSize: 32,
            hitbox: { offsetX: 14, offsetY: 10, width: 48, height: 54 },
            hurtboxes: [{ offsetX: 16, offsetY: 14, width: 44, height: 48 }],
            spriteFacesLeft: true,
            deathSound: 'bearDeath'
        });
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    /**
     * Counts the waiting time of the shot down and runs the update of the current state: attack, alert or
     * patrol.
     * @returns {void}
     */
    updateBehavior(){
        this.attackCooldownLeft = tickDown(this.attackCooldownLeft);
        if(this.state === 'attack'){
            this.updateAttack();
        } else if(this.state === 'alert'){
            this.updateAlert();
        } else {
            this.updatePatrol();
        }
    }

    /**
     * Calculates the sight area: far in front of the mage, only a short distance behind it, and up and
     * down by the settings.
     * @returns {{x: number, y: number, width: number, height: number}} The sight rectangle.
     */
    getSightRect(){
        const MAGE_RECT = this.getHitbox();
        const SIGHT_RANGE = this.settings.sightTiles * TILE_SIZE;
        const SIGHT_ABOVE = this.settings.sightAboveTiles * TILE_SIZE;
        const SIGHT_BELOW = this.settings.sightBelowTiles * TILE_SIZE;
        const SIGHT_BEHIND = this.settings.sightBehindTiles * TILE_SIZE;
        const SIGHT_LEFT = this.otherDirection ? SIGHT_RANGE : SIGHT_BEHIND;
        const SIGHT_RIGHT = this.otherDirection ? SIGHT_BEHIND : SIGHT_RANGE;
        return { x: MAGE_RECT.x - SIGHT_LEFT, y: MAGE_RECT.y - SIGHT_ABOVE, width: MAGE_RECT.width + SIGHT_LEFT + SIGHT_RIGHT, height: MAGE_RECT.height + SIGHT_ABOVE + SIGHT_BELOW };
    }

    /**
     * Runs a tick of the patrol state: the mage walks back and forth and becomes alert when it sees the
     * character.
     * @returns {void}
     */
    updatePatrol(){
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
        if(this.isCharacterInSight()){
            this.outOfSightTicks = 0;
            this.state = 'alert';
        }
    }

    /**
     * Runs a tick of the alert state: the mage stands still, looks at the character and shoots when its
     * waiting time is over, or counts the time out of sight.
     * @returns {void}
     */
    updateAlert(){
        this.showLoopState('idle', this.settings.animationFps);
        if(!this.isCharacterInSight()){
            this.trackLostSight();
            return;
        }
        this.outOfSightTicks = 0;
        this.faceCharacter();
        if(this.attackCooldownLeft === 0){
            this.startAttack();
        }
    }

    /**
     * Counts the time out of sight and goes back to patrol when it has been too long.
     * @returns {void}
     */
    trackLostSight(){
        this.outOfSightTicks++;
        if(this.outOfSightTicks >= this.settings.loseSightTicks){
            this.state = 'patrol';
        }
    }

    /**
     * Starts the attack: switches to the attack state and plays the spell sound.
     * @returns {void}
     */
    startAttack(){
        this.state = 'attack';
        this.stateTicks = 0;
        soundManager.playSound('bossFireball');
    }

    /**
     * Runs a tick of the attack state: plays the shot animation once, releases the fireball at the right
     * tick and returns to the alert state at the end.
     * @returns {void}
     */
    updateAttack(){
        this.stateTicks++;
        this.showProgressState('attack', this.stateTicks, this.settings.attackTicks);
        if(this.stateTicks === this.settings.fireballReleaseTick){
            this.spawnFireball();
        }
        if(this.stateTicks >= this.settings.attackTicks){
            this.state = 'alert';
        }
    }

    /**
     * Shoots the fireball from the tip of the staff and starts the waiting time until the next shot.
     * @returns {void}
     */
    spawnFireball(){
        this.spawnEnemyFireball(MAGE_FIREBALL, MAGE_FIREBALL_SPAWN);
        this.attackCooldownLeft = this.settings.attackCooldownTicks;
    }
}
