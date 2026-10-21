class Enemy extends MovableObject {
    width = 100;
    height = 100;
    frameWidth = 40;
    frameHeight = 40;
    frameCount = 4;

    constructor(){
        super().loadImage('./assets/image/craftpix-987745-tiny-monsters-pixel-art-pack/1 Bear/Idle.png');
        this.x = 200 + Math.random() * 500;
        this.animate();
    }
}