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
            hurtboxes: [{ offsetX: 32, offsetY: 22, width: 42, height: 56 }],
            spriteFacesLeft: true,
            deathSound: 'bearDeath'
        });
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateBehavior(){
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }
}
