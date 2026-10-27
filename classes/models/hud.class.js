const IMAGE_HEALTH_EMPTY = './assets/image/09-ui/2 Bars/Healthbar_empty.png';
const IMAGE_HEALTH_FULL = './assets/image/09-ui/2 Bars/Healthbar_full.png';
const IMAGE_ENERGY_EMPTY = './assets/image/09-ui/2 Bars/Energybar_empty.png';
const IMAGE_ENERGY_FULL = './assets/image/09-ui/2 Bars/Energybar_full.png';

/**
 * The display over the game: health and energy bar of the character, one key symbol per key and the
 * small health bars over the head of the boss. It belongs to the world, which draws it every frame.
 */
class Hud {
    world;
    barInterval;
    keyIcon = this.createKeyIcon();
    energyBar = new StatusBar(IMAGE_ENERGY_EMPTY, IMAGE_ENERGY_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.energyBarY, { blink: false });
    healthBar = new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, GAME_SETTINGS.ui.statusBarX, GAME_SETTINGS.ui.statusBarY);
    bossBars = [];

    /**
     * Creates the display for a world and starts its blink timer.
     * @param {World} world - The world this display belongs to.
     */
    constructor(world){
        this.world = world;
        this.startBarTimer();
    }

    /**
     * Creates the key symbol that is drawn once for every key of the character.
     * @returns {DrawableObject} The key symbol with its size and its vertical position.
     */
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

    /**
     * Creates the small health bars of the boss, one for every few health points.
     * @param {number} maxHealth - Maximum health of the boss.
     * @returns {StatusBar[]} The bars, in the order from the first health points to the last.
     */
    createBossBars(maxHealth){
        const BAR_COUNT = maxHealth / GAME_SETTINGS.ui.bossBarHealthPerBar;
        const BAR_OPTIONS = { scale: GAME_SETTINGS.ui.bossBarScale };
        return Array.from({ length: BAR_COUNT }, () => new StatusBar(IMAGE_HEALTH_EMPTY, IMAGE_HEALTH_FULL, 0, 0, BAR_OPTIONS));
    }

    /**
     * Returns all bars of the display.
     * @returns {StatusBar[]} Health bar, energy bar and the boss bars.
     */
    getBars(){
        return [this.healthBar, this.energyBar, ...this.bossBars];
    }

    /**
     * Starts the timer that updates the bars 60 times per second.
     * @returns {void}
     */
    startBarTimer(){
        this.barInterval = setInterval(() => this.updateBars(), 1000 / TICKS_PER_SECOND);
    }

    /**
     * Counts the blink time of all bars down by one tick, except while the game is paused.
     * @returns {void}
     */
    updateBars(){
        if(!this.world.isPaused){
            this.getBars().forEach(bar => bar.updateBlink());
        }
    }

    /**
     * Stops the timer of the display.
     * @returns {void}
     */
    stopTimer(){
        clearInterval(this.barInterval);
    }

    /**
     * Draws the whole display: health and energy bar, key symbols and boss bars. Draws nothing once the game
     * has ended.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
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

    /**
     * Draws one key symbol for every key the character carries, side by side.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
    drawKeyIcons(ctx){
        for(let keyIndex = 0; keyIndex < this.world.character.keyCount; keyIndex++){
            this.keyIcon.x = GAME_SETTINGS.ui.statusBarX + keyIndex * GAME_SETTINGS.ui.keyIconSpacing;
            this.keyIcon.drawObject(ctx);
        }
    }

    /**
     * Returns the distance from one boss bar to the next one in a row.
     * @returns {number} Width of a bar plus the gap, in pixels.
     */
    getBossBarStep(){
        return this.bossBars[0].width + GAME_SETTINGS.ui.bossBarGap;
    }

    /**
     * Returns how many boss bars stand in one row.
     * @returns {number} The configured number per row, or fewer if the boss has fewer bars.
     */
    getBarsPerRow(){
        return Math.min(GAME_SETTINGS.ui.bossBarsPerRow, this.bossBars.length);
    }

    /**
     * Calculates where the boss bars of a row start on the screen so that the row is centered over the boss.
     * @param {Boss} boss - The boss the bars belong to.
     * @returns {number} Horizontal screen position of the first bar of a row.
     */
    getBossBarsStartX(boss){
        const BARS_WIDTH = this.getBarsPerRow() * this.getBossBarStep() - GAME_SETTINGS.ui.bossBarGap;
        return getRectCenterX(boss.getHitbox()) - Math.round(this.world.cameraX) - BARS_WIDTH / 2;
    }

    /**
     * Draws the boss bars over the head of the boss. They appear when the boss has noticed the character or
     * was hurt, and disappear when it is dead. They are drawn slightly transparent.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @returns {void}
     */
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

    /**
     * Places one boss bar over the boss, sets its value and draws it. The bars empty one after the other,
     * starting with the top row.
     * @param {CanvasRenderingContext2D} ctx - Drawing context of the game canvas.
     * @param {StatusBar} bar - The bar to draw.
     * @param {Boss} boss - The boss the bar belongs to.
     * @param {number} barIndex - Index of the bar, 0 is the first one with the first health points.
     * @returns {void}
     */
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
