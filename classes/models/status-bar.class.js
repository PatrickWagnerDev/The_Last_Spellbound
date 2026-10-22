class StatusBar extends DrawableObject {
    frameWidth = 96;
    frameHeight = 12;
    value = 1;
    maxValue = 1;
    blinkFrom = 0;
    blinkTicksLeft = 0;

    constructor(emptyPath, fullPath, x, y, options = {}){
        super();
        this.blinkEnabled = options.blink ?? true;
        this.loadImage(emptyPath);
        this.fullImage = createImage(fullPath);
        this.x = x;
        this.y = y;
        const SCALE_FACTOR = options.scale ?? GAME_SETTINGS.ui.statusBarScale;
        this.width = this.frameWidth * SCALE_FACTOR;
        this.height = this.frameHeight * SCALE_FACTOR;
    }

    setValue(current, max){
        if(this.blinkEnabled && current < this.value){
            this.blinkFrom = this.blinkTicksLeft > 0 ? this.blinkFrom : this.value;
            this.blinkTicksLeft = GAME_SETTINGS.ui.blinkTicks;
        }
        this.value = current;
        this.maxValue = max;
    }

    updateBlink(){
        this.blinkTicksLeft = tickDown(this.blinkTicksLeft);
    }

    isBlinkVisible(){
        const BLINK_PHASE = Math.floor(this.blinkTicksLeft / GAME_SETTINGS.ui.blinkIntervalTicks);
        return this.blinkTicksLeft > 0 && BLINK_PHASE % 2 === 0;
    }

    getRatio(value){
        return this.maxValue > 0 ? value / this.maxValue : 0;
    }

    drawObject(ctx){
        ctx.drawImage(this.img, 0, 0, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
        this.drawFullPart(ctx, 0, this.getRatio(this.value));
        if(this.isBlinkVisible()){
            this.drawFullPart(ctx, this.getRatio(this.value), this.getRatio(this.blinkFrom));
        }
    }

    drawFullPart(ctx, fromRatio, toRatio){
        const SOURCE_X = Math.round(this.frameWidth * fromRatio);
        const SOURCE_WIDTH = Math.round(this.frameWidth * toRatio) - SOURCE_X;
        const SCALE_FACTOR = this.width / this.frameWidth;
        if(SOURCE_WIDTH <= 0){
            return;
        }
        ctx.drawImage(this.fullImage, SOURCE_X, 0, SOURCE_WIDTH, this.frameHeight, this.x + SOURCE_X * SCALE_FACTOR, this.y, SOURCE_WIDTH * SCALE_FACTOR, this.height);
    }
}
