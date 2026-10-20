class BackgroundObject extends MovableObject {
    x = 0;
    y = 0;
    height = 720;
    width = 480;
    
    constructor(imagePath){
        super().loadImage(imagePath);
    }
}