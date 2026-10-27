/**
 * Base class of all projectiles: the fireball of the character, the fireballs of the mage and the mage boss,
 * and the ray of the mage boss. It offers checking whether the projectile has left the level, removing it from
 * the world and hurting the character. Every projectile uses the parts it needs.
 */
class Projectile extends MovableObject {
    /**
     * Tells whether the projectile has left the level to the left or to the right.
     * @returns {boolean} True if it is completely outside the level.
     */
    isOutOfLevel(){
        return this.x < -this.width || this.x > this.world.level.width;
    }

    /**
     * Removes the projectile from the game: stops its timer and takes it out of the list of the world.
     * @returns {void}
     */
    removeSelf(){
        this.stopAnimation();
        this.world.removeProjectile(this);
    }

    /**
     * Hurts the character if it can be hurt and touches the projectile.
     * @param {number} damage - Damage to deal.
     * @param {MovableObject} source - The object the knockback points away from.
     * @returns {boolean} True if the character was hit.
     */
    damagePlayer(damage, source){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt() || !areRectsOverlapping(this.getHitbox(), PLAYER_CHARACTER.getContactRect())){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(damage, source);
        return true;
    }
}
