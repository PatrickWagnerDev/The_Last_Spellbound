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

class MageBoss extends Enemy {
    isBoss = true;
    state = 'wait';
    stateTicks = 0;
    vanishSide = 1;
    outOfSightTicks = 0;
    attackVariant = 'attack2';
    fireballCooldownLeft = 0;
    rayCooldownLeft = 0;

    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.mageBoss,
            sprites: MAGE_BOSS_SPRITES,
            frameSize: 64,
            hitbox: { offsetX: 42, offsetY: 15, width: 120, height: 174 },
            spriteFacesLeft: true,
            deathSound: 'bossDeath'
        });
        this.otherDirection = true;
        this.startAnimation();
    }

    updateBehavior(){
        this.stateTicks++;
        this.updateCooldowns();
        const STATE_UPDATES = {
            wait: () => this.updateWait(),
            patrol: () => this.updatePatrol(),
            sneer: () => this.updateSneer(),
            chase: () => this.updateChase(),
            attack: () => this.updateAttack(),
            ray: () => this.updateRayAttack(),
            search: () => this.updateSearch()
        };
        STATE_UPDATES[this.state]();
    }

    updateCooldowns(){
        this.fireballCooldownLeft = tickDown(this.fireballCooldownLeft);
        this.rayCooldownLeft = tickDown(this.rayCooldownLeft);
    }

    setState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    getSightRect(){
        const BOSS_RECT = this.getHitbox();
        const SIGHT_RANGE = this.settings.sightTiles * TILE_SIZE;
        const SIGHT_ABOVE = this.settings.sightAboveTiles * TILE_SIZE;
        return { x: BOSS_RECT.x - SIGHT_RANGE, y: BOSS_RECT.y - SIGHT_ABOVE, width: BOSS_RECT.width + 2 * SIGHT_RANGE, height: BOSS_RECT.height + SIGHT_ABOVE };
    }

    isCharacterInSight(){
        const PLAYER_CHARACTER = this.world.character;
        return !PLAYER_CHARACTER.isDead() && areRectsOverlapping(PLAYER_CHARACTER.getHitbox(), this.getSightRect());
    }

    getCharacterOffset(){
        return getRectCenterX(this.world.character.getHitbox()) - getRectCenterX(this.getHitbox());
    }

    faceCharacter(){
        this.otherDirection = this.getCharacterOffset() < 0;
    }

    updateWait(){
        this.showLoopState('idle', this.settings.animationFps);
        if(this.isCharacterInSight()){
            this.rayCooldownLeft = this.settings.rayCooldownTicks;
            this.startSneer();
            soundManager.playMusic('bossMusic');
        }
    }

    updatePatrol(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }

    startSneer(){
        this.faceCharacter();
        this.setState('sneer');
    }

    updateSneer(){
        this.faceCharacter();
        this.showProgressState('sneer', this.stateTicks, this.settings.sneerTicks);
        if(this.stateTicks >= this.settings.sneerTicks){
            this.startChase();
        }
    }

    startChase(){
        this.outOfSightTicks = 0;
        this.setState('chase');
    }

    trackSight(){
        if(this.isCharacterInSight()){
            this.outOfSightTicks = 0;
            this.vanishSide = this.getCharacterOffset() >= 0 ? 1 : -1;
        } else {
            this.outOfSightTicks++;
        }
    }

    updateChase(){
        this.trackSight();
        if(this.outOfSightTicks >= this.settings.loseSightTicks){
            this.setState('search');
            return;
        }
        this.faceCharacter();
        if(!this.tryStartAttack()){
            this.walkTowardCharacter();
        }
    }

    walkTowardCharacter(){
        this.showLoopState('walk', this.settings.animationFps);
        if(Math.abs(this.getCharacterOffset()) > 4 && !this.shouldTurn()){
            this.moveForward();
        }
    }

    getCharacterFeetHeight(){
        const BOSS_RECT = this.getHitbox();
        const CHARACTER_RECT = this.world.character.getHitbox();
        return (BOSS_RECT.y + BOSS_RECT.height) - (CHARACTER_RECT.y + CHARACTER_RECT.height);
    }

    getAttackVariant(){
        const FEET_HEIGHT = this.getCharacterFeetHeight();
        if(FEET_HEIGHT > this.settings.fireballMaxHeight){
            return null;
        }
        return FEET_HEIGHT <= this.settings.fireballLowHeight ? 'attack2' : 'attack3';
    }

    canUseRay(){
        return this.rayCooldownLeft === 0 && this.getCharacterFeetHeight() <= this.settings.rayMaxHeight;
    }

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

    startRay(){
        this.rayCooldownLeft = this.settings.rayCooldownTicks;
        this.setState('ray');
        soundManager.playSound('bossRay');
    }

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

    getRayFrame(){
        const WINDUP_TICKS = this.settings.rayWindupTicks;
        if(this.stateTicks < WINDUP_TICKS){
            return getProgressFrame(this.stateTicks, WINDUP_TICKS, 2);
        }
        return 2 + getProgressFrame(this.stateTicks - WINDUP_TICKS, this.settings.rayTicks, 4);
    }

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

    spawnRay(){
        const SCALE_FACTOR = this.width / this.frameWidth;
        const ORIGIN_X = this.x + (this.otherDirection ? BOSS_RAY_SPAWN.offsetX : this.frameWidth - BOSS_RAY_SPAWN.offsetX) * SCALE_FACTOR;
        this.world.addProjectile(new BossRay(this, ORIGIN_X, this.y + BOSS_RAY_SPAWN.offsetY * SCALE_FACTOR));
    }

    updateAttack(){
        this.showProgressState(this.attackVariant, this.stateTicks, this.settings.attackTicks);
        if(this.stateTicks === this.settings.fireballReleaseTick){
            this.spawnFireball();
        }
        if(this.stateTicks >= this.settings.attackTicks){
            this.startChase();
        }
    }

    spawnFireball(){
        const SPAWN_OFFSET = BOSS_FIREBALL_SPAWN[this.attackVariant];
        const SCALE_FACTOR = this.width / this.frameWidth;
        const CENTER_X = this.x + (this.otherDirection ? SPAWN_OFFSET.offsetX : this.frameWidth - SPAWN_OFFSET.offsetX) * SCALE_FACTOR;
        this.world.addProjectile(new BossFireball(CENTER_X, this.y + SPAWN_OFFSET.offsetY * SCALE_FACTOR, this.otherDirection));
        this.fireballCooldownLeft = this.settings.fireballCooldownTicks;
    }

    updateSearch(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('idle', this.settings.animationFps);
        this.lookAround();
        if(this.stateTicks >= this.settings.searchTicks){
            this.otherDirection = this.vanishSide > 0;
            this.setState('patrol');
        }
    }

    lookAround(){
        const LOOKS_TO_VANISH_SIDE = Math.floor(this.stateTicks / this.settings.lookSwitchTicks) % 2 === 0;
        this.otherDirection = LOOKS_TO_VANISH_SIDE ? this.vanishSide < 0 : this.vanishSide > 0;
    }

    finishDeath(){
        this.stopAnimation();
    }

    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
