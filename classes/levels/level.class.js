/**
 * The built world of one level part. It splits the number map of the level data into tiles, enemies, items,
 * the start position of the character and background layers, and it answers questions about the map, for
 * example whether there is ground at a position.
 */
class Level {
    mapRows;
    tiles = [];
    enemies = [];
    items = [];
    backgroundObjects = [];
    playerStart = { column: 0, row: 0 };
    tilesetImage;
    width;
    height;

    /**
     * Builds the level from the level data: tiles, enemies, items, start position and backgrounds.
     * @param {{mapRows: number[][], backgroundLayers: {path: string, factor: number}[]}} levelData - Map and
     * background layers of the level part.
     */
    constructor(levelData){
        this.mapRows = levelData.mapRows;
        this.width = this.mapRows[0].length * TILE_SIZE;
        this.height = this.mapRows.length * TILE_SIZE;
        this.tilesetImage = createImage(TILESET_IMAGE);
        this.buildTiles();
        this.buildEnemies();
        this.buildItems();
        this.buildPlayerStart();
        this.buildBackgrounds(levelData.backgroundLayers);
    }

    /**
     * Creates the items (key, pizza, donut, chest) for the item numbers in the map.
     * @returns {void}
     */
    buildItems(){
        this.forEachCell((markerId, column, row) => {
            if(ITEM_MARKERS[markerId]){
                this.items.push(new ITEM_MARKERS[markerId](column, row));
            }
        });
    }

    /**
     * Stops the timers of all enemies and items.
     * @returns {void}
     */
    stopAll(){
        this.enemies.forEach(enemy => enemy.stopAnimation());
        this.items.forEach(item => item.stopAnimation());
    }

    /**
     * Removes an item from the level, for example after it was collected.
     * @param {LevelItem} item - The item to remove.
     * @returns {void}
     */
    removeItem(item){
        this.items = this.items.filter(other => other !== item);
    }

    /**
     * Finds the start position of the character in the map (the number 69) and stores it.
     * @returns {void}
     */
    buildPlayerStart(){
        this.forEachCell((cellId, column, row) => {
            if(cellId === PLAYER_START_ID){
                this.playerStart = { column, row };
            }
        });
    }

    /**
     * Visits every cell of the map, row by row.
     * @param {function(number, number, number): void} callback - Called with the number in the cell, its column
     * and its row.
     * @returns {void}
     */
    forEachCell(callback){
        this.mapRows.forEach((rowIds, row) => {
            rowIds.forEach((cellId, column) => callback(cellId, column, row));
        });
    }

    /**
     * Creates a tile for every cell of the map that holds a tile number (11 to 59).
     * @returns {void}
     */
    buildTiles(){
        this.forEachCell((tileId, column, row) => {
            if(tileId > EMPTY_TILE_ID && tileId < FIRST_MARKER_ID){
                this.tiles.push(new Tile(tileId, column, row, this.tilesetImage));
            }
        });
    }

    /**
     * Creates the enemies and bosses for the enemy numbers in the map.
     * @returns {void}
     */
    buildEnemies(){
        this.forEachCell((markerId, column, row) => {
            if(ENEMY_MARKERS[markerId]){
                this.enemies.push(new ENEMY_MARKERS[markerId](column, row));
            }
        });
    }

    /**
     * Creates the background layers. Every layer gets two pictures side by side so that no gap shows up
     * while it moves with its own speed factor.
     * @param {{path: string, factor: number}[]} backgroundLayers - Picture and parallax factor of each layer.
     * @returns {void}
     */
    buildBackgrounds(backgroundLayers){
        backgroundLayers.forEach(layer => {
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, 0));
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, BACKGROUND_WIDTH));
        });
    }

    /**
     * Returns the enemies that are still alive, only they can touch the character or be hit.
     * @returns {Enemy[]} The living enemies.
     */
    getCollidables(){
        return this.enemies.filter(enemy => !enemy.isDead());
    }

    /**
     * Removes an enemy from the level, for example after its death animation has finished.
     * @param {Enemy} enemy - The enemy to remove.
     * @returns {void}
     */
    removeEnemy(enemy){
        this.enemies = this.enemies.filter(other => other !== enemy);
    }

    /**
     * Returns the number in the map at a position given in pixels.
     * @param {number} x - Horizontal position in pixels.
     * @param {number} y - Vertical position in pixels.
     * @returns {number} The number of the cell, or the number for empty if the position is outside the map.
     */
    getTileIdAt(x, y){
        const TILE_COLUMN = Math.floor(x / TILE_SIZE);
        const TILE_ROW = Math.floor(y / TILE_SIZE);
        return this.mapRows[TILE_ROW]?.[TILE_COLUMN] ?? EMPTY_TILE_ID;
    }

    /**
     * Tells whether a walkable tile lies at a position, which means ground or a platform.
     * @param {number} x - Horizontal position in pixels.
     * @param {number} y - Vertical position in pixels.
     * @returns {boolean} True if the position is inside a walkable tile.
     */
    isWalkableAt(x, y){
        return WALKABLE_TILE_IDS.includes(this.getTileIdAt(x, y));
    }
}
