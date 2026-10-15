let canvas;
let ctx;
let character = new Image();

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    character.src = './assets/image/craftpix-net-529677-free-wizard-sprite-sheets-pixel-art/Fire Wizard/idle/Idle_r1_c1.png';
    ctx.drawImage(character, 20, 20, 50, 150);
}