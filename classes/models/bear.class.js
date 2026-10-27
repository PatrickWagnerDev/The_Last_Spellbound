const BEAR_SPRITES = {
    walk: { path: './assets/image/03-monsters/1 Bear/Walk.png', frames: 6 },
    hurt: { path: './assets/image/03-monsters/1 Bear/Hurt.png', frames: 4 },
    death: { path: './assets/image/03-monsters/1 Bear/Death.png', frames: 6 }
};

/**
 * The bear, the simplest enemy: it does not see the character and only walks back and forth on its
 * platform. It hurts the character by touching it.
 */
class Bear extends Enemy {
    /**
     * Creates a bear on a map cell, looking in a random direction, and starts its game loop.
     * @param {number} column - Map column of the bear.
     * @param {number} row - Map row of the bear.
     */
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

    /**
     * Shows the walk animation and patrols on the platform.
     * @returns {void}
     */
    updateBehavior(){
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }
}
