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

/**
 * The red enemy. It stands still until it sees the character and then dashes at it. It has no attack, it
 * only hurts by touching. It stops at edges and waits a moment before it turns around.
 */
class Red extends SightEnemy {
    turnTicksLeft = this.settings.turnDelayTicks;

    /**
     * Creates a red enemy on a map cell, looking in a random direction, and starts its game loop.
     * @param {number} column - Map column of the red enemy.
     * @param {number} row - Map row of the red enemy.
     */
    constructor(column, row){
        super(column, row, RED_CONFIG);
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    /**
     * Reacts to the character if it is in sight, otherwise stands still and resets the turn delay.
     * @returns {void}
     */
    updateBehavior(){
        if(this.isCharacterInSight()){
            this.reactToCharacter();
        } else {
            this.turnTicksLeft = this.settings.turnDelayTicks;
            this.showLoopState('idle', this.settings.animationFps);
        }
    }

    /**
     * Decides what to do while the character is in sight: dash if it already looks at the character,
     * otherwise wait for the turn delay, then turn around and dash.
     * @returns {void}
     */
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

    /**
     * Dashes one step towards the character with the fast walk animation, but stands still at an edge or
     * when it has reached the character.
     * @returns {void}
     */
    dashAtCharacter(){
        if(this.hasGroundAhead() && Math.abs(this.getCharacterOffset()) > DASH_STOP_DISTANCE){
            this.showLoopState('walk', this.settings.dashFps);
            this.moveForward();
        } else {
            this.showLoopState('idle', this.settings.animationFps);
        }
    }
}
