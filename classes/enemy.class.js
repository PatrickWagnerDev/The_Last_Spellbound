class Enemy extends MovableObject {
    constructor(){
        super().loadImage('./assets/image/craftpix-987745-tiny-monsters-pixel-art-pack/1 Bear/Idle.png');
        this.x = 200 + Math.random() * 500;
    }
}