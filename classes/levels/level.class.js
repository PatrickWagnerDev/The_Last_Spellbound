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

    buildItems(){
        this.forEachCell((markerId, column, row) => {
            if(ITEM_MARKERS[markerId]){
                this.items.push(new ITEM_MARKERS[markerId](column, row));
            }
        });
    }

    stopAll(){
        this.enemies.forEach(enemy => enemy.stopAnimation());
        this.items.forEach(item => item.stopAnimation());
    }

    removeItem(item){
        this.items = this.items.filter(other => other !== item);
    }

    buildPlayerStart(){
        this.forEachCell((cellId, column, row) => {
            if(cellId === PLAYER_START_ID){
                this.playerStart = { column, row };
            }
        });
    }

    forEachCell(callback){
        this.mapRows.forEach((rowIds, row) => {
            rowIds.forEach((cellId, column) => callback(cellId, column, row));
        });
    }

    buildTiles(){
        this.forEachCell((tileId, column, row) => {
            if(tileId > EMPTY_TILE_ID && tileId < FIRST_MARKER_ID){
                this.tiles.push(new Tile(tileId, column, row, this.tilesetImage));
            }
        });
    }

    buildEnemies(){
        this.forEachCell((markerId, column, row) => {
            if(ENEMY_MARKERS[markerId]){
                this.enemies.push(new ENEMY_MARKERS[markerId](column, row));
            }
        });
    }

    buildBackgrounds(backgroundLayers){
        backgroundLayers.forEach(layer => {
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, 0));
            this.backgroundObjects.push(new BackgroundObject(layer.path, layer.factor, BACKGROUND_WIDTH));
        });
    }

    getCollidables(){
        return this.enemies.filter(enemy => !enemy.isDead());
    }

    removeEnemy(enemy){
        this.enemies = this.enemies.filter(other => other !== enemy);
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
