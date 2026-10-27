const BOSS_FIREBALL = { settings: GAME_SETTINGS.mageBoss, path: './assets/image/04-bosses/1 Mage/Attack2_3_FireBall.png', frameSize: 10, frames: 1, fps: 0 };
const MAGE_FIREBALL = { settings: GAME_SETTINGS.mage, path: './assets/image/03-monsters/2 Mage/Attack_ball.png', frameSize: 6, frames: 8, fps: GAME_SETTINGS.mage.fireballFps };

/**
 * The fireball of the mage and the mage boss. It flies straight in one direction without a range. When it
 * hits the character it does damage, plays the impact sound and disappears, and it is removed when it leaves
 * the level.
 */
class EnemyFireball extends Projectile {
    /**
     * Creates the fireball with its center at a start point and starts its game loop.
     * @param {object} config - Picture, size and settings of the fireball type.
     * @param {number} centerX - Horizontal position of the center at the start.
     * @param {number} centerY - Vertical position of the center at the start.
     * @param {boolean} isFacingLeft - True if it flies to the left.
     */
    constructor(config, centerX, centerY, isFacingLeft){
        super();
        this.applyConfig(config);
        this.speed = GAME_SETTINGS.fireball.speed;
        this.otherDirection = isFacingLeft;
        this.x = centerX - this.width / 2;
        this.y = centerY - this.height / 2;
        this.startAnimation();
    }

    /**
     * Copies the config into the properties: settings, picture, frame size, animation and the size, with a hitbox
     * that covers the whole fireball.
     * @param {object} config - Picture, size and settings of the fireball type.
     * @returns {void}
     */
    applyConfig(config){
        this.settings = config.settings;
        this.loadImage(config.path);
        this.frameWidth = config.frameSize;
        this.frameHeight = config.frameSize;
        this.frameCount = config.frames;
        this.animationFps = config.fps;
        this.width = config.frameSize * this.settings.fireballScale;
        this.height = this.width;
        this.hitbox = { offsetX: 0, offsetY: 0, width: this.width, height: this.height };
    }

    /**
     * Runs one tick: flies one step, is removed outside of the level, and hurts the character and disappears
     * when it hits.
     * @returns {void}
     */
    updateObject(){
        this.moveForward();
        if(this.isOutOfLevel()){
            this.removeSelf();
        } else if(this.damagePlayer(this.settings.fireballDamage, this)){
            soundManager.playSound('fireballImpact');
            this.removeSelf();
        }
    }
}
