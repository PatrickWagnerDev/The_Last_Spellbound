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

    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
