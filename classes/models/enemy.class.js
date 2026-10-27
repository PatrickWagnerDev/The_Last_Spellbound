const EDGE_PROBE_DISTANCE = 24;

/**
 * Base class of all enemies and bosses. It builds an enemy from its config and runs the common tick: falling,
 * death, hurt phase, gravity and then the behavior of the subclass. It also handles hits with knockback,
 * turning at edges, the hurt boxes that touch the character, and the removal after death.
 */
class Enemy extends MovableObject {
    isBoss = false;

    /**
     * Builds the enemy from its config and puts it on a map cell with its feet on the bottom edge of the cell.
     * @param {number} column - Map column of the enemy.
     * @param {number} row - Map row of the enemy.
     * @param {object} config - Settings, sprites, frame size, hitbox, hurt boxes and sounds of this enemy type.
     */
    constructor(column, row, config){
        super();
        this.applyConfig(config);
        this.applyStats();
        this.frameCount = Object.values(this.sprites)[0].frames;
        this.setupSprites(Object.values(this.sprites).map(sprite => sprite.path));
        this.x = column * TILE_SIZE;
        this.y = (row + 1) * TILE_SIZE - this.height;
    }

    /**
     * Copies the config into the properties of the enemy.
     * @param {object} config - Settings, sprites, frame size, hitbox, hurt boxes, facing and sounds.
     * @returns {void}
     */
    applyConfig(config){
        this.settings = config.settings;
        this.sprites = config.sprites;
        this.width = this.settings.width;
        this.height = this.settings.height;
        this.frameWidth = config.frameSize;
        this.frameHeight = config.frameSize;
        this.hitbox = config.hitbox;
        this.hurtboxes = config.hurtboxes;
        this.spriteFacesLeft = config.spriteFacesLeft;
        this.deathSound = config.deathSound;
        this.bodyShift = config.bodyShift ?? 0;
    }

    /**
     * Takes speed, animation speed and health from the settings and fills the health.
     * @returns {void}
     */
    applyStats(){
        this.speed = this.settings.speed;
        this.animationFps = this.settings.animationFps;
        this.maxHealth = this.settings.maxHealth;
        this.health = this.maxHealth;
    }

    /**
     * Takes a hit: the enemy loses health and plays the death sound if it died, otherwise the hit sound and
     * its reaction.
     * @param {number} damage - Damage to take.
     * @param {MovableObject} source - The object that caused the hit.
     * @returns {void}
     */
    receiveHit(damage, source){
        this.takeDamage(damage);
        if(this.isDead()){
            soundManager.playSound(this.deathSound);
            return;
        }
        soundManager.playSound('enemyHit');
        this.reactToHit(source);
    }

    /**
     * Reacts to a hit that did not kill: the enemy is pushed away from the source and looks at it.
     * @param {MovableObject} source - The object that caused the hit.
     * @returns {void}
     */
    reactToHit(source){
        this.startKnockback(source);
        this.otherDirection = this.knockbackDirection > 0;
    }

    /**
     * Runs one tick of the enemy: falling, death, hurt phase and gravity, and then its behavior. While it is
     * hurt only the hurt animation plays.
     * @returns {void}
     */
    updateObject(){
        this.checkFall();
        if(this.isDead()){
            this.updateDeath();
            return;
        }
        this.updateHurt();
        this.applyGravity();
        if(this.isHurt()){
            this.showProgressState('hurt', this.getHurtElapsed(), this.settings.hurtTicks);
            return;
        }
        this.updateBehavior();
    }

    /**
     * Kills the enemy at once and plays its death sound if it has fallen out of the level.
     * @returns {void}
     */
    checkFall(){
        if(this.hasFallenOut()){
            this.dieByFall();
            soundManager.playSound(this.deathSound);
        }
    }

    /**
     * Hook for the behavior of one tick, every enemy type overrides it. Does nothing here.
     * @returns {void}
     */
    updateBehavior(){
    }

