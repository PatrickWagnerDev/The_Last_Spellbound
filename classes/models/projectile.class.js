class Projectile extends MovableObject {
    isOutOfLevel(){
        return this.x < -this.width || this.x > this.world.level.width;
    }

    removeSelf(){
        this.stopAnimation();
        this.world.removeProjectile(this);
    }

    damagePlayer(damage, source){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt() || !this.isColliding(PLAYER_CHARACTER)){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(damage, source);
        return true;
    }
}
