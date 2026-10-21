const IMAGE_IDLE = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Idle.png';
const IMAGE_WALK = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/Walk.png';

class Character extends MovableObject{
    width = 150;
    height = 150;
    world;
    currentPath;

    constructor(){
        super().loadImage(IMAGE_IDLE);
        this.loadImages([IMAGE_IDLE, IMAGE_WALK]);
        this.currentPath = IMAGE_IDLE;
        this.animate();
    }

    animate(){
        super.animate();
        setInterval(() => {
            this.moveByKeyboard();
            this.updateSprite();
        }, 1000 / 60);
    }

    moveByKeyboard(){
        if(this.world.keyboard.RIGHT){
            this.moveRight();
            this.otherDirection = false;
        }
        if(this.world.keyboard.LEFT){
            this.moveLeft();
            this.otherDirection = true;
        }
    }

    updateSprite(){
        const IS_WALKING = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        if(IS_WALKING){
            this.setSprite(IMAGE_WALK, 6);
        } else {
            this.setSprite(IMAGE_IDLE, 7);
        }
    }

    setSprite(path, count){
        if(this.currentPath == path){
            return;
        }
        this.img = this.imageCache[path];
        this.frameCount = count;
        this.currentFrame = 0;
        this.currentPath = path;
    }

    jump(){

    }
}
