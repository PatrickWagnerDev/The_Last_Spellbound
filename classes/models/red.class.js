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
    spriteFacesLeft: true,
    deathSound: 'bearDeath',
    bodyShift: -8
};

class Red extends SightEnemy {
    constructor(column, row){
        super(column, row, RED_CONFIG);
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateBehavior(){
        if(this.isCharacterInSight()){
            this.faceCharacter();
            this.dashAtCharacter();
        } else {
            this.showLoopState('idle', this.settings.animationFps);
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
