const TILE_SIZE = 48;
const TILE_COLUMNS = 7;
const WALKABLE_TILE_IDS = [1, 2, 3, 4, 21, 22, 23, 24, 25, 33, 34, 36, 37, 38];
const TILESET_IMAGE = './assets/image/06-tileset/Tiles/TileSet.png';

class Tile extends DrawableObject {
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
