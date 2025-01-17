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

// Declare playerState & levelData
let playerState = {};
let levelData = null;

// Initialize the canvas with dimensions
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 572;
const CANVAS_HEIGHT = canvas.height = 572;

// Define the playerImage and respective directory
const playerImage = new Image();
const spriteDirectory = "assets/sprites/Fighter/";
const spriteWidth = spriteHeight = 128;
const spriteFactor = 0.5

// Define the tile directory
const tileDirectory = "assets/zone0/tiles/";
const tileWidth = tileHeight = 48;

// Define background image directory
const backgroundImage = new Image();
backgroundImage.src = 'assets/zone0/zone0-bg.jpg';
backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

// Define frame (FPS) management
let gameFrame = 0;

// Function to load a level
async function loadLevel(levelId) {
    // Fetch level JSON
    const response = await fetch(`assets/zone0/zone${levelId}.json`);
    levelData = await response.json();

    const { doors, columns, rows, pos_x, pos_y, graphical_map, collision_map, id } = levelData;

    console.log(`Loaded level ${id}`);
    // console.log(pos_x, pos_y)

    // Draw graphical map
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tileIndex = row * columns + col;
            const tileId = graphical_map[tileIndex];
            // Handle 0's, empty tile spaces
            if (tileId === 0) continue;

            // Draw tile
            if (tileId !== undefined) {
                const tileImage = new Image();
                tileImage.src = `${tileDirectory}tile${tileId}.png`;
                tileImage.onload = () => {
                    ctx.drawImage(
                        tileImage,
                        col * tileWidth,
                        row * tileHeight,
                        tileWidth,
                        tileHeight
                    );
                };
            }
        }
    }

    // Draw doors
    doors.forEach((door) => {
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)"; // Highlight doors (can be replaced with images)
        ctx.fillRect(door.x, door.y, door.width, door.height);

        // Example: Load the destination zone when interacting with a door
        // This should be replaced with actual player collision checks
        console.log(`Door to zone ${door.destination_zone} at (${door.destination_x}, ${door.destination_y})`);
    });

    // Handle collision map
    // Use collision_map for collision detection in your game logic
    console.log("Collision Map:", collision_map);

}

// Example: Load level 0
loadLevel("00");

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
    // Create animation frames loop
    let positon = Math.floor(gameFrame / playerState.speed) % playerState.frames
    let frameX = spriteWidth * positon

    // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(playerImage, frameX, 0, spriteWidth, spriteHeight, 35, 450,
        spriteWidth * spriteFactor, spriteHeight * spriteFactor);

    gameFrame++;
    // Continue the animation frames loop
    requestAnimationFrame(animate);
}
animate();