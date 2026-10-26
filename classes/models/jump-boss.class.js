const APEX_SPEED_LIMIT = 2;
const EDGE_PROBE_DISTANCE = 24;

class JumpBoss extends Boss {
    sprintCooldownLeft = 0;
    sprintTicksLeft = 0;
    landTicks = 0;

    constructor(column, row, config){
        super(column, row, config);
        this.jumpFrames = config.jumpFrames;
    }

    getStateUpdates(){
        return { ...super.getStateUpdates(), jump: () => this.updateJump() };
    }

    updateCooldowns(){
        this.sprintCooldownLeft = tickDown(this.sprintCooldownLeft);
    }

    reactToHit(source){
        if(this.state !== 'jump'){
            super.reactToHit(source);
        }
    }

    isSprinting(){
        return this.sprintTicksLeft > 0;
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

    walkTowardCharacter(){
        const GAP_TILES = this.getGapAhead();
        if(GAP_TILES === 0){
            this.moveTowardCharacter();
        } else if(GAP_TILES <= this.settings.maxJumpGapTiles){
            this.setState('jump');
        } else {
            this.waitAtEdge();
        }
    }

    waitAtEdge(){
        this.showMoveAnimation();
        if(this.isSprinting()){
            this.updateSprint();
        }
    }

    moveTowardCharacter(){
        if(Math.abs(this.getCharacterOffset()) <= 4){
            this.showLoopState('walk', this.settings.animationFps);
            return;
        }
        this.updateSprint();
        this.speed = this.isSprinting() ? this.settings.sprintSpeed : this.settings.speed;
        this.showMoveAnimation();
        this.moveForward();
    }

    showMoveAnimation(){
        const IS_SPRINTING = this.isSprinting();
        this.showLoopState(IS_SPRINTING ? 'run' : 'walk', IS_SPRINTING ? this.settings.sprintFps : this.settings.animationFps);
    }

    updateSprint(){
        if(this.isSprinting()){
            this.sprintTicksLeft--;
            this.sprintCooldownLeft = this.sprintTicksLeft === 0 ? this.settings.sprintCooldownTicks : 0;
        } else if(this.sprintCooldownLeft === 0 && Math.abs(this.getCharacterOffset()) > this.settings.sprintMinTiles * TILE_SIZE){
            this.sprintTicksLeft = this.settings.sprintTicks;
        }
    }

    hurtCharacter(damage){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt()){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(damage, this);
        return true;
    }

    hitCharacter(rect, damage){
        return areRectsOverlapping(this.world.character.getHitbox(), rect) && this.hurtCharacter(damage);
    }

    updateJump(){
        if(this.stateTicks < this.settings.jumpWindupTicks){
            this.showFrameState('jump', this.getWindupFrame());
        } else if(this.stateTicks === this.settings.jumpWindupTicks){
            this.launchJump();
        } else if(!this.onGround){
            this.flyJump();
        } else {
            this.landJump();
        }
    }

    getWindupFrame(){
        const WINDUP_FRAMES = this.jumpFrames.windup;
        return WINDUP_FRAMES[getProgressFrame(this.stateTicks, this.settings.jumpWindupTicks, WINDUP_FRAMES.length)];
    }

    getAirFrame(){
        const AIR_FRAMES = this.jumpFrames;
        if(AIR_FRAMES.apex !== undefined && Math.abs(this.speedY) <= APEX_SPEED_LIMIT){
            return AIR_FRAMES.apex;
        }
        return this.speedY > 0 ? AIR_FRAMES.up : AIR_FRAMES.down;
    }

    getLandFrame(){
        const LAND_FRAMES = this.jumpFrames.land;
        return LAND_FRAMES[getProgressFrame(this.landTicks, this.settings.jumpLandTicks, LAND_FRAMES.length)];
    }

    launchJump(){
        this.speedY = this.settings.jumpPower;
        this.onGround = false;
        this.landTicks = 0;
        this.showFrameState('jump', this.getAirFrame());
        soundManager.playSound('jump');
    }

    flyJump(){
        this.speed = this.settings.jumpSpeed;
        this.moveForward();
        this.showFrameState('jump', this.getAirFrame());
    }

    landJump(){
        this.landTicks++;
        this.showFrameState('jump', this.getLandFrame());
        if(this.landTicks === 1){
            soundManager.playSound('land');
        }
        if(this.landTicks >= this.settings.jumpLandTicks){
            this.startChase();
        }
    }
}
