const BEAR_SPRITES = {
    walk: { path: './assets/image/03-monsters/1 Bear/Walk.png', frames: 6 },
    hurt: { path: './assets/image/03-monsters/1 Bear/Hurt.png', frames: 4 },
    death: { path: './assets/image/03-monsters/1 Bear/Death.png', frames: 6 }
};

class Bear extends Enemy {
    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.bear,
            sprites: BEAR_SPRITES,
            frameSize: 40,
            hitbox: { offsetX: 28, offsetY: 20, width: 48, height: 60 },
            spriteFacesLeft: true
        });
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateBehavior(){
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }

    patrolPlatform(){
        if(!this.onGround){
            return;
        }
        if(this.shouldTurn()){
            this.otherDirection = !this.otherDirection;
        }
        this.moveForward();
    }

    shouldTurn(){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        const PROBE_X = this.x + this.width / 2 + STEP_DIRECTION * this.width / 2;
        const PROBE_Y = this.y + this.height + 1;
        const IS_OUT_OF_BOUNDS = PROBE_X < 0 || PROBE_X > this.world.level.width;
        return IS_OUT_OF_BOUNDS || !this.world.level.isWalkableAt(PROBE_X, PROBE_Y);
    }
}
