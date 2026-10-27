/**
 * Base class for enemies that can see the character: mage, red enemy and all bosses. It adds the sight area,
 * the distance and direction to the character, looking at it and shooting fireballs.
 */
class SightEnemy extends Enemy {
    /**
     * Tells whether the enemy sees the character: it is alive and its hitbox touches the sight area.
     * @returns {boolean} True if the character is in sight.
     */
    isCharacterInSight(){
        const PLAYER_CHARACTER = this.world.character;
        return !PLAYER_CHARACTER.isDead() && areRectsOverlapping(PLAYER_CHARACTER.getHitbox(), this.getSightRect());
    }

    /**
     * Returns the horizontal distance from the enemy to the character, measured between the middles of the
     * hitboxes.
     * @returns {number} Positive if the character is to the right, negative if it is to the left.
     */
    getCharacterOffset(){
        return getRectCenterX(this.world.character.getHitbox()) - getRectCenterX(this.getHitbox());
    }

    /**
     * Turns the enemy so that it looks at the character.
     * @returns {void}
     */
    faceCharacter(){
        this.otherDirection = this.getCharacterOffset() < 0;
    }

    /**
     * Calculates the sight area: a rectangle around the hitbox that reaches the same distance to the left and
     * to the right and is extended upwards and, if the settings say so, downwards.
     * @returns {{x: number, y: number, width: number, height: number}} The sight rectangle.
     */
    getSightRect(){
        const OWN_RECT = this.getHitbox();
        const SIGHT_RANGE = this.settings.sightTiles * TILE_SIZE;
        const SIGHT_ABOVE = this.settings.sightAboveTiles * TILE_SIZE;
        const SIGHT_BELOW = (this.settings.sightBelowTiles ?? 0) * TILE_SIZE;
        return { x: OWN_RECT.x - SIGHT_RANGE, y: OWN_RECT.y - SIGHT_ABOVE, width: OWN_RECT.width + 2 * SIGHT_RANGE, height: OWN_RECT.height + SIGHT_ABOVE + SIGHT_BELOW };
    }

    /**
     * Calculates where a projectile of the enemy starts, for example at the tip of its staff. The offset is
     * given in sprite pixels and is measured from the side the enemy looks to.
     * @param {{offsetX: number, offsetY: number}} spawnOffset - Start point in the sprite frame.
     * @returns {{x: number, y: number}} The start point in world coordinates.
     */
    getSpawnPoint(spawnOffset){
        const SCALE_FACTOR = this.width / this.frameWidth;
        const SPAWN_X = this.x + (this.otherDirection ? spawnOffset.offsetX : this.frameWidth - spawnOffset.offsetX) * SCALE_FACTOR;
        return { x: SPAWN_X, y: this.y + spawnOffset.offsetY * SCALE_FACTOR };
    }

    /**
     * Shoots a fireball from the start point of the enemy in the direction it looks.
     * @param {object} fireballConfig - Picture, size and settings of the fireball type.
     * @param {{offsetX: number, offsetY: number}} spawnOffset - Start point in the sprite frame.
     * @returns {void}
     */
    spawnEnemyFireball(fireballConfig, spawnOffset){
        const SPAWN_POINT = this.getSpawnPoint(spawnOffset);
        this.world.addProjectile(new EnemyFireball(fireballConfig, SPAWN_POINT.x, SPAWN_POINT.y, this.otherDirection));
    }

    /**
     * Draws the sight area as a yellow outline, used while debugging.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
