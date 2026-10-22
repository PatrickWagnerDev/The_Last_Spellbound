const IMAGES_PORTAL = [
    './assets/image/08-magic-effects/PNG/Spiral/Spiral1.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral2.png',
    './assets/image/08-magic-effects/PNG/Spiral/Spiral3.png'
];

class Portal extends MovableObject {
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

    isCollectable(character){
        return false;
    }

    isAppeared(){
        return this.appearTicks >= this.settings.appearTicks;
    }

    updateSize(){
        const SIZE = this.settings.size * Math.min(this.appearTicks / this.settings.appearTicks, 1);
        this.width = SIZE;
        this.height = SIZE;
        this.x = this.centerX - SIZE / 2;
        this.y = this.centerY - SIZE / 2;
        this.hitbox = { offsetX: SIZE * 0.2, offsetY: SIZE * 0.2, width: SIZE * 0.6, height: SIZE * 0.6 };
    }

    updateObject(){
        this.appearTicks++;
        this.updateSize();
        const FRAME_INDEX = Math.floor(this.appearTicks / getTicksPerFrame(this.settings.animationFps)) % 3;
        this.setSprite(IMAGES_PORTAL[FRAME_INDEX], 1, 0);
        this.checkEntering();
    }

    checkEntering(){
        const CHARACTER = this.world.character;
        if(this.isAppeared() && !this.isUsed && !CHARACTER.isDead() && this.isColliding(CHARACTER)){
            this.isUsed = true;
            this.world.startTransition(this, LEVEL_ONE_BOSS);
        }
    }
}
