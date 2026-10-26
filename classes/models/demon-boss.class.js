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
const DEMON_BODY_SHIFT = 48;
const EDGE_PROBE_DISTANCE = 24;

class DemonBoss extends Boss {
    state = 'patrol';
    meleeCooldownLeft = 0;
    sprintCooldownLeft = 0;
    sprintTicksLeft = 0;
    landTicks = 0;
    hasMeleeHit = false;

    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.demonBoss,
            sprites: DEMON_BOSS_SPRITES,
            frameSize: 96,
            hitbox: { offsetX: 70.5, offsetY: 138, width: 147, height: 150 },
            spriteFacesLeft: true,
            deathSound: 'bossDeath',
            music: 'demonMusic'
        });
        this.otherDirection = true;
        this.startAnimation();
    }

    getStateUpdates(){
        return { ...super.getStateUpdates(), jump: () => this.updateJump(), melee: () => this.updateMelee() };
    }

    updateCooldowns(){
        this.meleeCooldownLeft = tickDown(this.meleeCooldownLeft);
        this.sprintCooldownLeft = tickDown(this.sprintCooldownLeft);
    }

    reactToHit(source){
        if(this.state !== 'jump'){
            super.reactToHit(source);
        }
    }

    getGapAhead(){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        const PROBE_X = getRectCenterX(this.getHitbox()) + STEP_DIRECTION * EDGE_PROBE_DISTANCE;
        const PROBE_Y = this.y + this.height + 1;
        let gapTiles = 0;
        while(gapTiles <= this.settings.maxJumpGapTiles && !this.world.level.isWalkableAt(PROBE_X + STEP_DIRECTION * gapTiles * TILE_SIZE, PROBE_Y)){
            gapTiles++;
        }
        return gapTiles;
    }

    shouldTurn(){
        return this.getGapAhead() > 0;
    }

    updatePatrol(){
        this.speed = this.settings.speed;
        super.updatePatrol();
    }

    loseSight(){
        this.otherDirection = this.vanishSide > 0;
        this.setState('patrol');
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

    walkTowardCharacter(){
        const GAP_TILES = this.getGapAhead();
        if(GAP_TILES === 0){
            this.moveTowardCharacter();
        } else if(GAP_TILES <= this.settings.maxJumpGapTiles){
            this.setState('jump');
        } else {
            this.showLoopState('walk', this.settings.animationFps);
        }
    }

    moveTowardCharacter(){
        if(Math.abs(this.getCharacterOffset()) <= 4){
            this.showLoopState('walk', this.settings.animationFps);
            return;
        }
        this.updateSprint();
        const IS_SPRINTING = this.sprintTicksLeft > 0;
        this.speed = IS_SPRINTING ? this.settings.sprintSpeed : this.settings.speed;
        this.showLoopState(IS_SPRINTING ? 'run' : 'walk', IS_SPRINTING ? this.settings.sprintFps : this.settings.animationFps);
        this.moveForward();
    }

    updateSprint(){
        if(this.sprintTicksLeft > 0){
            this.sprintTicksLeft--;
            this.sprintCooldownLeft = this.sprintTicksLeft === 0 ? this.settings.sprintCooldownTicks : 0;
        } else if(this.sprintCooldownLeft === 0 && Math.abs(this.getCharacterOffset()) > this.settings.sprintMinTiles * TILE_SIZE){
            this.sprintTicksLeft = this.settings.sprintTicks;
        }
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

    hitCharacter(rect, damage){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt() || !areRectsOverlapping(PLAYER_CHARACTER.getHitbox(), rect)){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(damage, this);
        return true;
    }

    updateJump(){
        if(this.stateTicks < this.settings.jumpWindupTicks){
            this.showFrameState('jump', 0);
        } else if(this.stateTicks === this.settings.jumpWindupTicks){
            this.launchJump();
        } else if(!this.onGround){
            this.flyJump();
        } else {
            this.landJump();
        }
    }

    launchJump(){
        this.speedY = this.settings.jumpPower;
        this.onGround = false;
        this.landTicks = 0;
        this.showFrameState('jump', 1);
        soundManager.playSound('jump');
    }

    flyJump(){
        this.speed = this.settings.jumpSpeed;
        this.moveForward();
        this.showFrameState('jump', this.speedY > 0 ? 1 : 2);
    }

    landJump(){
        this.landTicks++;
        this.showFrameState('jump', 3);
        if(this.landTicks === 1){
            soundManager.playSound('land');
        }
        if(this.landTicks >= this.settings.jumpLandTicks){
            this.startChase();
        }
    }

    drawFrame(ctx, drawX){
        super.drawFrame(ctx, drawX - DEMON_BODY_SHIFT);
    }

    drawDebugArea(ctx){
        super.drawDebugArea(ctx);
        if(this.isMeleeActive()){
            this.drawRect(ctx, this.getBoxRect(DEMON_MELEE_HITBOX), 'orange');
        }
    }
}
