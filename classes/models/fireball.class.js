const IMAGE_FIREBALL = './assets/image/01-wizard/Fire Wizard/Charge.png';
const FIREBALL_SPAWN = { offsetX: 16, offsetY: 28 };

class Fireball extends MovableObject {
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
        super().loadImage(IMAGE_FIREBALL);
        this.otherDirection = owner.isFlipped();
        this.x = owner.x + (this.otherDirection ? owner.width - FIREBALL_SPAWN.offsetX - this.width : FIREBALL_SPAWN.offsetX);
        this.y = owner.y + FIREBALL_SPAWN.offsetY;
        this.startAnimation();
    }

    updateObject(){
        this.stateTicks++;
        if(this.state == 'flying'){
            this.fly();
        } else if(this.state == 'impact'){
            this.updateImpact();
        } else {
            this.updateVanish();
        }
    }

    fly(){
        this.moveForward();
        this.distance += this.speed;
        this.currentFrame = Math.floor(this.stateTicks / (60 / this.settings.flightFps)) % 5;
        this.checkImpact();
    }

    checkImpact(){
        const TARGET = this.world.level.getCollidables().find(enemy => this.isColliding(enemy));
        if(TARGET){
            TARGET.receiveHit(this.settings.damage, this);
            this.startState('impact');
        } else if(this.distance >= this.settings.range || this.isOutOfLevel()){
            this.startState('vanish');
        }
    }

    startState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    updateImpact(){
        const FRAME_INDEX = Math.floor(this.stateTicks / (60 / this.settings.impactFps));
        if(FRAME_INDEX > 6){
            this.removeSelf();
            return;
        }
        this.currentFrame = 5 + FRAME_INDEX;
    }

    updateVanish(){
        this.currentFrame = 4;
        if(this.stateTicks >= 60 / this.settings.flightFps){
            this.removeSelf();
        }
    }

    removeSelf(){
        this.stopAnimation();
        this.world.removeProjectile(this);
    }

    isOutOfLevel(){
        return this.x < -this.width || this.x > this.world.level.width;
    }
}
