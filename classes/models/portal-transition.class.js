const SPIRAL_RADIUS_RATIO = 0.4;

class PortalTransition extends MovableObject {
    settings = GAME_SETTINGS.transition;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    phase = 'expand';
    phaseTicks = 0;
    totalTicks = 0;
    progress = 0;

    constructor(world, centerX, centerY, startSize, levelData){
        super();
        this.world = world;
        this.levelData = levelData;
        this.centerX = centerX;
        this.centerY = centerY;
        this.startSize = startSize;
        this.coverSize = this.getCoverSize();
        this.setupSprites(IMAGES_PORTAL);
        this.startAnimation();
        soundManager.playSound('portalEnter');
    }

    isFrozen(){
        return false;
    }

    getCoverSize(){
        const FAR_X = Math.max(this.centerX, this.world.canvas.width - this.centerX);
        const FAR_Y = Math.max(this.centerY, this.world.canvas.height - this.centerY);
        return Math.hypot(FAR_X, FAR_Y) / SPIRAL_RADIUS_RATIO * 1.1;
    }

    getSize(){
        if(this.phase === 'expand'){
            return this.startSize + (this.coverSize - this.startSize) * this.progress;
        }
        return this.coverSize * this.progress;
    }

    updateObject(){
        this.totalTicks++;
        this.phaseTicks++;
        if(this.phase === 'expand'){
            this.updateExpand();
        } else {
            this.updateContract();
        }
        const FRAME_INDEX = Math.floor(this.totalTicks / getTicksPerFrame(this.settings.spinFps)) % 3;
        this.setSprite(IMAGES_PORTAL[FRAME_INDEX], 1, 0);
    }

    updateExpand(){
        this.progress = Math.min(this.phaseTicks / this.settings.expandTicks, 1);
        if(this.progress >= 1){
            this.switchLevel();
        }
    }

    updateContract(){
        this.progress = Math.max(1 - this.phaseTicks / this.settings.contractTicks, 0);
        if(this.progress <= 0){
            this.world.endTransition();
        }
    }

    switchLevel(){
        this.world.loadLevel(this.levelData);
        const CHARACTER_RECT = this.world.character.getHitbox();
        this.centerX = getRectCenterX(CHARACTER_RECT) - this.world.cameraX;
        this.centerY = CHARACTER_RECT.y + CHARACTER_RECT.height / 2;
        this.coverSize = this.getCoverSize();
        this.phase = 'contract';
        this.phaseTicks = 0;
        soundManager.playSound('portalExit');
    }

    drawObject(ctx){
        const TRANSITION_SIZE = this.getSize();
        ctx.fillStyle = 'rgb(40, 15, 40)';
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, SPIRAL_RADIUS_RATIO * TRANSITION_SIZE * this.progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(this.img, 0, 0, 128, 128, this.centerX - TRANSITION_SIZE / 2, this.centerY - TRANSITION_SIZE / 2, TRANSITION_SIZE, TRANSITION_SIZE);
    }
}
