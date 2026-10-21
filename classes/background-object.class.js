class BackgroundObject extends MovableObject {
    x = 0;
    y = 0;
    height = 480;
    width = 720;
    frameWidth = 1920;
    frameHeight = 1080;
    frameCount = 1;
    
    constructor(imagePath){
        super().loadImage(imagePath);
    }
}