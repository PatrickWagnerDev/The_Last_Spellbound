const MAGE_BOSS_SPRITES = {
    idle: { path: './assets/image/04-bosses/1 Mage/Mage_boss_walk.png', frames: 6 },
    walk: { path: './assets/image/04-bosses/1 Mage/Mage_boss_run.png', frames: 6 },
    sneer: { path: './assets/image/04-bosses/1 Mage/Mage_boss_sneer.png', frames: 6 },
    hurt: { path: './assets/image/04-bosses/1 Mage/Mage_boss_hurt.png', frames: 4 },
    death: { path: './assets/image/04-bosses/1 Mage/Mage_boss_death.png', frames: 6 }
};

class MageBoss extends Enemy {
    state = 'patrol';
    stateTicks = 0;
    vanishSide = 1;

    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.mageBoss,
            sprites: MAGE_BOSS_SPRITES,
            frameSize: 64,
            hitbox: { offsetX: 42, offsetY: 15, width: 120, height: 174 },
            spriteFacesLeft: true
        });
        this.otherDirection = Math.random() < 0.5;
        this.startAnimation();
    }

    updateBehavior(){
        this.stateTicks++;
        const STATE_UPDATES = {
            patrol: () => this.updatePatrol(),
            sneer: () => this.updateSneer(),
            chase: () => this.updateChase(),
            search: () => this.updateSearch()
        };
        STATE_UPDATES[this.state]();
    }

    setState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    getSightRect(){
        const BOSS_RECT = this.getHitbox();
        const RANGE = this.settings.sightTiles * TILE_SIZE;
        const ABOVE = this.settings.sightAboveTiles * TILE_SIZE;
        return { x: BOSS_RECT.x - RANGE, y: BOSS_RECT.y - ABOVE, width: BOSS_RECT.width + 2 * RANGE, height: BOSS_RECT.height + ABOVE };
    }

    isCharacterInSight(){
        const CHARACTER = this.world.character;
        return !CHARACTER.isDead() && areRectsOverlapping(CHARACTER.getHitbox(), this.getSightRect());
    }

    getCharacterOffset(){
        return getRectCenterX(this.world.character.getHitbox()) - getRectCenterX(this.getHitbox());
    }

    faceCharacter(){
        this.otherDirection = this.getCharacterOffset() < 0;
    }

    updatePatrol(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }

    startSneer(){
        this.faceCharacter();
        this.setState('sneer');
    }

    updateSneer(){
        this.faceCharacter();
        this.showProgressState('sneer', this.stateTicks, this.settings.sneerTicks);
        if(this.stateTicks >= this.settings.sneerTicks){
            this.setState('chase');
        }
    }

    updateChase(){
        if(!this.isCharacterInSight()){
            this.startSearch();
            return;
        }
        this.faceCharacter();
        this.showLoopState('walk', this.settings.animationFps);
        if(Math.abs(this.getCharacterOffset()) > 4 && !this.shouldTurn()){
            this.moveForward();
        }
    }

    startSearch(){
        this.vanishSide = this.getCharacterOffset() >= 0 ? 1 : -1;
        this.setState('search');
    }

    updateSearch(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('idle', this.settings.animationFps);
        this.lookAround();
        if(this.stateTicks >= this.settings.searchTicks){
            this.otherDirection = this.vanishSide > 0;
            this.setState('patrol');
        }
    }

    lookAround(){
        const LOOKS_TO_VANISH_SIDE = Math.floor(this.stateTicks / this.settings.lookSwitchTicks) % 2 == 0;
        this.otherDirection = LOOKS_TO_VANISH_SIDE ? this.vanishSide < 0 : this.vanishSide > 0;
    }

    drawDebugArea(ctx){
        this.drawRect(ctx, this.getSightRect(), 'yellow');
    }
}
