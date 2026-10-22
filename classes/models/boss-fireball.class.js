const IMAGE_BOSS_FIREBALL = './assets/image/04-bosses/1 Mage/Attack2_3_FireBall.png';

class BossFireball extends MovableObject {
    settings = GAME_SETTINGS.mageBoss;
    frameWidth = 10;
    frameHeight = 10;
    frameCount = 1;

    constructor(centerX, centerY, isFacingLeft){
        super();
        this.loadImage(IMAGE_BOSS_FIREBALL);
        this.width = 10 * this.settings.fireballScale;
        this.height = 10 * this.settings.fireballScale;
        this.hitbox = { offsetX: 0, offsetY: 0, width: this.width, height: this.height };
        this.speed = GAME_SETTINGS.fireball.speed;
        this.otherDirection = isFacingLeft;
        this.x = centerX - this.width / 2;
        this.y = centerY - this.height / 2;
        this.startAnimation();
    }

    updateObject(){
        this.moveForward();
        if(this.isOutOfLevel() || this.hitsCharacter()){
            this.removeSelf();
        }
    }

    hitsCharacter(){
        const PLAYER_CHARACTER = this.world.character;
        if(!PLAYER_CHARACTER.canBeHurt() || !this.isColliding(PLAYER_CHARACTER)){
            return false;
        }
        PLAYER_CHARACTER.receiveHit(this.settings.fireballDamage, this);
        return true;
    }

    isOutOfLevel(){
        return this.x < -this.width || this.x > this.world.level.width;
    }

    removeSelf(){
        this.stopAnimation();
        this.world.removeProjectile(this);
    }
}
