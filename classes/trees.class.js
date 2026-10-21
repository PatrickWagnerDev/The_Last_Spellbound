const TREES_WIDTH = 720;

class Trees extends MovableObject {
    y = 0;
    height = 480;
    width = TREES_WIDTH;
    frameWidth = 1920;
    frameHeight = 1080;
    frameCount = 1;

    constructor(startX){
        super().loadImage('./assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/bushes.png');
        this.x = startX;
    }
}
