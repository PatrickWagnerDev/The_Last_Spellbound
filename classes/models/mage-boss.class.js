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

class MageBoss extends Boss {
    attackVariant = 'attack2';
    fireballCooldownLeft = 0;
    rayCooldownLeft = 0;

    constructor(column, row){
        super(column, row, {
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
        });
        this.otherDirection = true;
        this.startAnimation();
    }

    getStateUpdates(){
        return { ...super.getStateUpdates(), attack: () => this.updateAttack(), ray: () => this.updateRayAttack() };
    }

    updateCooldowns(){
        this.fireballCooldownLeft = tickDown(this.fireballCooldownLeft);
        this.rayCooldownLeft = tickDown(this.rayCooldownLeft);
    }

    onFirstNotice(){
        this.rayCooldownLeft = this.settings.rayCooldownTicks;
        super.onFirstNotice();
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
        const ORIGIN_POINT = this.getSpawnPoint(BOSS_RAY_SPAWN);
        this.world.addProjectile(new BossRay(this, ORIGIN_POINT.x, ORIGIN_POINT.y));
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
        this.spawnEnemyFireball(BOSS_FIREBALL, BOSS_FIREBALL_SPAWN[this.attackVariant]);
        this.fireballCooldownLeft = this.settings.fireballCooldownTicks;
    }
}
