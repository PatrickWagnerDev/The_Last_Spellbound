const TILE_SIZE = 48;
const TILE_COLUMNS = 7;
const EMPTY_TILE_ID = 10;
const XX = EMPTY_TILE_ID;
const FIRST_MARKER_ID = 60;
const PLAYER_START_ID = 69;
const WALKABLE_TILE_IDS = [11, 12, 13, 14, 31, 32, 33, 34, 35, 43, 44, 46, 47, 48];
const TILESET_IMAGE = './assets/image/06-tileset/Tiles/TileSet.png';

/**
 * One tile of the map, drawn from the tileset. A tile has no logic of its own: collisions with tiles are
 * checked with the numbers of the map, not with these objects.
 */
class Tile extends DrawableObject {
    width = TILE_SIZE;
    height = TILE_SIZE;
    frameWidth = 32;
    frameHeight = 32;
    frameCount = 1;

    /**
     * Creates a tile at a map position and picks its picture in the tileset from its number.
     * @param {number} tileId - Number of the tile in the map, the first tile of the tileset is 11.
     * @param {number} column - Map column of the tile.
     * @param {number} row - Map row of the tile.
     * @param {HTMLImageElement} tilesetImage - The shared tileset picture.
     */
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
