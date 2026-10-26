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

    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
