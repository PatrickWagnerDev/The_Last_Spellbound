const IMAGE_BOSS_RAY = './assets/image/04-bosses/1 Mage/Attack4_Ray.png';
const RAY_STAGE_ROWS = [[4, 9], [2, 11], [1, 12], [0, 13]];

class BossRay extends MovableObject {
    settings = GAME_SETTINGS.mageBoss;
    frameWidth = 14;
    frameHeight = 14;
    frameCount = 4;
    animationFps = 0;
    age = 0;
    length = 0;

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

    updateObject(){
        this.age++;
        this.length = Math.min(this.age * this.speed, this.getMaxLength());
        this.updateGeometry();
        this.hitCharacter();
        if(this.age >= this.settings.rayTicks){
            this.removeSelf();
        }
    }

    getMaxLength(){
        return this.isFacingLeft ? this.originX : this.world.level.width - this.originX;
    }

    updateGeometry(){
        this.currentFrame = getProgressFrame(this.age, this.settings.rayTicks, 4);
        this.width = this.length;
        this.height = 14 * this.settings.rayScale;
        this.x = this.isFacingLeft ? this.originX - this.length : this.originX;
        this.y = this.originY - this.height / 2;
    }

    getHitbox(){
        const STAGE_ROWS = RAY_STAGE_ROWS[this.currentFrame];
        const SCALE_FACTOR = this.settings.rayScale;
        return { x: this.x, y: this.y + STAGE_ROWS[0] * SCALE_FACTOR, width: this.length, height: (STAGE_ROWS[1] - STAGE_ROWS[0]) * SCALE_FACTOR };
    }

    hitCharacter(){
        const PLAYER_CHARACTER = this.world.character;
        if(PLAYER_CHARACTER.canBeHurt() && areRectsOverlapping(PLAYER_CHARACTER.getHitbox(), this.getHitbox())){
            PLAYER_CHARACTER.receiveHit(this.settings.rayDamage, this.owner);
        }
    }

    removeSelf(){
        this.stopAnimation();
        this.world.removeProjectile(this);
    }
}
