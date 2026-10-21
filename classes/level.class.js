class Level {
    mapRows;
    tiles = [];
    tilesetImage;
    width;
    height;

    constructor(mapRows){
        this.mapRows = mapRows;
        this.width = mapRows[0].length * TILE_SIZE;
        this.height = mapRows.length * TILE_SIZE;
        this.tilesetImage = new Image();
        this.tilesetImage.src = TILESET_IMAGE;
        this.buildTiles();
    }

    buildTiles(){
        this.mapRows.forEach((rowIds, row) => {
            rowIds.forEach((tileId, column) => {
                if(tileId > 0){
                    this.tiles.push(new Tile(tileId, column, row, this.tilesetImage));
                }
            });
        });
    }

    getTileIdAt(x, y){
        const TILE_COLUMN = Math.floor(x / TILE_SIZE);
        const TILE_ROW = Math.floor(y / TILE_SIZE);
        return this.mapRows[TILE_ROW]?.[TILE_COLUMN] ?? 0;
    }

    isWalkableAt(x, y){
        return WALKABLE_TILE_IDS.includes(this.getTileIdAt(x, y));
    }
}
