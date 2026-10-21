const BACKGROUND_WIDTH = 720;
const BACKGROUND_LAYERS = [
    { path: './assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees3.png', factor: 0 },
    { path: './assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees2.png', factor: 0.25 },
    { path: './assets/image/craftpix-661711-pixel-art-forest-2d-backgrounds/PNG/Forest1/Bright/trees1.png', factor: 0.5 }
];

class BackgroundObject extends MovableObject {
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