    /**
     * Patrols on the platform: it turns around at an edge or the end of the level and walks one step
     * forward. Only works on the ground.
     * @returns {void}
     */
    patrolPlatform(){
        if(!this.onGround){
            return;
        }
        if(this.shouldTurn()){
            this.otherDirection = !this.otherDirection;
        }
        this.moveForward();
    }

    /**
     * Returns the x position of a point ahead of the enemy, measured from the middle of its hitbox in the
     * direction it looks.
     * @param {number} distance - Distance ahead in pixels.
     * @returns {number} The x position of the probe point.
     */
    getProbeX(distance){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        return getRectCenterX(this.getHitbox()) + STEP_DIRECTION * distance;
    }

    /**
     * Tells whether there is walkable ground a short distance ahead, just under the feet.
     * @returns {boolean} True if the enemy does not stand at an edge.
     */
    hasGroundAhead(){
        return this.world.level.isWalkableAt(this.getProbeX(EDGE_PROBE_DISTANCE), this.y + this.height + 1);
    }

    /**
     * Returns the hurt boxes of the enemy in world coordinates, mirrored with the enemy.
     * @returns {{x: number, y: number, width: number, height: number}[]} The hurt box rectangles.
     */
    getHurtRects(){
        return this.hurtboxes.map(box => this.getBoxRect(box));
    }

    /**
     * Tells whether any hurt box of the enemy touches a rectangle. Touching several boxes still gives one answer.
     * @param {{x: number, y: number, width: number, height: number}} rect - Rectangle in world coordinates.
     * @returns {boolean} True if at least one hurt box overlaps the rectangle.
     */
    touchesRect(rect){
        return this.getHurtRects().some(hurtRect => areRectsOverlapping(hurtRect, rect));
    }

    /**
     * Draws the hurt boxes of the enemy, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {string} color - Outline color, any CSS color.
     * @returns {void}
     */
    drawHurtboxes(ctx, color){
        this.getHurtRects().forEach(hurtRect => this.drawRect(ctx, hurtRect, color));
    }

    /**
     * Draws the current frame shifted by the body shift, which puts the body of the figure in the middle of
     * the hitbox so that it does not jump when the enemy turns around.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {number} drawX - Horizontal position to draw at, this.x or 0 when the context is mirrored.
     * @returns {void}
     */
    drawFrame(ctx, drawX){
        super.drawFrame(ctx, drawX + this.bodyShift);
    }

    /**
     * Tells whether the enemy has to turn around: just below the front edge of its body is no ground or the
     * level ends.
     * @returns {boolean} True at an edge or at the end of the level.
     */
    shouldTurn(){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        const PROBE_X = this.x + this.width / 2 + STEP_DIRECTION * this.width / 2;
        const PROBE_Y = this.y + this.height + 1;
        const IS_OUT_OF_BOUNDS = PROBE_X < 0 || PROBE_X > this.world.level.width;
        return IS_OUT_OF_BOUNDS || !this.world.level.isWalkableAt(PROBE_X, PROBE_Y);
    }

    /**
     * Hook for subclasses that draw extra areas while debugging, such as the sight area. Does nothing here.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawDebugArea(ctx){
    }

    /**
     * Runs one tick of a dead enemy: it falls to the ground, its death animation plays and it is removed when
     * the animation has finished.
     * @returns {void}
     */
    updateDeath(){
        this.applyGravity();
        this.advanceDeath('death');
        if(this.hasDeathFinished()){
            this.finishDeath();
        }
    }

    /**
     * Returns the duration of the death animation.
     * @returns {number} Duration in ticks.
     */
    getDeathTicks(){
        return this.settings.deathTicks;
    }

    /**
     * Removes the enemy for good: stops its timer and takes it out of the level.
     * @returns {void}
     */
    finishDeath(){
        this.stopAnimation();
        this.world.level.removeEnemy(this);
    }
}
