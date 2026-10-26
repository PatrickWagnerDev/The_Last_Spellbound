const BOSS_FIREBALL = { settings: GAME_SETTINGS.mageBoss, path: './assets/image/04-bosses/1 Mage/Attack2_3_FireBall.png', frameSize: 10, frames: 1, fps: 0 };
const MAGE_FIREBALL = { settings: GAME_SETTINGS.mage, path: './assets/image/03-monsters/2 Mage/Attack_ball.png', frameSize: 6, frames: 8, fps: GAME_SETTINGS.mage.fireballFps };

class EnemyFireball extends Projectile {
    constructor(config, centerX, centerY, isFacingLeft){
        super();
        this.applyConfig(config);
        this.speed = GAME_SETTINGS.fireball.speed;
        this.otherDirection = isFacingLeft;
        this.x = centerX - this.width / 2;
        this.y = centerY - this.height / 2;
        this.startAnimation();
    }

    applyConfig(config){
        this.settings = config.settings;
        this.loadImage(config.path);
        this.frameWidth = config.frameSize;
        this.frameHeight = config.frameSize;
        this.frameCount = config.frames;
        this.animationFps = config.fps;
        this.width = config.frameSize * this.settings.fireballScale;
        this.height = this.width;
        this.hitbox = { offsetX: 0, offsetY: 0, width: this.width, height: this.height };
    }

    updateObject(){
        this.moveForward();
        if(this.isOutOfLevel()){
            this.removeSelf();
        } else if(this.damagePlayer(this.settings.fireballDamage, this)){
            soundManager.playSound('fireballImpact');
            this.removeSelf();
        }
    }
}
