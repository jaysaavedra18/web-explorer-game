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

// Manage key states to track input
let keyStates = {}

window.addEventListener("keydown", (e) => {
    keyStates[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keyStates[e.key] = false;
});


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

// Define movement variables
let playerX = 35;
let playerY = 450;
let velocityX = 0;  // Horizontal velocity
let velocityY = 0;  // Vertical velocity (gravity)
let isJumping = false;  // Jumping state
let isOnGround = false;  // Ground check
const gravity = 0.5;  // Gravity strength
const jumpPower = -10;  // Jump force
const walkSpeed = 3;  // Horizontal walking speed
const groundY = 463;  // Ground Y-position (adjust based on canvas)

// Define the tile directory
const tileDirectory = "assets/zone0/tiles/";
const tileWidth = tileHeight = 48;
// Store tile images globally so we don't reload them every frame
const tileImages = new Map();


// Define background image directory
const backgroundImage = new Image();
backgroundImage.src = 'assets/zone0/zone0-bg.jpg';
backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

// Define frame (FPS) management
let gameFrame = 0;

// Function to preload tile images
async function preloadTileImages(graphical_map) {
    const uniqueTileIds = [...new Set(graphical_map.filter(id => id !== 0))];

    for (const tileId of uniqueTileIds) {
        const tileImage = new Image();
        tileImage.src = `${tileDirectory}tile${tileId}.png`;
        await new Promise((resolve) => {
            tileImage.onload = resolve;
        });
        tileImages.set(tileId, tileImage);
    }
}

// Modified loadLevel function
async function loadLevel(levelId) {
    // Fetch level JSON
    const response = await fetch(`assets/zone0/zone${levelId}.json`);
    levelData = await response.json();

    const { doors, columns, rows, pos_x, pos_y, graphical_map, collision_map, id } = levelData;
    console.log(`Loaded level ${id}`);

    // Preload all tile images
    await preloadTileImages(graphical_map);

    // Store level data for reuse in drawing
    levelData = {
        doors,
        columns,
        rows,
        graphical_map
    };
}

// Function to draw the current level
function drawLevel() {
    if (!levelData) return;

    const { doors, columns, rows, graphical_map } = levelData;

    // Draw graphical map
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tileIndex = row * columns + col;
            const tileId = graphical_map[tileIndex];

            // Skip empty tiles
            if (tileId === 0) continue;

            // Draw tile using preloaded image
            const tileImage = tileImages.get(tileId);
            if (tileImage) {
                ctx.drawImage(
                    tileImage,
                    col * tileWidth,
                    row * tileHeight,
                    tileWidth,
                    tileHeight
                );
            }
        }
    }

    // Draw doors
    doors.forEach((door) => {
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fillRect(door.x, door.y, door.width, door.height);
    });
}



// Example: Load level 0
loadLevel("00");

// Handle user input for movement
function handleInput() {
    if (keyStates["ArrowRight"]) {
        velocityX = walkSpeed;
        setAnimation("walk"); // Change to walk animation
    } else if (keyStates["ArrowLeft"]) {
        velocityX = -walkSpeed;
        setAnimation("walk"); // Change to walk animation
    } else {
        velocityX = 0;
        setAnimation("idle"); // Idle animation when not moving
    }

    // Jumping logic
    if (keyStates["Space"] && isOnGround && !isJumping) {
        velocityY = jumpPower;
        isJumping = true;
        setAnimation("jump"); // Jump animation
    }
}

// Update character position based on velocities
function updatePosition() {
    // Apply gravity
    if (velocityY < 10) velocityY += gravity;  // Simulate falling
    playerY += velocityY;

    // Check for ground collision (basic check)
    if (playerY > groundY) {
        playerY = groundY;
        velocityY = 0;
        isOnGround = true;
        isJumping = false;
    } else {
        isOnGround = false;
    }

    // Update horizontal position
    playerX += velocityX;

    // Prevent the character from moving out of bounds
    playerX = Math.max(0, Math.min(canvas.width - spriteWidth, playerX));
}

// Define set animation function
function setAnimation(animationType) {
    if (animations[animationType]) {
        playerState = animations[animationType];
        playerImage.src = spriteDirectory + playerState.file;
    } else {
        console.error("Invalid animation type:", animationType);
    }
}

// Updated animate function
function animate() {
    // Handle input for movement
    handleInput();

    // Update position based on velocities
    updatePosition();

    // Create animation frames loop
    let position = Math.floor(gameFrame / playerState.speed) % playerState.frames;
    let frameX = spriteWidth * position;

    // Clear the canvas and redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw level tiles
    drawLevel();

    // Draw player sprite
    ctx.drawImage(playerImage, frameX, 0, spriteWidth, spriteHeight, playerX, playerY,
        spriteWidth * spriteFactor, spriteHeight * spriteFactor);

    gameFrame++;
    requestAnimationFrame(animate);
}

setAnimation("idle") // initial animation type
animate();