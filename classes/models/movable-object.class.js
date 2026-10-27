/**
 * Base class for everything that moves or lives in the game: character, enemies, items, projectiles and
 * portals. It adds the game loop of the object, movement and gravity, hitboxes and collisions, and health
 * with damage, knockback and death.
 */
class MovableObject extends DrawableObject{
    speed = 5;
    speedY = 0;
    onGround = false;
    world;
    hitbox = { offsetX: 0, offsetY: 0, width: 100, height: 100 };
    maxHealth = 1;
    health = 1;
    hurtTicksLeft = 0;
    knockbackDirection = 1;
    deadTicks = 0;

    /**
     * Starts the game loop of this object: 60 times per second it runs updateObject and then nextFrame,
     * unless the object is frozen.
     * @returns {void}
     */
    startAnimation(){
        this.animationInterval = setInterval(() => {
            if(this.isFrozen()){
                return;
            }
            this.updateObject();
            this.nextFrame();
        }, 1000 / TICKS_PER_SECOND);
    }

    /**
     * Tells whether the object stands still, which is the case while the game is paused.
     * @returns {boolean} True if updateObject and nextFrame are skipped.
     */
    isFrozen(){
        return this.world?.isPaused ?? false;
    }

    /**
     * Sets up the images of the object: the first one is shown, all of them are loaded into the image cache.
     * @param {string[]} paths - Paths of all sprite sheets of this object.
     * @returns {void}
     */
    setupSprites(paths){
        this.loadImage(paths[0]);
        this.loadImages(paths);
        this.currentPath = paths[0];
    }

    /**
     * Shows a state as a looping animation and sets the matching hitbox.
     * @param {string} stateName - Key of the state in this.sprites, for example 'walk'.
     * @param {number} fps - Animation speed in frames per second.
     * @returns {void}
     */
    showLoopState(stateName, fps){
        const SPRITE_DATA = this.sprites[stateName];
        this.applyStateHitbox(stateName);
        this.setSprite(SPRITE_DATA.path, SPRITE_DATA.frames, fps);
    }

    /**
     * Shows one fixed frame of a state without animating it.
     * @param {string} stateName - Key of the state in this.sprites.
     * @param {number} frameIndex - Index of the frame to show.
     * @returns {void}
     */
    showFrameState(stateName, frameIndex){
        this.showLoopState(stateName, 0);
        this.currentFrame = frameIndex;
    }

    /**
     * Shows a state whose animation is spread over a fixed duration and sets the matching hitbox.
     * @param {string} stateName - Key of the state in this.sprites.
     * @param {number} elapsedTicks - Ticks since the state started.
     * @param {number} totalTicks - Duration of the whole state in ticks.
     * @returns {void}
     */
    showProgressState(stateName, elapsedTicks, totalTicks){
        const SPRITE_DATA = this.sprites[stateName];
        this.applyStateHitbox(stateName);
        this.setProgressSprite(SPRITE_DATA.path, SPRITE_DATA.frames, elapsedTicks, totalTicks);
    }

    /**
     * Hook for subclasses that change their hitbox with the state. Does nothing here.
     * @param {string} stateName - Key of the state that is shown.
     * @returns {void}
     */
    applyStateHitbox(stateName){
    }

    /**
     * Stops the game loop of this object.
     * @returns {void}
     */
    stopAnimation(){
        clearInterval(this.animationInterval);
    }

    /**
     * Hook for the logic of one tick, every subclass overrides it. Does nothing here.
     * @returns {void}
     */
    updateObject(){
    }

    /**
     * Moves the object to the right by its speed.
     * @returns {void}
     */
    moveRight(){
        this.x += this.speed;
    }

    /**
     * Moves the object to the left by its speed.
     * @returns {void}
     */
    moveLeft(){
        this.x -= this.speed;
    }

    /**
     * Moves the object by its speed in the direction it looks.
     * @returns {void}
     */
    moveForward(){
        if(this.otherDirection){
            this.moveLeft();
        } else {
            this.moveRight();
        }
    }

    /**
     * Applies gravity for one tick: moves the object by its vertical speed, checks whether it landed on a
     * tile and otherwise pulls the speed down.
     * @returns {void}
     */
    applyGravity(){
        const PREVIOUS_FEET = this.y + this.height;
        this.y -= this.speedY;
        this.onGround = this.speedY <= 0 && this.landOnTile(PREVIOUS_FEET);
        if(!this.onGround){
            this.speedY -= GAME_SETTINGS.physics.gravityForce;
        }
    }

    /**
     * Checks whether the feet reach the top of a walkable tile in this tick and, if so, puts the object
     * on it. Tiles only carry from above: an object that was already below the top does not land.
     * @param {number} previousFeet - Y position of the feet before this tick's movement.
     * @returns {boolean} True if the object landed on a tile.
     */
    landOnTile(previousFeet){
        const FEET_Y = this.y + this.height;
        const TILE_TOP = Math.floor(FEET_Y / TILE_SIZE) * TILE_SIZE;
        if(!this.hasSupportAt(FEET_Y) || previousFeet > TILE_TOP){
            return false;
        }
        this.y = TILE_TOP - this.height;
        this.speedY = 0;
        return true;
    }

    /**
     * Checks whether a walkable tile lies under at least one support point of the object.
     * @param {number} feetY - Y position at the feet to check.
     * @returns {boolean} True if the object has ground under its feet.
     */
    hasSupportAt(feetY){
        return this.getSupportXs().some(feetX => this.world.level.isWalkableAt(feetX, feetY));
    }

    /**
     * Returns the x positions with which the object feels the ground, by default only its center.
     * @returns {number[]} The x positions of the support points.
     */
    getSupportXs(){
        return [this.x + this.width / 2];
    }

