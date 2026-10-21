const BACKGROUND_WIDTH = 720;

class BackgroundObject extends DrawableObject {
    y = 0;
    height = 480;
    width = BACKGROUND_WIDTH;
    frameWidth = 1920;
    frameHeight = 1080;
    frameCount = 1;

    constructor(imagePath, parallaxFactor, startX){
        super().loadImage(imagePath);
        this.parallaxFactor = parallaxFactor;
        this.x = startX;
    }
}
