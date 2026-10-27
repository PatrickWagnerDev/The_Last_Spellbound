const JUMP_TEST_OFFSETS = [-4, 0, 4];
const MAX_AIR_TICKS = 150;

/**
 * The map of ways for the dark knight. It reads the level map into a network: the nodes are the cells where
 * one can stand in the lowest rows, the edges are the ways from one to another, which are walking, falling
 * and jumping. It finds the cheapest way to a goal and returns the next step. Jumps are simulated with the
 * physics of the game, so they work exactly like in the game.
 */
class PlatformNav {
    /**
     * Builds the map of ways for a level, which means all standing places and the ways between them.
     * @param {Level} level - The level with its map.
     * @param {object} settings - Settings of the boss, with the highest platform row it may use and its jump values.
     */
    constructor(level, settings){
        this.level = level;
        this.settings = settings;
        this.columns = level.mapRows[0].length;
        this.bottomRow = level.mapRows.length - 1;
        this.topRow = Math.max(this.bottomRow - settings.maxPlatformTiles, 0);
        this.edges = this.buildEdges();
        this.stepCache = new Map();
    }

    /**
     * Tells whether one can stand on a cell: it is inside the allowed area and its top is walkable.
     * @param {number} column - Map column of the cell.
     * @param {number} row - Map row of the cell.
     * @returns {boolean} True if the cell is a standing place.
     */
    isStandable(column, row){
        const IN_RANGE = column >= 0 && column < this.columns && row >= this.topRow && row <= this.bottomRow;
        return IN_RANGE && this.level.isWalkableAt(column * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
    }

    /**
     * Turns a column and a row into one number that identifies the standing place.
     * @param {number} column - Map column.
     * @param {number} row - Map row.
     * @returns {number} The key of the place.
     */
    getKey(column, row){
        return row * this.columns + column;
    }

    /**
     * Builds the whole network: for every standing place the list of ways that lead away from it.
     * @returns {Map<number, object[]>} The ways of each standing place, by its key.
     */
    buildEdges(){
        const EDGE_MAP = new Map();
        for(let row = this.topRow; row <= this.bottomRow; row++){
            for(let column = 0; column < this.columns; column++){
                if(this.isStandable(column, row)){
                    EDGE_MAP.set(this.getKey(column, row), this.createEdges(column, row));
                }
            }
        }
        return EDGE_MAP;
    }

    /**
     * Creates the ways that lead away from a standing place: in both directions a walk or fall way and a jump way.
     * @param {number} column - Map column of the place.
     * @param {number} row - Map row of the place.
     * @returns {object[]} The existing ways.
     */
    createEdges(column, row){
        const EDGES = [-1, 1].flatMap(direction => [this.createMoveEdge(column, row, direction), this.createJumpEdge(column, row, direction)]);
        return EDGES.filter(edge => edge);
    }

    /**
     * Creates the way to the next column: walking if the neighbor cell is a standing place, otherwise falling
     * down to a place below it, or no way at all.
     * @param {number} column - Map column of the place.
     * @param {number} row - Map row of the place.
     * @param {number} direction - -1 for left, 1 for right.
     * @returns {object|null} The way, or null if there is none.
     */
    createMoveEdge(column, row, direction){
        const NEXT_COLUMN = column + direction;
        if(this.isStandable(NEXT_COLUMN, row)){
            return { to: this.getKey(NEXT_COLUMN, row), kind: 'walk', direction, cost: 1 };
        }
        const FALL_ROW = this.findFallRow(NEXT_COLUMN, row);
        return FALL_ROW === null ? null : { to: this.getKey(NEXT_COLUMN, FALL_ROW), kind: 'fall', direction, cost: 2 };
    }

    /**
     * Looks for the first standing place below a row in a column, where a fall would end.
     * @param {number} column - Map column to look in.
     * @param {number} row - Row to start below.
     * @returns {number|null} The row of the landing place, or null if there is none.
     */
    findFallRow(column, row){
        for(let fallRow = row + 1; fallRow <= this.bottomRow; fallRow++){
            if(this.isStandable(column, fallRow)){
                return fallRow;
            }
        }
        return null;
    }

    /**
     * Creates the jump way in one direction. Three jumps are simulated, one from the middle of the cell and
     * two slightly to its sides. The way only counts if all three land on the same standing place, which is
     * not the starting place.
     * @param {number} column - Map column of the place.
     * @param {number} row - Map row of the place.
     * @param {number} direction - -1 for left, 1 for right.
     * @returns {object|null} The way, or null if the jump is not reliable.
     */
    createJumpEdge(column, row, direction){
        const TAKEOFF_X = column * TILE_SIZE + TILE_SIZE / 2;
        const LANDING_KEYS = JUMP_TEST_OFFSETS.map(offset => this.simulateJump(TAKEOFF_X + offset, row * TILE_SIZE, direction));
        const IS_STABLE = LANDING_KEYS[0] !== null && LANDING_KEYS.every(landingKey => landingKey === LANDING_KEYS[0]);
        if(!IS_STABLE || LANDING_KEYS[0] === this.getKey(column, row)){
            return null;
        }
        return { to: LANDING_KEYS[0], kind: 'jump', direction, takeoffX: TAKEOFF_X, cost: 3 };
    }

    /**
     * Plays a jump through tick by tick with the physics of the game.
     * @param {number} startX - Horizontal position of the take-off.
     * @param {number} startFeet - Vertical position of the feet at take-off.
     * @param {number} direction - -1 for left, 1 for right.
     * @returns {number|null} The key of the standing place where the jump ends, or null if it does not land.
     */
    simulateJump(startX, startFeet, direction){
        const JUMP_STATE = { posX: startX, feetY: startFeet, speedY: this.settings.jumpPower };
        for(let tick = 0; tick < MAX_AIR_TICKS && JUMP_STATE.feetY <= this.level.height; tick++){
            const LANDING_KEY = this.advanceJump(JUMP_STATE, direction);
            if(LANDING_KEY !== undefined){
                return LANDING_KEY;
            }
        }
        return null;
    }

    /**
     * Moves a simulated jump one tick further: moves the feet, checks for a landing and otherwise applies
     * gravity and the sideways speed.
     * @param {{posX: number, feetY: number, speedY: number}} jumpState - Position and speed of the jump, changed
     * by the call.
     * @param {number} direction - -1 for left, 1 for right.
     * @returns {number|null|undefined} The key of the landing place, null if the landing spot is not a
     * standing place, undefined if the jump has not landed yet.
     */
    advanceJump(jumpState, direction){
        const PREVIOUS_FEET = jumpState.feetY;
        jumpState.feetY -= jumpState.speedY;
        const LANDING_ROW = this.getLandingRow(jumpState.posX, PREVIOUS_FEET, jumpState.feetY, jumpState.speedY);
        if(LANDING_ROW !== null){
            return this.getLandingKey(jumpState.posX, LANDING_ROW);
        }
        jumpState.speedY -= GAME_SETTINGS.physics.gravityForce;
        jumpState.posX += direction * this.settings.jumpSpeed;
        return undefined;
    }

    /**
     * Returns the key of the standing place where a simulated jump lands.
     * @param {number} posX - Horizontal position of the landing.
     * @param {number} landingRow - Row of the landing.
     * @returns {number|null} The key of the place, or null if the landing cell is not a standing place.
     */
    getLandingKey(posX, landingRow){
        const LANDING_COLUMN = Math.floor(posX / TILE_SIZE);
        return this.isStandable(LANDING_COLUMN, landingRow) ? this.getKey(LANDING_COLUMN, landingRow) : null;
    }

    /**
     * Finds the row in which a simulated jump lands in this tick, with the same rules as in the game: it falls,
     * it was not already below the top of the tile and the cell is walkable.
     * @param {number} posX - Horizontal position of the jump.
     * @param {number} previousFeet - Y position of the feet before this tick.
     * @param {number} feet - Y position of the feet now.
     * @param {number} speedY - Vertical speed, positive while moving up.
     * @returns {number|null} The row it lands in, or null if it does not land.
     */
    getLandingRow(posX, previousFeet, feet, speedY){
        const TILE_ROW = Math.floor(feet / TILE_SIZE);
        const CAN_LAND = speedY <= 0 && previousFeet <= TILE_ROW * TILE_SIZE && this.level.isWalkableAt(posX, TILE_ROW * TILE_SIZE);
        return CAN_LAND ? TILE_ROW : null;
    }

    /**
     * Finds the standing place where a figure is standing now.
     * @param {number} centerX - Horizontal middle of the figure.
     * @param {number} feetY - Y position of the feet of the figure.
     * @returns {{column: number, row: number}|null} The place, or null if the figure does not stand on one.
     */
    getNodeAt(centerX, feetY){
        const NODE_COLUMN = Math.floor(centerX / TILE_SIZE);
        const NODE_ROW = Math.round(feetY / TILE_SIZE);
        return this.isStandable(NODE_COLUMN, NODE_ROW) ? { column: NODE_COLUMN, row: NODE_ROW } : null;
    }

    /**
     * Finds the goal for a way: the first standing place at or below the feet of the character in its column.
     * @param {{x: number, y: number, width: number, height: number}} rect - Hitbox of the character.
     * @returns {{column: number, row: number}|null} The goal place, or null if there is none.
     */
    getGoalNode(rect){
        const GOAL_COLUMN = Math.floor(getRectCenterX(rect) / TILE_SIZE);
        const START_ROW = clampValue(Math.floor((rect.y + rect.height + 1) / TILE_SIZE), this.topRow, this.bottomRow);
        for(let row = START_ROW; row <= this.bottomRow; row++){
            if(this.isStandable(GOAL_COLUMN, row)){
                return { column: GOAL_COLUMN, row };
            }
        }
        return null;
    }

    /**
     * Returns the next step of the cheapest way from a standing place to a goal. The result is stored, so the
     * same search does not run again every tick.
     * @param {{column: number, row: number}|null} startNode - The standing place of the boss.
     * @param {{column: number, row: number}|string} goal - A standing place, or 'ground' for any place in the
     * lowest row.
     * @returns {object|null} The first way to take, or null if there is no way.
     */
    findNextStep(startNode, goal){
        if(!startNode){
            return null;
        }
        const START_KEY = this.getKey(startNode.column, startNode.row);
        const GOAL_KEY = goal === 'ground' ? 'ground' : this.getKey(goal.column, goal.row);
        const CACHE_KEY = START_KEY + ':' + GOAL_KEY;
        if(!this.stepCache.has(CACHE_KEY)){
            this.stepCache.set(CACHE_KEY, this.searchStep(START_KEY, GOAL_KEY));
        }
        return this.stepCache.get(CACHE_KEY);
    }

    /**
     * Tells whether a standing place fulfills the goal: any place in the lowest row for 'ground', otherwise
     * exactly the goal place.
     * @param {number} nodeKey - Key of the place to check.
     * @param {number|string} goalKey - Key of the goal place, or 'ground'.
     * @returns {boolean} True if the place is a goal.
     */
    isGoal(nodeKey, goalKey){
        return goalKey === 'ground' ? Math.floor(nodeKey / this.columns) === this.bottomRow : nodeKey === goalKey;
    }

    /**
     * Searches the cheapest way from a start place to a goal and returns the first step of it. It always
     * continues with the cheapest place found so far (Dijkstra's method).
     * @param {number} startKey - Key of the start place.
     * @param {number|string} goalKey - Key of the goal place, or 'ground'.
     * @returns {object|null} The first way to take, or null if the goal cannot be reached.
     */
    searchStep(startKey, goalKey){
        const SEARCH = { costs: new Map([[startKey, 0]]), firstEdges: new Map(), openKeys: [startKey] };
        while(SEARCH.openKeys.length > 0){
            const CURRENT_KEY = this.takeCheapest(SEARCH);
            if(this.isGoal(CURRENT_KEY, goalKey)){
                return SEARCH.firstEdges.get(CURRENT_KEY) ?? null;
            }
            this.relaxEdges(CURRENT_KEY, startKey, SEARCH);
        }
        return null;
    }

    /**
     * Takes the open place with the lowest cost so far out of the search and returns its key.
     * @param {{costs: Map<number, number>, openKeys: number[]}} search - The state of the search, changed by the call.
     * @returns {number} The key of the cheapest open place.
     */
    takeCheapest(search){
        let cheapestIndex = 0;
        search.openKeys.forEach((nodeKey, index) => {
            if(search.costs.get(nodeKey) < search.costs.get(search.openKeys[cheapestIndex])){
                cheapestIndex = index;
            }
        });
        return search.openKeys.splice(cheapestIndex, 1)[0];
    }

    /**
     * Checks the ways that lead away from a place. A place that can now be reached more cheaply gets its new
     * cost and the first step of the way to it, and is added to the open places.
     * @param {number} currentKey - Key of the place whose ways are checked.
     * @param {number} startKey - Key of the start place of the search.
     * @param {{costs: Map<number, number>, firstEdges: Map<number, object>, openKeys: number[]}} search - The state of
     * the search, changed by the call.
     * @returns {void}
     */
    relaxEdges(currentKey, startKey, search){
        this.edges.get(currentKey).forEach(edge => {
            const NEW_COST = search.costs.get(currentKey) + edge.cost;
            if(!search.costs.has(edge.to) || NEW_COST < search.costs.get(edge.to)){
                search.costs.set(edge.to, NEW_COST);
                search.firstEdges.set(edge.to, currentKey === startKey ? edge : search.firstEdges.get(currentKey));
                search.openKeys.push(edge.to);
            }
        });
    }
}
