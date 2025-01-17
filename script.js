// Animation file map with frame count and speed
const animations = {
    idle: { file: "Idle.png", frames: 6, speed: 5 },
    run: { file: "Run.png", frames: 8, speed: 3 },
    jump: { file: "Jump.png", frames: 10, speed: 2 },
    attack1: { file: "Attack_1.png", frames: 4, speed: 6 },
    attack2: { file: "Attack_2.png", frames: 3, speed: 8 },
    attack3: { file: "Attack_3.png", frames: 4, speed: 6 },
    hurt: { file: "Hurt.png", frames: 3, speed: 8 },
    dead: { file: "Dead.png", frames: 3, speed: 15 },
    shield: { file: "Shield.png", frames: 2, speed: 12 },
    walk: { file: "Walk.png", frames: 8, speed: 4 }
};

// Current animation state
let playerState = {};
const dropdown = document.getElementById('animations')
dropdown.addEventListener('change', function (e) {
    setAnimation(e.target.value);
})

// Initialize the canvas with dimensions
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

// Define the playerImage and respective directory
const playerImage = new Image();
const spriteDirectory = "assets/sprites/Fighter/";
playerImage.src = "";
const spriteWidth = 128;
const spriteHeight = 128;
let gameFrame = 0;

// Define set animation function
function setAnimation(animationType) {
    if (animations[animationType]) {
        playerState = animations[animationType];
        playerImage.src = spriteDirectory + playerState.file;
    } else {
        console.error("Invalid animation type:", animationType);
    }
}
setAnimation("idle") // initial animation type

// Define animate function loop
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Create animation frames loop
    let positon = Math.floor(gameFrame / playerState.speed) % playerState.frames
    let frameX = spriteWidth * positon

    // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(playerImage, frameX, 0, spriteWidth, spriteHeight, 0, 0,
        CANVAS_WIDTH, CANVAS_HEIGHT);

    gameFrame++;
    // Continue the animation frames loop
    requestAnimationFrame(animate);
}
animate();