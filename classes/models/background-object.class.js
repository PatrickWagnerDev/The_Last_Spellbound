const BACKGROUND_WIDTH = 720;

class BackgroundObject extends DrawableObject {
    y = 0;
    height = 480;
    width = BACKGROUND_WIDTH;
    frameWidth = 720;
    frameHeight = 480;
    frameCount = 1;

    constructor(imagePath, parallaxFactor, startX){
        super().loadImage(imagePath);
        this.parallaxFactor = parallaxFactor;
        this.x = startX;
    }
}
