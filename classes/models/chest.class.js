const IMAGE_CHEST = './assets/image/06-tileset/Objects_Animated/Golden_Chest_Open.png';

class Chest extends LevelItem {
    settings = GAME_SETTINGS.chest;
    width = 32 * this.settings.scale;
    height = 32 * this.settings.scale;
    frameWidth = 32;
    frameHeight = 32;
    frameCount = 8;
    animationFps = 0;
    hitbox = { offsetX: 0, offsetY: 15 * this.settings.scale, width: 26 * this.settings.scale, height: 17 * this.settings.scale };
    isOpen = false;
    openTicks = 0;
    hasSpawnedPortal = false;

    constructor(column, row){
        super();
        this.column = column;
        this.row = row;
        this.setupSprites([IMAGE_CHEST]);
        this.x = column * TILE_SIZE + (TILE_SIZE - 26 * this.settings.scale) / 2;
        this.y = (row + 1) * TILE_SIZE - this.height;
        this.startAnimation();
    }

    isNearCharacter(character){
        const CHEST_RECT = this.getHitbox();
        const NEAR_RECT = {
            x: CHEST_RECT.x - this.settings.openDistance,
            y: CHEST_RECT.y,
            width: CHEST_RECT.width + 2 * this.settings.openDistance,
            height: CHEST_RECT.height
        };
        return areRectsOverlapping(character.getHitbox(), NEAR_RECT);
    }

    updateObject(){
        if(this.isOpen){
            this.updateOpening();
        } else {
            this.checkOpen();
        }
    }

    checkOpen(){
        const PLAYER_CHARACTER = this.world.character;
        if(PLAYER_CHARACTER.keyCount > 0 && !PLAYER_CHARACTER.isDead() && this.isNearCharacter(PLAYER_CHARACTER)){
            PLAYER_CHARACTER.keyCount--;
            this.isOpen = true;
        }
    }

    updateOpening(){
        this.openTicks++;
        const TOTAL_TICKS = getTicksPerFrame(this.settings.openFps) * 8;
        this.currentFrame = getProgressFrame(this.openTicks, TOTAL_TICKS, 8);
        if(this.openTicks >= TOTAL_TICKS && !this.hasSpawnedPortal){
            this.hasSpawnedPortal = true;
            this.world.addItem(new Portal(this.column + this.settings.portalOffset, this.row));
        }
    }
}
