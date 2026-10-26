const IMAGE_HEALTH_EMPTY = './assets/image/09-ui/2 Bars/Healthbar_empty.png';
const IMAGE_HEALTH_FULL = './assets/image/09-ui/2 Bars/Healthbar_full.png';
const IMAGE_ENERGY_EMPTY = './assets/image/09-ui/2 Bars/Energybar_empty.png';
const IMAGE_ENERGY_FULL = './assets/image/09-ui/2 Bars/Energybar_full.png';

class Hud {
    world;
    barInterval;
    keyIcon = this.createKeyIcon();
    energyBar = new StatusBar(IMAGE_ENERGY_EMPTY, IMAGE_ENERGY_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.energyBarY, { blink: false });
    healthBar = new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.statusBarY);
    bossBars = [];

    constructor(world){
        this.world = world;
        this.startBarTimer();
    }

    createKeyIcon(){
        const KEY_ICON = new DrawableObject();
        KEY_ICON.loadImage(IMAGE_KEY);
        KEY_ICON.frameWidth = 16;
        KEY_ICON.frameHeight = 16;
        KEY_ICON.width = 16 * GAME_SETTINGS.ui.keyIconScale;
        KEY_ICON.height = 16 * GAME_SETTINGS.ui.keyIconScale;
        KEY_ICON.y = GAME_SETTINGS.ui.keyIconY;
        return KEY_ICON;
    }

    createBossBars(maxHealth){
        const BAR_COUNT = maxHealth / GAME_SETTINGS.ui.bossBarHealthPerBar;
        const BAR_OPTIONS = { scale: GAME_SETTINGS.ui.bossBarScale };
        return Array.from({ length: BAR_COUNT }, () => new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, 0, 0, BAR_OPTIONS));
    }

    getBars(){
        return [this.healthBar, this.energyBar, ...this.bossBars];
    }

    startBarTimer(){
        this.barInterval = setInterval(() => this.updateBars(), 1000 / TICKS_PER_SECOND);
    }

    updateBars(){
        if(!this.world.isPaused){
            this.getBars().forEach(bar => bar.updateBlink());
        }
    }

    stopTimer(){
        clearInterval(this.barInterval);
    }

    drawHud(ctx){
        if(this.world.isGameEnded){
            return;
        }
        const PLAYER_CHARACTER = this.world.character;
        this.healthBar.setValue(PLAYER_CHARACTER.health, PLAYER_CHARACTER.maxHealth);
        this.healthBar.drawObject(ctx);
        this.energyBar.setValue(PLAYER_CHARACTER.energy, PLAYER_CHARACTER.maxEnergy);
        this.energyBar.drawObject(ctx);
        this.drawKeyIcons(ctx);
        this.drawBossBars(ctx);
    }

    drawKeyIcons(ctx){
        for(let keyIndex = 0; keyIndex < this.world.character.keyCount; keyIndex++){
            this.keyIcon.x = GAME_SETTINGS.ui.statusBarX + keyIndex * GAME_SETTINGS.ui.keyIconSpacing;
            this.keyIcon.drawObject(ctx);
        }
    }

    getBossBarStep(){
        return this.bossBars[0].width + GAME_SETTINGS.ui.bossBarGap;
    }

    getBarsPerRow(){
        return Math.min(GAME_SETTINGS.ui.bossBarsPerRow, this.bossBars.length);
    }

    getBossBarsStartX(boss){
        const BARS_WIDTH = this.getBarsPerRow() * this.getBossBarStep() - GAME_SETTINGS.ui.bossBarGap;
        return getRectCenterX(boss.getHitbox()) - Math.round(this.world.cameraX) - BARS_WIDTH / 2;
    }

    drawBossBars(ctx){
        const BOSS_ENEMY = this.world.findBoss();
        if(!BOSS_ENEMY || BOSS_ENEMY.isDead() || (!BOSS_ENEMY.hasNoticed && BOSS_ENEMY.health === BOSS_ENEMY.maxHealth)){
            return;
        }
        if(this.bossBars.length === 0){
            this.bossBars = this.createBossBars(BOSS_ENEMY.maxHealth);
        }
        ctx.globalAlpha = GAME_SETTINGS.ui.bossBarAlpha;
        this.bossBars.forEach((bar, barIndex) => this.drawBossBar(ctx, bar, BOSS_ENEMY, barIndex));
        ctx.globalAlpha = 1;
    }

    drawBossBar(ctx, bar, boss, barIndex){
        const HEALTH_PER_BAR = GAME_SETTINGS.ui.bossBarHealthPerBar;
        const ROW_COUNT = Math.ceil(this.bossBars.length / this.getBarsPerRow());
        const ROW_INDEX = ROW_COUNT - 1 - Math.floor(barIndex / this.getBarsPerRow());
        const TOP_Y = boss.getHitbox().y - GAME_SETTINGS.ui.bossBarGapAbove - ROW_COUNT * (bar.height + GAME_SETTINGS.ui.bossBarGap);
        bar.x = Math.round(this.getBossBarsStartX(boss) + (barIndex % this.getBarsPerRow()) * this.getBossBarStep());
        bar.y = Math.round(Math.max(TOP_Y, GAME_SETTINGS.ui.bossBarMinY) + ROW_INDEX * (bar.height + GAME_SETTINGS.ui.bossBarGap));
        bar.setValue(clampValue(boss.health - barIndex * HEALTH_PER_BAR, 0, HEALTH_PER_BAR), HEALTH_PER_BAR);
        bar.drawObject(ctx);
    }
}
