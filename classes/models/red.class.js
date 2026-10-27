const DASH_STOP_DISTANCE = 4;

const RED_SPRITES = {
    idle: { path: './assets/image/03-monsters/4 Red/Idle.png', frames: 4 },
    walk: { path: './assets/image/03-monsters/4 Red/Walk.png', frames: 6 },
    hurt: { path: './assets/image/03-monsters/4 Red/Hurt.png', frames: 4 },
    death: { path: './assets/image/03-monsters/4 Red/Death.png', frames: 4 }
};

const RED_CONFIG = {
    settings: GAME_SETTINGS.red,
    sprites: RED_SPRITES,
    frameSize: 32,
    hitbox: { offsetX: 12, offsetY: 8, width: 40, height: 56 },
    hurtboxes: [{ offsetX: 16, offsetY: 10, width: 32, height: 52 }],
    spriteFacesLeft: true,
    deathSound: 'bearDeath',
    bodyShift: -8
};

class Red extends SightEnemy {
    turnTicksLeft = this.settings.turnDelayTicks;

    constructor(column, row){
        super(column, row, RED_CONFIG);
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateBehavior(){
        if(this.isCharacterInSight()){
            this.reactToCharacter();
        } else {
            this.turnTicksLeft = this.settings.turnDelayTicks;
            this.showLoopState('idle', this.settings.animationFps);
        }
    }

    reactToCharacter(){
        const IS_FACING = (this.getCharacterOffset() < 0) === this.otherDirection;
        if(IS_FACING){
            this.turnTicksLeft = this.settings.turnDelayTicks;
            this.dashAtCharacter();
        } else if(this.turnTicksLeft > 0){
            this.turnTicksLeft--;
            this.showLoopState('idle', this.settings.animationFps);
        } else {
            this.faceCharacter();
            this.dashAtCharacter();
        }
    }

    dashAtCharacter(){
        if(this.hasGroundAhead() && Math.abs(this.getCharacterOffset()) > DASH_STOP_DISTANCE){
            this.showLoopState('walk', this.settings.dashFps);
            this.moveForward();
        } else {
            this.showLoopState('idle', this.settings.animationFps);
        }
    }
}
