class MovableObject extends DrawableObject{
    speed = 5;
    speedY = 0;
    onGround = false;
    world;
    hitbox = { offsetX: 0, offsetY: 0, width: 100, height: 100 };
    maxHealth = 1;
    health = 1;

    startAnimation(){
        this.animationInterval = setInterval(() => {
            this.updateObject();
            this.nextFrame();
        }, 1000 / 60);
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
        const FEET_X = this.x + this.width / 2;
        const FEET_Y = this.y + this.height;
        const TILE_TOP = Math.floor(FEET_Y / TILE_SIZE) * TILE_SIZE;
        if(!this.world.level.isWalkableAt(FEET_X, FEET_Y) || previousFeet > TILE_TOP){
            return false;
        }
        this.y = TILE_TOP - this.height;
        this.speedY = 0;
        return true;
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
        const OWN_RECT = this.getHitbox();
        return OWN_RECT.x < rect.x + rect.width
            && OWN_RECT.x + OWN_RECT.width > rect.x
            && OWN_RECT.y < rect.y + rect.height
            && OWN_RECT.y + OWN_RECT.height > rect.y;
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

    isDead(){
        return this.health <= 0;
    }
}
