// Initialize the canvas with dimensions
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

// Define the playerImage and respective directory
const playerImage = new Image();
const spriteDirectory = "sprites/Fighter/";
playerImage.src = "";
const spriteWidth = 128;
const spriteHeight = 128;

// Animation file map
const animations = {
    idle: { file: "Idle.png", frames: 6 },
    run: { file: "Run.png", frames: 8 },
    jump: { file: "Jump.png", frames: 10 },
    attack1: { file: "Attack_1.png", frames: 4 },
    attack2: { file: "Attack_2.png", frames: 3 },
    attack3: { file: "Attack_3.png", frames: 4 },
    hurt: { file: "Hurt.png", frames: 3 },
    dead: { file: "Dead.png", frames: 3 },
    shield: { file: "Shield.png", frames: 2 },
    walk: { file: "Walk.png", frames: 8 },
};
// Current animation state
let currentAnimation = { file: animations.idle.file, frames: animations.idle.frames };

// Define set animation function
function setAnimation(animationType) {
    if (animations[animationType]) {
        currentAnimation = animations[animationType];
        playerImage.src = spriteDirectory + currentAnimation.file;
    } else {
        console.error("Invalid animation type:", animationType);
    }
}
setAnimation("idle");

// Define animate function loop
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(playerImage, 0, 0, spriteWidth, spriteHeight, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    requestAnimationFrame(animate);
}
animate();