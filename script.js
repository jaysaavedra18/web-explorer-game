/***********************************
 * Constants and Configurations
 ***********************************/

// Canvas Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 572;
const CANVAS_HEIGHT = canvas.height = 572;

// Asset Directories
const ASSET_PATHS = {
    sprites: "assets/sprites/Fighter/",
    tiles: "assets/zone0/tiles/",
    background: 'assets/zone0/zone0-bg.jpg'
};

// Physics Constants
const PHYSICS = {
    gravity: 0.5,
    jumpPower: -10,
    walkSpeed: 3,
    groundY: 463
};

// Sprite Constants
const SPRITE = {
    width: 128,
    height: 128,
    size: 0.5,
};

// Tile Constants
const TILE = {
    width: 48,
    height: 48
};

// Animation Configurations
const ANIMATIONS = {
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

/***********************************
 * Game State Management
 ***********************************/

class GameState {
    constructor() {
        this.playerState = {};
        this.levelData = null;
        this.gameFrame = 0;
        this.tileImages = new Map();

        // Player position and movement
        this.player = {
            x: 35,
            y: 400,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            isOnGround: false
        };

        // Input handling
        this.keyStates = {};
        this.setupInputHandlers();

        // Load images
        this.playerImage = new Image();
        this.backgroundImage = new Image();
        this.loadBackgroundImage();
    }

    setupInputHandlers() {
        window.addEventListener("keydown", (e) => this.keyStates[e.key] = true);
        window.addEventListener("keyup", (e) => this.keyStates[e.key] = false);
    }

    loadBackgroundImage() {
        this.backgroundImage.src = ASSET_PATHS.background;
        this.backgroundImage.onload = () => {
            ctx.drawImage(this.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        };
    }
}

/***********************************
 * Level Management
 ***********************************/

class LevelManager {
    static async preloadTileImages(graphical_map, gameState) {
        const uniqueTileIds = [...new Set(graphical_map.filter(id => id !== 0))];

        for (const tileId of uniqueTileIds) {
            const tileImage = new Image();
            tileImage.src = `${ASSET_PATHS.tiles}tile${tileId}.png`;
            await new Promise((resolve) => {
                tileImage.onload = resolve;
            });
            gameState.tileImages.set(tileId, tileImage);
        }
    }

    static async loadLevel(levelId, gameState) {
        const response = await fetch(`assets/zone0/zone${levelId}.json`);
        const data = await response.json();

        console.log(`Loaded level ${data.id}`);

        await this.preloadTileImages(data.graphical_map, gameState);
        gameState.levelData = {
            doors: data.doors,
            columns: data.columns,
            rows: data.rows,
            graphical_map: data.graphical_map
        };
    }

    static drawLevel(gameState) {
        if (!gameState.levelData) return;

        const { doors, columns, rows, graphical_map } = gameState.levelData;

        // Draw tiles
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const tileIndex = row * columns + col;
                const tileId = graphical_map[tileIndex];

                if (tileId === 0) continue;

                const tileImage = gameState.tileImages.get(tileId);
                if (tileImage) {
                    ctx.drawImage(
                        tileImage,
                        col * TILE.width,
                        row * TILE.height,
                        TILE.width,
                        TILE.height
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
}

/***********************************
 * Player Management
 ***********************************/

class PlayerManager {
    static handleInput(gameState) {
        const { keyStates, player } = gameState;

        // Horizontal movement
        if (keyStates["ArrowRight"]) {
            player.velocityX = PHYSICS.walkSpeed;
            this.setAnimation(gameState, "walk");
        } else if (keyStates["ArrowLeft"]) {
            player.velocityX = -PHYSICS.walkSpeed;
            this.setAnimation(gameState, "walk");
        } else {
            player.velocityX = 0;
            this.setAnimation(gameState, "idle");
        }

        // Jump handling
        if (keyStates["Space"] && player.isOnGround && !player.isJumping) {
            player.velocityY = PHYSICS.jumpPower;
            player.isJumping = true;
            this.setAnimation(gameState, "jump");
        }
    }

    static updatePosition(gameState) {
        const { player } = gameState;

        // Vertical movement (gravity)
        if (player.velocityY < 10) {
            player.velocityY += PHYSICS.gravity;
        }
        player.y += player.velocityY;

        // Ground collision
        if (player.y > PHYSICS.groundY) {
            player.y = PHYSICS.groundY;
            player.velocityY = 0;
            player.isOnGround = true;
            player.isJumping = false;
        } else {
            player.isOnGround = false;
        }

        // Horizontal movement with bounds checking
        player.x += player.velocityX;
        player.x = Math.max(0, Math.min(CANVAS_WIDTH - SPRITE.width, player.x));
    }

    static setAnimation(gameState, animationType) {
        if (ANIMATIONS[animationType]) {
            gameState.playerState = ANIMATIONS[animationType];
            gameState.playerImage.src = ASSET_PATHS.sprites + gameState.playerState.file;
        } else {
            console.error("Invalid animation type:", animationType);
        }
    }
}

/***********************************
 * Game Loop and Rendering
 ***********************************/

class GameLoop {
    static animate(gameState) {
        // Update game state
        PlayerManager.handleInput(gameState);
        PlayerManager.updatePosition(gameState);

        // Calculate animation frame
        const position = Math.floor(gameState.gameFrame / gameState.playerState.speed) % gameState.playerState.frames;
        const frameX = SPRITE.width * position;

        // Clear and redraw
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(gameState.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        LevelManager.drawLevel(gameState);

        // Draw player
        ctx.drawImage(
            gameState.playerImage,
            frameX, 0,
            SPRITE.width, SPRITE.height,
            gameState.player.x, gameState.player.y,
            SPRITE.width * SPRITE.size,
            SPRITE.height * SPRITE.size
        );

        gameState.gameFrame++;
        requestAnimationFrame(() => GameLoop.animate(gameState));
    }
}

/***********************************
 * Game Initialization
 ***********************************/

async function initGame() {
    const gameState = new GameState();
    PlayerManager.setAnimation(gameState, "idle");
    await LevelManager.loadLevel("00", gameState);
    GameLoop.animate(gameState);
}

// Start the game
initGame();