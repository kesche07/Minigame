const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// game screen size 16:9 ratio
canvas.width = 1024;
canvas.height = 576;

// creates background or working space
c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.5;
let gameStarted = false; // State flag to control game start

// Sprite creations

// bg creation
const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: './../Assets/background.png',
});

// shop
const shop = new Sprite({
    position: { x: 640, y: 135 },
    imageSrc: './../Assets/shop.png',
    scale: 2.7,
    framesMax: 6
});

let player;
let enemy;

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }
};

// Start Screen Overlay Handler
const controlsOverlay = document.getElementById('controls-overlay');

function startGame() {
    if (controlsOverlay) controlsOverlay.style.display = 'none';
    gameStarted = true;
    decreaseTimer(); // Timer starts only when player clicks/taps screen
}

if (controlsOverlay) {
    controlsOverlay.addEventListener('click', startGame, { once: true });
    controlsOverlay.addEventListener('touchstart', startGame, { once: true });
}


// inf loop per frame for movement
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    

    background.update();
    shop.update();

    if (!player || !enemy) return;


    c.fillStyle = 'rgba(255,255,255,0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);


    player.update();
    
    enemy.update();


    // Force characters back to idle when grounded, even before game starts
if (player.velocity.y === 0 && !player.dead) {
    player.switchSprite('idle');
}
if (enemy.velocity.y === 0 && !enemy.dead) {
    enemy.switchSprite('idle');
}
    // Pause physics & controls until screen is tapped
    if (!gameStarted) return;

    // player movement
    player.velocity.x = 0;

    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5;
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }
    
    // falling / jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    // enemy movement
    enemy.velocity.x = 0;
    
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    // falling / jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    // Clamp Player inside screen
    if (player.position.x < 0) {
        player.position.x = 0;
    } else if (player.position.x + player.width > canvas.width) {
        player.position.x = canvas.width - player.width;
    }

    // Clamp Enemy inside screen
    if (enemy.position.x < 0) {
        enemy.position.x = 0;
    } else if (enemy.position.x + enemy.width > canvas.width) {
        enemy.position.x = canvas.width - enemy.width;
    }

    // Player attacking detection
    if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking && 
        player.frameCurrent === 2
    ) {
        enemy.takeHit();
        player.isAttacking = false;
        document.querySelector('#enemyhealth').style.width = enemy.health + '%';
    }

    if (player.isAttacking && player.frameCurrent === 3) {
        player.isAttacking = false;
    }

    // Enemy attacking detection
    if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking && 
        enemy.frameCurrent === 2
    ) {
        player.takeHit();
        enemy.isAttacking = false;
        document.querySelector('#playerhealth').style.width = player.health + '%';
    }

    if (enemy.isAttacking && enemy.frameCurrent === 2) {
        enemy.isAttacking = false;
    }
    
    // Endgame condition
    if (enemy.health <= 0 || player.health <= 0) {
        findWinner({ player, enemy, timerId });
    }
}

animate();

window.addEventListener('keydown', (event) => {
    if (!gameStarted) return; // Block input until overlay clicked

    if (!player.dead) {
        player.velocity.x =0

        switch (event.key.toLowerCase()) {
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w':
                if (player.jumps < 2) {
                    player.velocity.y = -20;
                    player.jumps++;
                }
                break;
            case 's':
                player.attack();
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break; 
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break; 
            case 'ArrowUp':
                if (enemy.jumps < 2) {
                    enemy.velocity.y = -20;
                    enemy.jumps++;
                }
                break; 
            case 'ArrowDown':
                enemy.attack();
                break;
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (!gameStarted) return;

    switch (event.key.toLowerCase()) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break; 
        case 'w':
            keys.w.pressed = false;
            break; 
    }

    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break; 
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break; 
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
    }
});

function bindButton(buttonId, onPress, onRelease) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (gameStarted) onPress();
    });

    btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (gameStarted && onRelease) onRelease();
    });
    btn.addEventListener('pointerleave', (e) => {
        e.preventDefault();
        if (gameStarted && onRelease) onRelease();
    });
}

// Player Touch Controls
bindButton('p-left', () => { keys.a.pressed = true; player.lastKey = 'a'; }, () => { keys.a.pressed = false; });
bindButton('p-right', () => { keys.d.pressed = true; player.lastKey = 'd'; }, () => { keys.d.pressed = false; });
bindButton('p-jump', () => { if (player.velocity.y === 0) player.velocity.y = -20; });
bindButton('p-attack', () => { if (!player.dead) player.attack(); });

// Enemy Touch Controls
bindButton('e-left', () => { keys.ArrowLeft.pressed = true; enemy.lastKey = 'ArrowLeft'; }, () => { keys.ArrowLeft.pressed = false; });
bindButton('e-right', () => { keys.ArrowRight.pressed = true; enemy.lastKey = 'ArrowRight'; }, () => { keys.ArrowRight.pressed = false; });
bindButton('e-jump', () => { if (enemy.velocity.y === 0) enemy.velocity.y = -20; });
bindButton('e-attack', () => { if (!enemy.dead) enemy.attack(); });

function resetGame(event) {
    if (event) event.preventDefault();

    player.health = 100;
    enemy.health = 100;
    document.querySelector('#playerhealth').style.width = '100%';
    document.querySelector('#enemyhealth').style.width = '100%';

    player.position = { x: 0, y: 0 };
    enemy.position = { x: 400, y: 0 };

    clearTimeout(timerId);
    timer = 60;
    document.querySelector('#timer').innerHTML = timer;
    decreaseTimer();

    const displayText = document.querySelector('#displayText');
    displayText.style.display = 'none';
    displayText.innerHTML = '';
}
async function loadFighterData() {
  try {
    const response = await fetch('./../JS/characters.json');
    const fullData = await response.json();

    // Extract fighterGame sub-object
    const fighterData = fullData.fighterGame;

    // Pass the correct nested objects into Fighter constructor
    player = new Fighter(fighterData.player);
    enemy = new Fighter(fighterData.enemy);

    // Start animation loop ONLY after characters are created
    animate();
  } catch (error) {
    console.error("Failed to load fighter data:", error);
  }
}

loadFighterData();