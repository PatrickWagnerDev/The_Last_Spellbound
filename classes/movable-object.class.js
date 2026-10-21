class MovableObject{
    x = 120;
    y = 350;
    img;
    height = 150;
    width = 100;
    frameWidth = 128;
    frameHeight = 128;
    frameCount = 7;
    currentFrame = 0;

    constructor(){
    }

    animate(){
        setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }, 1000 / 8);
    }

    loadImage(path){
        this.img = new Image();
        this.img.src = path;
    }

    moveRight(){
        console.log('Moving right');
    }

    moveLeft(){
        console.log('Moving left');
    }
}