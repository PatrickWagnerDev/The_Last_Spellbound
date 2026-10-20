let canvas;
let ctx;

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    console.log('My Character is', World.character);
    
}