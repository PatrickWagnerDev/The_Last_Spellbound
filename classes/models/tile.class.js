const TILE_SIZE = 48;
const TILE_COLUMNS = 7;
const EMPTY_TILE_ID = 10;
const FIRST_MARKER_ID = 70;
const WALKABLE_TILE_IDS = [11, 12, 13, 14, 31, 32, 33, 34, 35, 43, 44, 46, 47, 48];
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
        const SHEET_INDEX = tileId - EMPTY_TILE_ID - 1;
        this.currentFrame = SHEET_INDEX % TILE_COLUMNS;
        this.frameRow = Math.floor(SHEET_INDEX / TILE_COLUMNS);
    }
}
