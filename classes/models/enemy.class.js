const IMAGE_BEAR_WALK = './assets/image/03-monsters/1 Bear/Walk.png';
const IMAGE_BEAR_DEATH = './assets/image/03-monsters/1 Bear/Death.png';
const IMAGE_BEAR_HURT = './assets/image/03-monsters/1 Bear/Hurt.png';

class Enemy extends MovableObject {
    settings = GAME_SETTINGS.enemy;
    width = this.settings.width;
    height = this.settings.height;
    frameWidth = 40;
    frameHeight = 40;
    frameCount = 6;
    hitbox = { offsetX: 28, offsetY: 20, width: 48, height: 60 };
    speed = this.settings.speed;
    animationFps = this.settings.animationFps;
    maxHealth = this.settings.maxHealth;
    health = this.maxHealth;
    spriteFacesLeft = true;
    deadTicks = 0;

    constructor(column, row){
        super().loadImage(IMAGE_BEAR_WALK);
        this.loadImages([IMAGE_BEAR_WALK, IMAGE_BEAR_DEATH, IMAGE_BEAR_HURT]);
        this.currentPath = IMAGE_BEAR_WALK;
        this.x = column * TILE_SIZE;
        this.y = (row + 1) * TILE_SIZE - this.height;
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    receiveHit(damage, source){
        this.takeDamage(damage);
        if(!this.isDead()){
            this.startKnockback(source);
            this.otherDirection = this.knockbackDirection > 0;
        }
    }

    updateObject(){
        if(this.isDead()){
            this.updateDeath();
            return;
        }
        this.updateHurt();
        this.applyGravity();
        if(this.isHurt()){
            this.setSprite(IMAGE_BEAR_HURT, 4, 0);
            this.currentFrame = this.getHurtFrame(4);
            return;
        }
        this.setSprite(IMAGE_BEAR_WALK, 6, this.settings.animationFps);
        this.patrolPlatform();
    }

    updateDeath(){
        this.applyGravity();
        this.deadTicks++;
        this.setSprite(IMAGE_BEAR_DEATH, 6, 0);
        this.currentFrame = this.getProgressFrame(this.deadTicks, this.settings.deathTicks, 6);
        if(this.deadTicks >= this.settings.deathTicks){
            this.stopAnimation();
            this.world.level.removeEnemy(this);
        }
    }

    patrolPlatform(){
        if(!this.onGround){
            return;
        }
        if(this.shouldTurn()){
            this.otherDirection = !this.otherDirection;
        }
        this.moveForward();
    }

    shouldTurn(){
        const STEP_DIRECTION = this.otherDirection ? -1 : 1;
        const PROBE_X = this.x + this.width / 2 + STEP_DIRECTION * this.width / 2;
        const PROBE_Y = this.y + this.height + 1;
        const IS_OUT_OF_BOUNDS = PROBE_X < 0 || PROBE_X > this.world.level.width;
        return IS_OUT_OF_BOUNDS || !this.world.level.isWalkableAt(PROBE_X, PROBE_Y);
    }
}

const ENEMY_MARKERS = { 70: Enemy };
