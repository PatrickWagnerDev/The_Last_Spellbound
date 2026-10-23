class MovableObject extends DrawableObject{
    speed = 5;
    speedY = 0;
    onGround = false;
    world;
    hitbox = { offsetX: 0, offsetY: 0, width: 100, height: 100 };
    maxHealth = 1;
    health = 1;
    hurtTicksLeft = 0;
    knockbackDirection = 1;
    deadTicks = 0;

    startAnimation(){
        this.animationInterval = setInterval(() => {
            if(this.isFrozen()){
                return;
            }
            this.updateObject();
            this.nextFrame();
        }, 1000 / TICKS_PER_SECOND);
    }

    isFrozen(){
        return this.world?.isPaused ?? false;
    }

    setupSprites(paths){
        this.loadImage(paths[0]);
        this.loadImages(paths);
        this.currentPath = paths[0];
    }

    showLoopState(stateName, fps){
        const SPRITE_DATA = this.sprites[stateName];
        this.applyStateHitbox(stateName);
        this.setSprite(SPRITE_DATA.path, SPRITE_DATA.frames, fps);
    }

    showFrameState(stateName, frameIndex){
        this.showLoopState(stateName, 0);
        this.currentFrame = frameIndex;
    }

    showProgressState(stateName, elapsedTicks, totalTicks){
        const SPRITE_DATA = this.sprites[stateName];
        this.applyStateHitbox(stateName);
        this.setProgressSprite(SPRITE_DATA.path, SPRITE_DATA.frames, elapsedTicks, totalTicks);
    }

    applyStateHitbox(stateName){
    }

    stopAnimation(){
        clearInterval(this.animationInterval);
    }

    updateObject(){
    }

    moveRight(){
        this.x += this.speed;
    }

    moveLeft(){
        this.x -= this.speed;
    }

    moveForward(){
        if(this.otherDirection){
            this.moveLeft();
        } else {
            this.moveRight();
        }
    }

    applyGravity(){
        const PREVIOUS_FEET = this.y + this.height;
        this.y -= this.speedY;
        this.onGround = this.speedY <= 0 && this.landOnTile(PREVIOUS_FEET);
        if(!this.onGround){
            this.speedY -= GAME_SETTINGS.physics.gravityForce;
        }
    }

    landOnTile(previousFeet){
        const FEET_Y = this.y + this.height;
        const TILE_TOP = Math.floor(FEET_Y / TILE_SIZE) * TILE_SIZE;
        if(!this.hasSupportAt(FEET_Y) || previousFeet > TILE_TOP){
            return false;
        }
        this.y = TILE_TOP - this.height;
        this.speedY = 0;
        return true;
    }

    hasSupportAt(feetY){
        return this.getSupportXs().some(feetX => this.world.level.isWalkableAt(feetX, feetY));
    }

    getSupportXs(){
        return [this.x + this.width / 2];
    }

    getBoxRect(box){
        const OFFSET_X = this.isFlipped()
            ? this.width - box.offsetX - box.width
            : box.offsetX;
        return {
            x: this.x + OFFSET_X,
            y: this.y + box.offsetY,
            width: box.width,
            height: box.height
        };
    }

    getHitbox(){
        return this.getBoxRect(this.hitbox);
    }

    isOverlapping(rect){
        return areRectsOverlapping(this.getHitbox(), rect);
    }

    isColliding(movable){
        return this.isOverlapping(movable.getHitbox());
    }

    drawRect(ctx, rect, color){
        ctx.strokeStyle = color;
        ctx.strokeRect(Math.round(rect.x) + 0.5, Math.round(rect.y) + 0.5, rect.width, rect.height);
    }

    drawHitbox(ctx, color){
        this.drawRect(ctx, this.getHitbox(), color);
    }

    takeDamage(amount){
        this.health = Math.max(this.health - amount, 0);
    }

    restoreHealth(amount){
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    isDead(){
        return this.health <= 0;
    }

    getDeathTicks(){
        return 0;
    }

    advanceDeath(stateName){
        this.deadTicks++;
        this.showProgressState(stateName, this.deadTicks, this.getDeathTicks());
    }

    hasDeathFinished(){
        return this.isDead() && this.deadTicks >= this.getDeathTicks();
    }

    isHurt(){
        return this.hurtTicksLeft > 0;
    }

    updateHurt(){
        if(!this.isHurt()){
            return;
        }
        this.x += this.getKnockbackStep();
        this.hurtTicksLeft = tickDown(this.hurtTicksLeft);
    }

    getKnockbackStep(){
        return this.knockbackDirection * this.settings.knockbackSpeed * this.hurtTicksLeft / this.settings.hurtTicks;
    }

    startKnockback(source){
        const IS_SOURCE_RIGHT = getRectCenterX(source.getHitbox()) > getRectCenterX(this.getHitbox());
        this.knockbackDirection = IS_SOURCE_RIGHT ? -1 : 1;
        this.hurtTicksLeft = this.settings.hurtTicks;
    }

    getHurtElapsed(){
        return this.settings.hurtTicks - this.hurtTicksLeft;
    }
}
