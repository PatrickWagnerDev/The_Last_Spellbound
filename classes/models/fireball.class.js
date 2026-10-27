const FIREBALL_SPAWN = { offsetX: 16, offsetY: 28 };

/**
 * The fireball of the character. It flies in the direction the character looks until it hits an enemy,
 * reaches its range or leaves the level, then it plays an impact animation or vanishes. A hit does damage.
 */
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

    /**
     * Creates the fireball at the hand of the character, in the direction it looks, and starts its game loop.
     * @param {Character} owner - The character that casts the fireball.
     */
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

    /**
     * Runs one tick of the fireball: flying, the impact animation or vanishing, depending on its state.
     * @returns {void}
     */
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

    /**
     * Runs a tick of the flight: moves forward, adds to the distance flown, shows the flight picture and
     * checks for a hit.
     * @returns {void}
     */
    flyForward(){
        this.moveForward();
        this.distance += this.speed;
        this.currentFrame = Math.floor(this.stateTicks / getTicksPerFrame(this.settings.flightFps)) % this.flightFrames;
        this.checkImpact();
    }

    /**
     * Checks whether the fireball hits: it damages the enemy it touches and starts the impact, or it vanishes
     * when its range is used up or it leaves the level.
     * @returns {void}
     */
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

    /**
     * Draws the current frame shifted by the visual offset of the figure.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {number} drawX - Horizontal position to draw at, this.x or 0 when the context is mirrored.
     * @returns {void}
     */
    drawFrame(ctx, drawX){
        super.drawFrame(ctx, drawX + this.visualOffsetX);
    }

    /**
     * Switches to a state and restarts the time counter of the state.
     * @param {string} stateName - 'flying', 'impact' or 'vanish'.
     * @returns {void}
     */
    startState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    /**
     * Runs a tick of the impact: plays the impact pictures once and removes the fireball afterwards.
     * @returns {void}
     */
    updateImpact(){
        if(this.stateTicks >= this.settings.impactTicks){
            this.removeSelf();
            return;
        }
        const IMPACT_FRAMES = this.frameCount - this.flightFrames;
        this.currentFrame = this.flightFrames + getProgressFrame(this.stateTicks, this.settings.impactTicks, IMPACT_FRAMES);
    }

    /**
     * Runs a tick of vanishing: shows the last flight picture and removes the fireball after a moment.
     * @returns {void}
     */
    updateVanish(){
        this.currentFrame = this.flightFrames - 1;
        if(this.stateTicks >= getTicksPerFrame(this.settings.flightFps)){
            this.removeSelf();
        }
    }
}
