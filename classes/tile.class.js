const TILE_SIZE = 48;
const TILE_COLUMNS = 7;
const TILESET_IMAGE = './assets/image/craftpix-891177-platformer-pixel-art-tileset/Tiles/TileSet.png';

class Tile extends MovableObject {
    width = TILE_SIZE;
    height = TILE_SIZE;
    frameWidth = 32;
    frameHeight = 32;
    frameCount = 1;

    constructor(tileId, column, row, tilesetImage){
        super();
        this.img = tilesetImage;
        this.x = column * TILE_SIZE;
        this.y = row * TILE_SIZE;
        this.currentFrame = (tileId - 1) % TILE_COLUMNS;
        this.frameRow = Math.floor((tileId - 1) / TILE_COLUMNS);
    }
}
