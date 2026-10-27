const MAGE_SPRITES = {
    idle: { path: './assets/image/03-monsters/2 Mage/Idle.png', frames: 4 },
    walk: { path: './assets/image/03-monsters/2 Mage/Walk.png', frames: 4 },
    attack: { path: './assets/image/03-monsters/2 Mage/Attack.png', frames: 8 },
    hurt: { path: './assets/image/03-monsters/2 Mage/Hurt.png', frames: 4 },
    death: { path: './assets/image/03-monsters/2 Mage/Death.png', frames: 6 }
};

const MAGE_FIREBALL_SPAWN = { offsetX: 5, offsetY: 20.5 };

class Mage extends SightEnemy {
    state = 'patrol';
    stateTicks = 0;
    outOfSightTicks = 0;
    attackCooldownLeft = 0;

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

    updatePatrol(){
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
        if(this.isCharacterInSight()){
            this.outOfSightTicks = 0;
            this.state = 'alert';
        }
    }

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

    trackLostSight(){
        this.outOfSightTicks++;
        if(this.outOfSightTicks >= this.settings.loseSightTicks){
            this.state = 'patrol';
        }
    }

    startAttack(){
        this.state = 'attack';
        this.stateTicks = 0;
        soundManager.playSound('bossFireball');
    }

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

    spawnFireball(){
        this.spawnEnemyFireball(MAGE_FIREBALL, MAGE_FIREBALL_SPAWN);
        this.attackCooldownLeft = this.settings.attackCooldownTicks;
    }
}
