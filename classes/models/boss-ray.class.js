const IMAGE_BOSS_RAY = './assets/image/04-bosses/1 Mage/Attack4_Ray.png';
const RAY_STAGE_ROWS = [[4, 9], [2, 11], [1, 12], [0, 13]];

/**
 * The ray of the mage boss. It starts at the boss and grows longer and faster than a fireball, up to the end
 * of the level or until its time is over. Its picture changes in four stages and its hit area gets thicker.
 * It hurts the character as long as it touches it, the grace time prevents repeated hits.
 */
class BossRay extends Projectile {
    settings = GAME_SETTINGS.mageBoss;
    frameWidth = 14;
    frameHeight = 14;
    frameCount = 4;
    animationFps = 0;
    age = 0;
    length = 0;

    /**
     * Creates the ray at a start point of the boss, in the direction the boss looks, and starts its game loop.
     * @param {MageBoss} owner - The boss that shoots the ray.
     * @param {number} originX - Horizontal position of the start of the ray.
     * @param {number} originY - Vertical position of the middle of the ray.
     */
    constructor(owner, originX, originY){
        super();
        this.owner = owner;
        this.originX = originX;
        this.originY = originY;
        this.isFacingLeft = owner.otherDirection;
        this.loadImage(IMAGE_BOSS_RAY);
        this.speed = GAME_SETTINGS.fireball.speed * this.settings.raySpeedFactor;
        this.startAnimation();
    }

    /**
     * Runs one tick: the ray grows longer up to the end of the level, hurts the character if it touches it and
     * is removed when its time is over.
     * @returns {void}
     */
    updateObject(){
        this.age++;
        this.length = Math.min(this.age * this.speed, this.getMaxLength());
        this.updateGeometry();
        this.damagePlayer(this.settings.rayDamage, this.owner);
        if(this.age >= this.settings.rayTicks){
            this.removeSelf();
        }
    }

    /**
     * Calculates the longest the ray can get: up to the border of the level in its direction.
     * @returns {number} Maximum length in pixels.
     */
    getMaxLength(){
        return this.isFacingLeft ? this.originX : this.world.level.width - this.originX;
    }

    /**
     * Sets the picture, the size and the position for the current length and age of the ray.
     * @returns {void}
     */
    updateGeometry(){
        this.currentFrame = getProgressFrame(this.age, this.settings.rayTicks, 4);
        this.width = this.length;
        this.height = 14 * this.settings.rayScale;
        this.x = this.isFacingLeft ? this.originX - this.length : this.originX;
        this.y = this.originY - this.height / 2;
    }

    /**
     * Returns the hit area of the ray, which gets thicker with the stage of the picture.
     * @returns {{x: number, y: number, width: number, height: number}} The hit area rectangle.
     */
    getHitbox(){
        const STAGE_ROWS = RAY_STAGE_ROWS[this.currentFrame];
        const SCALE_FACTOR = this.settings.rayScale;
        return { x: this.x, y: this.y + STAGE_ROWS[0] * SCALE_FACTOR, width: this.length, height: (STAGE_ROWS[1] - STAGE_ROWS[0]) * SCALE_FACTOR };
    }
}
