class CharacterMovement extends MovableObject{
    settings = GAME_SETTINGS.character;
    width = this.settings.width;
    height = this.settings.height;
    speed = this.settings.speed;
    jumpPhase = 'none';
    coyoteTicksLeft = 0;
    phaseTicks = 0;
    idleTicks = 0;
    previousKeys = {};

    placeAt(start){
        this.x = start.column * TILE_SIZE;
        this.y = (start.row + 1) * TILE_SIZE - this.height;
    }

    updateSpeed(){
        this.speed = this.onGround ? this.settings.speed : this.settings.speed * this.settings.airSpeedFactor;
    }

    isWalking(){
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    wantsJump(){
        return this.world.keyboard.UP || this.world.keyboard.SPACE;
    }

    hasInput(){
        return this.isWalking() || this.wantsJump();
    }

    isNewPress(keyName){
        const IS_PRESSED = this.world.keyboard[keyName];
        const IS_NEW = IS_PRESSED && !this.previousKeys[keyName];
        this.previousKeys[keyName] = IS_PRESSED;
        return IS_NEW;
    }

    isMovementLocked(){
        return this.jumpPhase === 'crouch' || this.jumpPhase === 'land';
    }

    isReadyOnGround(){
        return this.onGround && this.jumpPhase === 'none';
    }

    isBusy(){
        return false;
    }

    isInCoyoteTime(){
        return this.coyoteTicksLeft > 0 && this.jumpPhase === 'air';
    }

    canJump(){
        return this.isReadyOnGround() || this.isInCoyoteTime();
    }

    moveByKeyboard(){
        if(this.isMovementLocked()){
            return;
        }
        if(this.world.keyboard.RIGHT){
            this.moveRight();
            this.otherDirection = false;
        }
        if(this.world.keyboard.LEFT){
            this.moveLeft();
            this.otherDirection = true;
        }
    }

    limitToWall(){
        const MAX_X = this.world.level.width - this.width + this.settings.rightWallOffset;
        this.x = clampValue(this.x, this.settings.leftWallX, MAX_X);
    }

    handleJump(){
        if(this.wantsJump() && this.canJump()){
            this.startJump();
        }
    }

    startJump(){
        if(this.isReadyOnGround()){
            this.startPhase('crouch');
        } else {
            this.launchJump();
        }
    }

    updateCoyoteTime(){
        this.coyoteTicksLeft = this.onGround ? this.settings.coyoteTicks : tickDown(this.coyoteTicksLeft);
    }

    startPhase(phaseName){
        this.jumpPhase = phaseName;
        this.phaseTicks = 0;
    }

    launchJump(){
        this.speedY = this.settings.jumpSpeed;
        this.coyoteTicksLeft = 0;
        this.startPhase('air');
        soundManager.playSound('jump');
    }

    startLanding(){
        this.startPhase('land');
        soundManager.playSound('land');
    }

    updateJumpPhase(){
        this.phaseTicks++;
        if(!this.onGround && this.jumpPhase !== 'air'){
            this.startPhase('air');
        } else if(this.jumpPhase === 'crouch' && this.phaseTicks >= this.settings.crouchTicks){
            this.launchJump();
        } else if(this.jumpPhase === 'air' && this.onGround){
            this.startLanding();
        } else if(this.jumpPhase === 'land' && this.phaseTicks >= this.settings.landTicks){
            this.startPhase('none');
        }
    }

    getJumpFrame(){
        const JUMP_FRAMES = this.traits.jumpFrames;
        if(this.jumpPhase === 'crouch'){
            return JUMP_FRAMES.crouch[getProgressFrame(this.phaseTicks, this.settings.crouchTicks, JUMP_FRAMES.crouch.length)];
        }
        if(this.jumpPhase === 'land'){
            return JUMP_FRAMES.land[getProgressFrame(this.phaseTicks, this.settings.landTicks, JUMP_FRAMES.land.length)];
        }
        return this.getAirFrame();
    }

    getAirFrame(){
        const JUMP_FRAMES = this.traits.jumpFrames;
        if(this.speedY > this.settings.apexSpeed){
            return JUMP_FRAMES.up;
        }
        return this.speedY < -this.settings.apexSpeed ? JUMP_FRAMES.down : JUMP_FRAMES.apex;
    }

    updateIdleTicks(){
        if(this.hasInput() || this.jumpPhase !== 'none' || this.isBusy()){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }
}
