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
    spriteFacesLeft: true,
    deathSound: 'bossDeath',
    music: 'demonMusic',
    bodyShift: -48,
    jumpFrames: { windup: [0], up: 1, down: 2, land: [3] }
};

class DemonBoss extends JumpBoss {
    state = 'patrol';
    meleeCooldownLeft = 0;
    hasMeleeHit = false;

    constructor(column, row){
        super(column, row, DEMON_BOSS_CONFIG);
        this.otherDirection = true;
        this.startAnimation();
    }

    getStateUpdates(){
        return { ...super.getStateUpdates(), melee: () => this.updateMelee() };
    }

    updateCooldowns(){
        super.updateCooldowns();
        this.meleeCooldownLeft = tickDown(this.meleeCooldownLeft);
    }

    getMeleeReach(){
        const BOSS_RECT = this.getHitbox();
        const REACH_DISTANCE = this.settings.meleeRangeTiles * TILE_SIZE;
        return { x: this.otherDirection ? BOSS_RECT.x - REACH_DISTANCE : BOSS_RECT.x, y: BOSS_RECT.y, width: BOSS_RECT.width + REACH_DISTANCE, height: BOSS_RECT.height };
    }

    tryStartAttack(){
        const IN_REACH = areRectsOverlapping(this.world.character.getHitbox(), this.getMeleeReach());
        if(!IN_REACH || this.meleeCooldownLeft > 0){
            return false;
        }
        this.startMelee();
        return true;
    }

    startMelee(){
        this.sprintTicksLeft = 0;
        this.hasMeleeHit = false;
        this.setState('melee');
        soundManager.playSound('attack');
    }

    isMeleeActive(){
        return this.state === 'melee' && this.stateTicks >= this.settings.meleeHitStartTick && this.stateTicks < this.settings.meleeHitEndTick;
    }

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

    drawDebugArea(ctx){
        super.drawDebugArea(ctx);
        if(this.isMeleeActive()){
            this.drawRect(ctx, this.getBoxRect(DEMON_MELEE_HITBOX), 'orange');
        }
    }
}