    /**
     * Converts a box given as an offset from the object into a rectangle in world coordinates. The box is
     * mirrored with the object.
     * @param {{offsetX: number, offsetY: number, width: number, height: number}} box - Box relative to the object.
     * @returns {{x: number, y: number, width: number, height: number}} The box in world coordinates.
     */
    getBoxRect(box){
        const OFFSET_X = this.isFlipped()
            ? this.width - box.offsetX - box.width
            : box.offsetX;
        return {
            x: this.x + OFFSET_X,
            y: this.y + box.offsetY,
            width: box.width,
            height: box.height
        };
    }

    /**
     * Returns the hitbox of the object in world coordinates.
     * @returns {{x: number, y: number, width: number, height: number}} The hitbox rectangle.
     */
    getHitbox(){
        return this.getBoxRect(this.hitbox);
    }

    /**
     * Checks whether the hitbox of this object overlaps a rectangle.
     * @param {{x: number, y: number, width: number, height: number}} rect - Rectangle in world coordinates.
     * @returns {boolean} True if they share some area.
     */
    isOverlapping(rect){
        return areRectsOverlapping(this.getHitbox(), rect);
    }

    /**
     * Checks whether the hitbox of this object overlaps the hitbox of another object.
     * @param {MovableObject} movable - The other object.
     * @returns {boolean} True if the hitboxes overlap.
     */
    isColliding(movable){
        return this.isOverlapping(movable.getHitbox());
    }

    /**
     * Draws the outline of a rectangle, used to show hitboxes while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {{x: number, y: number, width: number, height: number}} rect - Rectangle in world coordinates.
     * @param {string} color - Outline color, any CSS color.
     * @returns {void}
     */
    drawRect(ctx, rect, color){
        ctx.strokeStyle = color;
        ctx.strokeRect(Math.round(rect.x) + 0.5, Math.round(rect.y) + 0.5, rect.width, rect.height);
    }

    /**
     * Draws the hitbox of the object, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {string} color - Outline color, any CSS color.
     * @returns {void}
     */
    drawHitbox(ctx, color){
        this.drawRect(ctx, this.getHitbox(), color);
    }

    /**
     * Reduces the health by an amount, but not below zero.
     * @param {number} amount - Damage to take.
     * @returns {void}
     */
    takeDamage(amount){
        this.health = Math.max(this.health - amount, 0);
    }

    /**
     * Raises the health by an amount, but not above the maximum.
     * @param {number} amount - Health to restore.
     * @returns {void}
     */
    restoreHealth(amount){
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    /**
     * Checks whether a living object has fallen out of the level through a hole.
     * @returns {boolean} True if the top of the hitbox is below the level.
     */
    hasFallenOut(){
        return !this.isDead() && this.getHitbox().y > this.world.level.height;
    }

    /**
     * Kills the object at once after a fall: takes all health and counts the death animation as finished.
     * @returns {void}
     */
    dieByFall(){
        this.takeDamage(this.maxHealth);
        this.deadTicks = this.getDeathTicks();
    }

    /**
     * Tells whether the object has no health left.
     * @returns {boolean} True if the health is 0 or less.
     */
    isDead(){
        return this.health <= 0;
    }

    /**
     * Returns the duration of the death animation. Subclasses with a death animation override it.
     * @returns {number} Duration in ticks, 0 here.
     */
    getDeathTicks(){
        return 0;
    }

    /**
     * Plays the death animation one tick further.
     * @param {string} stateName - Key of the death state in this.sprites, for example 'death'.
     * @returns {void}
     */
    advanceDeath(stateName){
        this.deadTicks++;
        this.showProgressState(stateName, this.deadTicks, this.getDeathTicks());
    }

    /**
     * Tells whether the object is dead and its death animation has finished.
     * @returns {boolean} True if the object can be removed or the game can end.
     */
    hasDeathFinished(){
        return this.isDead() && this.deadTicks >= this.getDeathTicks();
    }

    /**
     * Tells whether the object is in its hurt phase after a hit.
     * @returns {boolean} True while hurtTicksLeft is above 0.
     */
    isHurt(){
        return this.hurtTicksLeft > 0;
    }

    /**
     * Runs one tick of the hurt phase: pushes the object back and counts the hurt time down.
     * @returns {void}
     */
    updateHurt(){
        if(!this.isHurt()){
            return;
        }
        this.x += this.getKnockbackStep();
        this.hurtTicksLeft = tickDown(this.hurtTicksLeft);
    }

    /**
     * Calculates how far the knockback pushes the object in this tick. It starts with the knockback speed
     * and fades out linearly over the hurt time.
     * @returns {number} Horizontal step in pixels, negative to the left.
     */
    getKnockbackStep(){
        return this.knockbackDirection * this.settings.knockbackSpeed * this.hurtTicksLeft / this.settings.hurtTicks;
    }

    /**
     * Starts the hurt phase: the object is pushed away from the source of the hit.
     * @param {MovableObject} source - The object that caused the hit.
     * @returns {void}
     */
    startKnockback(source){
        const IS_SOURCE_RIGHT = getRectCenterX(source.getHitbox()) > getRectCenterX(this.getHitbox());
        this.knockbackDirection = IS_SOURCE_RIGHT ? -1 : 1;
        this.hurtTicksLeft = this.settings.hurtTicks;
    }

    /**
     * Returns how many ticks the hurt phase has already lasted.
     * @returns {number} Ticks since the hit.
     */
    getHurtElapsed(){
        return this.settings.hurtTicks - this.hurtTicksLeft;
    }
}
