const CALM_STATES = ['wait', 'patrol', 'jump', 'return'];

class Boss extends SightEnemy {
    isBoss = true;
    state = 'wait';
    stateTicks = 0;
    vanishSide = 1;
    outOfSightTicks = 0;
    hasNoticed = false;

    constructor(column, row, config){
        super(column, row, config);
        this.musicName = config.music;
    }

    updateBehavior(){
        this.stateTicks++;
        this.updateCooldowns();
        this.stopWhenCharacterDead();
        this.getStateUpdates()[this.state]();
    }

    stopWhenCharacterDead(){
        if(this.world.character.isDead() && !CALM_STATES.includes(this.state)){
            this.setState('patrol');
        }
    }

    getStateUpdates(){
        return {
            wait: () => this.updateWait(),
            patrol: () => this.updatePatrol(),
            sneer: () => this.updateSneer(),
            chase: () => this.updateChase(),
            search: () => this.updateSearch()
        };
    }

    updateCooldowns(){
    }

    setState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    updateWait(){
        this.showLoopState('idle', this.settings.animationFps);
        if(this.isCharacterInSight()){
            this.startSneer();
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
        this.markNoticed();
    }

    markNoticed(){
        if(!this.hasNoticed){
            this.hasNoticed = true;
            this.onFirstNotice();
        }
    }

    onFirstNotice(){
        soundManager.playMusic(this.musicName);
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
            this.loseSight();
            return;
        }
        this.faceCharacter();
        if(!this.tryStartAttack()){
            this.walkTowardCharacter();
        }
    }

    loseSight(){
        this.setState('search');
    }

    tryStartAttack(){
        return false;
    }

    walkTowardCharacter(){
        this.showLoopState('walk', this.settings.animationFps);
        if(Math.abs(this.getCharacterOffset()) > 4 && !this.shouldTurn()){
            this.moveForward();
        }
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
}
