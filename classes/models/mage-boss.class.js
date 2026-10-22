const MAGE_BOSS_SPRITES = {
    idle: { path: './assets/image/04-bosses/1 Mage/Mage_boss_walk.png', frames: 6 },
    walk: { path: './assets/image/04-bosses/1 Mage/Mage_boss_run.png', frames: 6 },
    sneer: { path: './assets/image/04-bosses/1 Mage/Mage_boss_sneer.png', frames: 6 },
    hurt: { path: './assets/image/04-bosses/1 Mage/Mage_boss_hurt.png', frames: 4 },
    death: { path: './assets/image/04-bosses/1 Mage/Mage_boss_death.png', frames: 6 }
};

class MageBoss extends Enemy {
    state = 'wait';
    stateTicks = 0;
    vanishSide = 1;
    outOfSightTicks = 0;

    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.mageBoss,
            sprites: MAGE_BOSS_SPRITES,
            frameSize: 64,
            hitbox: { offsetX: 42, offsetY: 15, width: 120, height: 174 },
            spriteFacesLeft: true
        });
        this.otherDirection = true;
        this.startAnimation();
    }

    updateBehavior(){
        this.stateTicks++;
        const STATE_UPDATES = {
            wait: () => this.updateWait(),
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

    updateWait(){
        this.showLoopState('idle', this.settings.animationFps);
        if(this.isCharacterInSight()){
            this.startSneer();
        }
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
            this.startChase();
        }
    }

    startChase(){
        this.outOfSightTicks = 0;
        this.setState('chase');
    }

    trackSight(){
        if(this.isCharacterInSight()){
            this.outOfSightTicks = 0;
            this.vanishSide = this.getCharacterOffset() >= 0 ? 1 : -1;
        } else {
            this.outOfSightTicks++;
        }
    }

    updateChase(){
        this.trackSight();
        if(this.outOfSightTicks >= this.settings.loseSightTicks){
            this.setState('search');
            return;
        }
        this.faceCharacter();
        this.showLoopState('walk', this.settings.animationFps);
        if(Math.abs(this.getCharacterOffset()) > 4 && !this.shouldTurn()){
            this.moveForward();
        }
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
