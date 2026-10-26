const ATTACK_HITBOX = { offsetX: 79, offsetY: 65, width: 51, height: 50 };

class CharacterActions extends CharacterMovement{
    rollTicksLeft = 0;
    rollCooldownLeft = 0;
    attackTicksLeft = 0;
    attackHits = [];
    castTicksLeft = 0;
    castCooldownLeft = 0;
    maxEnergy = GAME_SETTINGS.energy.maxCharges;
    energy = GAME_SETTINGS.energy.startCharges;

    updateCombat(){
        this.handleAttack();
        this.updateAttack();
        this.handleCast();
        this.updateCast();
    }

    updateSpeed(){
        if(this.isRolling()){
            this.speed = this.settings.rollSpeed;
            return;
        }
        super.updateSpeed();
    }

    hasInput(){
        return super.hasInput() || this.wantsRoll() || this.wantsAttack() || this.wantsCast();
    }

    isMovementLocked(){
        return super.isMovementLocked() || this.isHurt() || this.isRolling();
    }

    isReadyOnGround(){
        return super.isReadyOnGround() && !this.isHurt() && !this.isRolling();
    }

    isInCoyoteTime(){
        return super.isInCoyoteTime() && !this.isHurt() && !this.isRolling();
    }

    isBusy(){
        return this.isRolling() || this.isAttacking() || this.isCasting() || this.isHurt();
    }

    isActionFree(){
        return !this.isAttacking() && !this.isCasting() && !this.isRolling() && !this.isHurt();
    }

    isRolling(){
        return this.rollTicksLeft > 0;
    }

    getRollElapsed(){
        return this.settings.rollTicks - this.rollTicksLeft;
    }

    wantsRoll(){
        return this.world.keyboard.DOWN;
    }

    handleRoll(){
        this.rollCooldownLeft = tickDown(this.rollCooldownLeft);
        if(this.wantsRoll() && this.isReadyOnGround() && this.rollCooldownLeft === 0){
            this.startRoll();
        }
    }

    startRoll(){
        this.rollTicksLeft = this.settings.rollTicks;
        this.attackTicksLeft = 0;
        this.castTicksLeft = 0;
        soundManager.playSound('roll');
    }

    updateRoll(){
        if(!this.isRolling()){
            return;
        }
        this.moveForward();
        this.rollTicksLeft--;
        if(!this.isRolling()){
            this.rollCooldownLeft = this.settings.rollCooldownTicks;
        }
    }

    isAttacking(){
        return this.attackTicksLeft > 0;
    }

    wantsAttack(){
        return this.world.keyboard.ATTACK;
    }

    handleAttack(){
        const JUST_PRESSED = this.isNewPress('ATTACK');
        const CAN_ATTACK = this.isActionFree();
        if(JUST_PRESSED && CAN_ATTACK){
            this.startAttack();
        }
    }

    startAttack(){
        this.attackTicksLeft = this.settings.attackTicks;
        this.attackHits = [];
        soundManager.playSound('attack');
    }

    getAttackElapsed(){
        return this.settings.attackTicks - this.attackTicksLeft;
    }

    isAttackActive(){
        const ELAPSED_TICKS = this.getAttackElapsed();
        return this.isAttacking() && ELAPSED_TICKS >= this.settings.attackHitStartTick && ELAPSED_TICKS < this.settings.attackHitEndTick;
    }

    updateAttack(){
        if(!this.isAttacking()){
            return;
        }
        if(this.isAttackActive()){
            this.hitEnemies();
        }
        this.attackTicksLeft--;
    }

    hitEnemies(){
        const ATTACK_RECT = this.getBoxRect(ATTACK_HITBOX);
        this.world.level.getCollidables().forEach(enemy => {
            if(!this.attackHits.includes(enemy) && enemy.isOverlapping(ATTACK_RECT)){
                enemy.receiveHit(GAME_SETTINGS.combat.hitDamage, this);
                this.attackHits.push(enemy);
            }
        });
    }

    drawAttackBox(ctx){
        if(this.isAttackActive()){
            this.drawRect(ctx, this.getBoxRect(ATTACK_HITBOX), 'orange');
        }
    }

    isCasting(){
        return this.castTicksLeft > 0;
    }

    getCastElapsed(){
        return this.settings.castTicks - this.castTicksLeft;
    }

    wantsCast(){
        return this.world.keyboard.SHOOT;
    }

    handleCast(){
        const JUST_PRESSED = this.isNewPress('SHOOT');
        const CAN_CAST = this.isActionFree() && this.castCooldownLeft === 0 && this.energy >= 1;
        this.castCooldownLeft = tickDown(this.castCooldownLeft);
        if(JUST_PRESSED && CAN_CAST){
            this.startCast();
        } else if(JUST_PRESSED && this.energy < 1){
            soundManager.playSound('noEnergy');
        }
    }

    startCast(){
        this.castTicksLeft = this.settings.castTicks;
        soundManager.playSound('cast');
    }

    updateCast(){
        if(!this.isCasting()){
            return;
        }
        if(this.getCastElapsed() === this.settings.castReleaseTick){
            this.world.addProjectile(new Fireball(this));
            this.castCooldownLeft = this.settings.castCooldownTicks;
            this.energy -= 1;
        }
        this.castTicksLeft--;
    }

    addEnergy(amount){
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    }
}
