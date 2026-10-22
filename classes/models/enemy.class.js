class Enemy extends MovableObject {
    deadTicks = 0;

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
    }

    applyStats(){
        this.speed = this.settings.speed;
        this.animationFps = this.settings.animationFps;
        this.maxHealth = this.settings.maxHealth;
        this.health = this.maxHealth;
    }

    receiveHit(damage, source){
        this.takeDamage(damage);
        if(!this.isDead()){
            this.startKnockback(source);
            this.otherDirection = this.knockbackDirection > 0;
        }
    }

    showLoopState(stateName, fps){
        const SPRITE = this.sprites[stateName];
        this.setSprite(SPRITE.path, SPRITE.frames, fps);
    }

    showProgressState(stateName, elapsedTicks, totalTicks){
        const SPRITE = this.sprites[stateName];
        this.setProgressSprite(SPRITE.path, SPRITE.frames, elapsedTicks, totalTicks);
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

    updateDeath(){
        this.applyGravity();
        this.deadTicks++;
        this.showProgressState('death', this.deadTicks, this.settings.deathTicks);
        if(this.deadTicks >= this.settings.deathTicks){
            this.stopAnimation();
            this.world.level.removeEnemy(this);
        }
    }
}
