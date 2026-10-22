const IMAGES_PORTAL = [
    './assets/image/08-magic-effects/PNG/Spiral/Spiral1.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral2.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral3.png'
];

class Portal extends LevelItem {
    settings = GAME_SETTINGS.portal;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 1;
    appearTicks = 0;
    isUsed = false;

    constructor(column, row){
        super();
        this.setupSprites(IMAGES_PORTAL);
        this.centerX = column * TILE_SIZE + TILE_SIZE / 2;
        this.centerY = (row + 1) * TILE_SIZE - this.settings.size / 2;
        this.updateSize();
        this.startAnimation();
    }

    isAppeared(){
        return this.appearTicks >= this.settings.appearTicks;
    }

    updateSize(){
        const PORTAL_SIZE = this.settings.size * Math.min(this.appearTicks / this.settings.appearTicks, 1);
        this.width = PORTAL_SIZE;
        this.height = PORTAL_SIZE;
        this.x = this.centerX - PORTAL_SIZE / 2;
        this.y = this.centerY - PORTAL_SIZE / 2;
        this.hitbox = { offsetX: PORTAL_SIZE * 0.2, offsetY: PORTAL_SIZE * 0.2, width: PORTAL_SIZE * 0.6, height: PORTAL_SIZE * 0.6 };
    }

    updateObject(){
        this.appearTicks++;
        this.updateSize();
        const FRAME_INDEX = Math.floor(this.appearTicks / getTicksPerFrame(this.settings.animationFps)) % 3;
        this.setSprite(IMAGES_PORTAL[FRAME_INDEX], 1, 0);
        this.checkEntering();
    }

    checkEntering(){
        const PLAYER_CHARACTER = this.world.character;
        if(this.isAppeared() && !this.isUsed && !PLAYER_CHARACTER.isDead() && this.isColliding(PLAYER_CHARACTER)){
            this.isUsed = true;
            this.world.startTransition(this);
        }
    }
}
