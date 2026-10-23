class Enemy extends MovableObject {
    isBoss = false;

    constructor(column, row, config){
        super();
        this.applyConfig(config);
        this.applyStats();
        this.frameCount = Object.values(this.sprites)[0].frames;
        this.setupSprites(Object.values(this.sprites).map(sprite => sprite.path));
        this.x = column * TILE_SIZE;
        this.y = (row + 1) * TILE_SIZE - this.height;
    }

    applyConfig(config){
        this.settings = config.settings;
        this.sprites = config.sprites;
        this.width = this.settings.width;
        this.height = this.settings.height;
        this.frameWidth = config.frameSize;
        this.frameHeight = config.frameSize;
        this.hitbox = config.hitbox;
        this.spriteFacesLeft = config.spriteFacesLeft;
        this.deathSound = config.deathSound;
    }

    applyStats(){
        this.speed = this.settings.speed;
        this.animationFps = this.settings.animationFps;
        this.maxHealth = this.settings.maxHealth;
        this.health = this.maxHealth;
    }

    receiveHit(damage, source){
        this.takeDamage(damage);
        if(this.isDead()){
            soundManager.playSound(this.deathSound);
            return;
        }
        soundManager.playSound('enemyHit');
        this.startKnockback(source);
        this.otherDirection = this.knockbackDirection > 0;
    }

    updateObject(){
        if(this.isDead()){
            this.updateDeath();
            return;
        }
        this.updateHurt();
        this.applyGravity();
        if(this.isHurt()){
            this.showProgressState('hurt', this.getHurtElapsed(), this.settings.hurtTicks);
            return;
        }
        this.updateBehavior();
    }

    updateBehavior(){
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

    drawDebugArea(ctx){
    }

    updateDeath(){
        this.applyGravity();
        this.advanceDeath('death');
        if(this.hasDeathFinished()){
            this.finishDeath();
        }
    }

    getDeathTicks(){
        return this.settings.deathTicks;
    }

    finishDeath(){
        this.stopAnimation();
        this.world.level.removeEnemy(this);
    }
}
