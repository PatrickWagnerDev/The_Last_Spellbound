const JUMP_TEST_OFFSETS = [-4, 0, 4];
const MAX_AIR_TICKS = 150;

class PlatformNav {
    constructor(level, settings){
        this.level = level;
        this.settings = settings;
        this.columns = level.mapRows[0].length;
        this.bottomRow = level.mapRows.length - 1;
        this.topRow = Math.max(this.bottomRow - settings.maxPlatformTiles, 0);
        this.edges = this.buildEdges();
        this.stepCache = new Map();
    }

    isStandable(column, row){
        const IN_RANGE = column >= 0 && column < this.columns && row >= this.topRow && row <= this.bottomRow;
        return IN_RANGE && this.level.isWalkableAt(column * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
    }

    getKey(column, row){
        return row * this.columns + column;
    }

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

    createEdges(column, row){
        const EDGES = [-1, 1].flatMap(direction => [this.createMoveEdge(column, row, direction), this.createJumpEdge(column, row, direction)]);
        return EDGES.filter(edge => edge);
    }

    createMoveEdge(column, row, direction){
        const NEXT_COLUMN = column + direction;
        if(this.isStandable(NEXT_COLUMN, row)){
            return { to: this.getKey(NEXT_COLUMN, row), kind: 'walk', direction, cost: 1 };
        }
        const FALL_ROW = this.findFallRow(NEXT_COLUMN, row);
        return FALL_ROW === null ? null : { to: this.getKey(NEXT_COLUMN, FALL_ROW), kind: 'fall', direction, cost: 2 };
    }

    findFallRow(column, row){
        for(let fallRow = row + 1; fallRow <= this.bottomRow; fallRow++){
            if(this.isStandable(column, fallRow)){
                return fallRow;
            }
        }
        return null;
    }

    createJumpEdge(column, row, direction){
        const TAKEOFF_X = column * TILE_SIZE + TILE_SIZE / 2;
        const LANDING_KEYS = JUMP_TEST_OFFSETS.map(offset => this.simulateJump(TAKEOFF_X + offset, row * TILE_SIZE, direction));
        const IS_STABLE = LANDING_KEYS[0] !== null && LANDING_KEYS.every(landingKey => landingKey === LANDING_KEYS[0]);
        if(!IS_STABLE || LANDING_KEYS[0] === this.getKey(column, row)){
            return null;
        }
        return { to: LANDING_KEYS[0], kind: 'jump', direction, takeoffX: TAKEOFF_X, cost: 3 };
    }

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

    getLandingKey(posX, landingRow){
        const LANDING_COLUMN = Math.floor(posX / TILE_SIZE);
        return this.isStandable(LANDING_COLUMN, landingRow) ? this.getKey(LANDING_COLUMN, landingRow) : null;
    }

    getLandingRow(posX, previousFeet, feet, speedY){
        const TILE_ROW = Math.floor(feet / TILE_SIZE);
        const CAN_LAND = speedY <= 0 && previousFeet <= TILE_ROW * TILE_SIZE && this.level.isWalkableAt(posX, TILE_ROW * TILE_SIZE);
        return CAN_LAND ? TILE_ROW : null;
    }

    getNodeAt(centerX, feetY){
        const NODE_COLUMN = Math.floor(centerX / TILE_SIZE);
        const NODE_ROW = Math.round(feetY / TILE_SIZE);
        return this.isStandable(NODE_COLUMN, NODE_ROW) ? { column: NODE_COLUMN, row: NODE_ROW } : null;
    }

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

    isGoal(nodeKey, goalKey){
        return goalKey === 'ground' ? Math.floor(nodeKey / this.columns) === this.bottomRow : nodeKey === goalKey;
    }

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

    takeCheapest(search){
        let cheapestIndex = 0;
        search.openKeys.forEach((nodeKey, index) => {
            if(search.costs.get(nodeKey) < search.costs.get(search.openKeys[cheapestIndex])){
                cheapestIndex = index;
            }
        });
        return search.openKeys.splice(cheapestIndex, 1)[0];
    }

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
