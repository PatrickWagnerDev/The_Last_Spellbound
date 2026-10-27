const BACKGROUND_WIDTH = 720;

/**
 * One picture of a background layer, as large as the screen. A layer is made of two of them side by side.
 * The parallax factor tells how fast the layer moves with the camera, the world does the shifting.
 */
class BackgroundObject extends DrawableObject {
    y = 0;
    height = 480;
    width = BACKGROUND_WIDTH;
    frameWidth = 720;
    frameHeight = 480;
    frameCount = 1;

    /**
     * Creates a background picture.
     * @param {string} imagePath - Path of the picture.
     * @param {number} parallaxFactor - How fast the layer moves with the camera, 0 stays still and 1 moves like
     * the level.
     * @param {number} startX - Horizontal position of the picture, 0 or the width of the screen.
     */
    constructor(imagePath, parallaxFactor, startX){
        super().loadImage(imagePath);
        this.parallaxFactor = parallaxFactor;
        this.x = startX;
    }
}
