class Level {
    mapRows;
    tiles = [];
    enemies = [];
    backgroundObjects = [];
    tilesetImage;
    width;
    height;

    constructor(levelData){
        this.mapRows = levelData.mapRows;
        this.width = this.mapRows[0].length * TILE_SIZE;
        this.height = this.mapRows.length * TILE_SIZE;
        this.tilesetImage = new Image();
        this.tilesetImage.src = TILESET_IMAGE;
        this.buildTiles();
        this.buildEnemies();
        this.buildBackgrounds(levelData.backgroundLayers);
    }

    buildTiles(){
        this.mapRows.forEach((rowIds, row) => {
            rowIds.forEach((tileId, column) => {
                if(tileId > EMPTY_TILE_ID && tileId < FIRST_MARKER_ID){
                    this.tiles.push(new Tile(tileId, column, row, this.tilesetImage));
                }
            });
        });
    }

    buildEnemies(){
        this.mapRows.forEach((rowIds, row) => {
            rowIds.forEach((markerId, column) => {
                if(ENEMY_MARKERS[markerId]){
                    this.enemies.push(new ENEMY_MARKERS[markerId](column, row));
                }
            });
        });
    }

    buildBackgrounds(backgroundLayers){
        backgroundLayers.forEach(layer => {
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, 0));
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, BACKGROUND_WIDTH));
        });
    }

    getCollidables(){
        return [...this.enemies];
    }

    getTileIdAt(x, y){
        const TILE_COLUMN = Math.floor(x / TILE_SIZE);
        const TILE_ROW = Math.floor(y / TILE_SIZE);
        return this.mapRows[TILE_ROW]?.[TILE_COLUMN] ?? EMPTY_TILE_ID;
    }

    isWalkableAt(x, y){
        return WALKABLE_TILE_IDS.includes(this.getTileIdAt(x, y));
    }
}
