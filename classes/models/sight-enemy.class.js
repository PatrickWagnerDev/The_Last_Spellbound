class SightEnemy extends Enemy {
    isCharacterInSight(){
        const PLAYER_CHARACTER = this.world.character;
        return !PLAYER_CHARACTER.isDead() && areRectsOverlapping(PLAYER_CHARACTER.getHitbox(), this.getSightRect());
    }

    getCharacterOffset(){
        return getRectCenterX(this.world.character.getHitbox()) - getRectCenterX(this.getHitbox());
    }

    faceCharacter(){
        this.otherDirection = this.getCharacterOffset() < 0;
    }

    getSightRect(){
        const OWN_RECT = this.getHitbox();
        const SIGHT_RANGE = this.settings.sightTiles * TILE_SIZE;
        const SIGHT_ABOVE = this.settings.sightAboveTiles * TILE_SIZE;
        const SIGHT_BELOW = (this.settings.sightBelowTiles ?? 0) * TILE_SIZE;
        return { x: OWN_RECT.x - SIGHT_RANGE, y: OWN_RECT.y - SIGHT_ABOVE, width: OWN_RECT.width + 2 * SIGHT_RANGE, height: OWN_RECT.height + SIGHT_ABOVE + SIGHT_BELOW };
    }

    getSpawnPoint(spawnOffset){
        const SCALE_FACTOR = this.width / this.frameWidth;
        const SPAWN_X = this.x + (this.otherDirection ? spawnOffset.offsetX : this.frameWidth - spawnOffset.offsetX) * SCALE_FACTOR;
        return { x: SPAWN_X, y: this.y + spawnOffset.offsetY * SCALE_FACTOR };
    }

    spawnEnemyFireball(fireballConfig, spawnOffset){
        const SPAWN_POINT = this.getSpawnPoint(spawnOffset);
        this.world.addProjectile(new EnemyFireball(fireballConfig, SPAWN_POINT.x, SPAWN_POINT.y, this.otherDirection));
    }

    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
