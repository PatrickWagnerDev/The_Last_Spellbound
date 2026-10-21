class MovableObject extends DrawableObject{
    speed = 5;
    speedY = 0;
    onGround = false;
    world;
    hitbox = { offsetX: 0, offsetY: 0, width: 100, height: 100 };

    startAnimation(){
        setInterval(() => {
            this.updateObject();
            this.nextFrame();
        }, 1000 / 60);
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

    getHitbox(){
        const OFFSET_X = this.isFlipped()
            ? this.width - this.hitbox.offsetX - this.hitbox.width
            : this.hitbox.offsetX;
        return {
            x: this.x + OFFSET_X,
            y: this.y + this.hitbox.offsetY,
            width: this.hitbox.width,
            height: this.hitbox.height
        };
    }

    isColliding(movable){
        const OWN_RECT = this.getHitbox();
        const OTHER_RECT = movable.getHitbox();
        return OWN_RECT.x < OTHER_RECT.x + OTHER_RECT.width
            && OWN_RECT.x + OWN_RECT.width > OTHER_RECT.x
            && OWN_RECT.y < OTHER_RECT.y + OTHER_RECT.height
            && OWN_RECT.y + OWN_RECT.height > OTHER_RECT.y;
    }

    drawHitbox(ctx, color){
        const HITBOX_RECT = this.getHitbox();
        ctx.strokeStyle = color;
        ctx.strokeRect(Math.round(HITBOX_RECT.x) + 0.5, Math.round(HITBOX_RECT.y) + 0.5, HITBOX_RECT.width, HITBOX_RECT.height);
    }
}
