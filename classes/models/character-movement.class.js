class CharacterMovement extends MovableObject{
    settings = GAME_SETTINGS.character;
    width = this.settings.width;
    height = this.settings.height;
    x = TILE_SIZE;
    y = 9 * TILE_SIZE - this.height;
    speed = this.settings.speed;
    jumpPhase = 'none';
    phaseTicks = 0;
    idleTicks = 0;
    previousKeys = {};

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
        return this.jumpPhase == 'crouch' || this.jumpPhase == 'land';
    }

    isReadyOnGround(){
        return this.onGround && this.jumpPhase == 'none';
    }

    isBusy(){
        return false;
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
        if(this.wantsJump() && this.isReadyOnGround()){
            this.startPhase('crouch');
        }
    }

    startPhase(phaseName){
        this.jumpPhase = phaseName;
        this.phaseTicks = 0;
    }

    launchJump(){
        this.speedY = this.settings.jumpSpeed;
        this.startPhase('air');
    }

    updateJumpPhase(){
        this.phaseTicks++;
        if(!this.onGround && this.jumpPhase != 'air'){
            this.startPhase('air');
        } else if(this.jumpPhase == 'crouch' && this.phaseTicks >= this.settings.crouchTicks){
            this.launchJump();
        } else if(this.jumpPhase == 'air' && this.onGround){
            this.startPhase('land');
        } else if(this.jumpPhase == 'land' && this.phaseTicks >= this.settings.landTicks){
            this.startPhase('none');
        }
    }

    getJumpFrame(){
        if(this.jumpPhase == 'crouch'){
            return this.getPhaseFrame(0, this.settings.crouchTicks);
        }
        if(this.jumpPhase == 'land'){
            return this.getPhaseFrame(6, this.settings.landTicks);
        }
        return this.getAirFrame();
    }

    getPhaseFrame(startFrame, totalTicks){
        return startFrame + getProgressFrame(this.phaseTicks, totalTicks, 3);
    }

    getAirFrame(){
        if(this.speedY > this.settings.apexSpeed){
            return 3;
        }
        if(this.speedY < -this.settings.apexSpeed){
            return 5;
        }
        return 4;
    }

    updateIdleTicks(){
        if(this.hasInput() || this.jumpPhase != 'none' || this.isBusy()){
            this.idleTicks = 0;
        } else {
            this.idleTicks++;
        }
    }
}
