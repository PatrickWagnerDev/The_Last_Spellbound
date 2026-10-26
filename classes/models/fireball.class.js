const FIREBALL_SPAWN = { offsetX: 16, offsetY: 28 };

class Fireball extends Projectile {
    settings = GAME_SETTINGS.fireball;
    width = 128;
    height = 128;
    frameWidth = 64;
    frameHeight = 64;
    frameCount = 12;
    animationFps = 0;
    hitbox = { offsetX: 76, offsetY: 46, width: 40, height: 40 };
    speed = this.settings.speed;
    state = 'flying';
    stateTicks = 0;
    distance = 0;

    constructor(owner){
        super().loadImage(owner.sprites.projectile.path);
        this.frameCount = owner.sprites.projectile.frames;
        this.flightFrames = owner.traits.flightFrames;
        this.visualOffsetX = owner.traits.projectileOffsetX;
        this.otherDirection = owner.isFlipped();
        this.x = owner.x + (this.otherDirection ? owner.width - FIREBALL_SPAWN.offsetX - this.width : FIREBALL_SPAWN.offsetX);
        this.y = owner.y + FIREBALL_SPAWN.offsetY;
        this.startAnimation();
    }

    updateObject(){
        this.stateTicks++;
        if(this.state === 'flying'){
            this.flyForward();
        } else if(this.state === 'impact'){
            this.updateImpact();
        } else {
            this.updateVanish();
        }
    }

    flyForward(){
        this.moveForward();
        this.distance += this.speed;
        this.currentFrame = Math.floor(this.stateTicks / getTicksPerFrame(this.settings.flightFps)) % this.flightFrames;
        this.checkImpact();
    }

    checkImpact(){
        const HIT_TARGET = this.world.level.getCollidables().find(enemy => this.isColliding(enemy));
        if(HIT_TARGET){
            HIT_TARGET.receiveHit(this.settings.damage, this);
            this.startState('impact');
            soundManager.playSound('castImpact');
        } else if(this.distance >= this.settings.range || this.isOutOfLevel()){
            this.startState('vanish');
        }
    }

    drawFrame(ctx, drawX){
        super.drawFrame(ctx, drawX + this.visualOffsetX);
    }

    startState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    updateImpact(){
        if(this.stateTicks >= this.settings.impactTicks){
            this.removeSelf();
            return;
        }
        const IMPACT_FRAMES = this.frameCount - this.flightFrames;
        this.currentFrame = this.flightFrames + getProgressFrame(this.stateTicks, this.settings.impactTicks, IMPACT_FRAMES);
    }

    updateVanish(){
        this.currentFrame = this.flightFrames - 1;
        if(this.stateTicks >= getTicksPerFrame(this.settings.flightFps)){
            this.removeSelf();
        }
    }
}
