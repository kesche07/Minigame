const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// --- Game State ---
// States: 'MENU', 'ATTACK_TARGET', 'ATTACK_ANIMATION', 'ENEMY_TURN'
let gameState = 'MENU'; 
let hp = 20;
const maxHp = 20;

// --- Enemy Stats ---
const enemy = {
  name: 'Froggit',
  hp: 30,
  maxHp: 30
};

// --- Attack Mechanics ---
const targetBar = {
  x: 0,
  speed: 8,
  width: 12
};

// --- Soul (Player) Object ---
const soul = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 12,
  speed: 3,
  color: 'red'
};

// --- Input Tracking ---
const keys = {};
window.addEventListener('keydown', (e) => {
  // Prevent page scroll on Space/Arrow keys
  if (['Space', 'Enter', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
    e.preventDefault();
  }

  // Trigger Action on Attack Bar
  if ((e.key === ' ' || e.key === 'Enter') && gameState === 'ATTACK_TARGET') {
    executeAttack();
  }

  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => keys[e.key] = false);

// --- Bullets System ---
let bullets = [];

function spawnBullet() {
  bullets.push({
    x: Math.random() * (canvas.width - 20) + 10,
    y: 0,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 2,
    radius: 5
  });
}

// --- FIGHT FLOW ---

// 1. Player clicks FIGHT
document.getElementById('btn-fight').addEventListener('click', () => {
  if (gameState === 'MENU') {
    gameState = 'ATTACK_TARGET';
    targetBar.x = 0; // Reset bar position to the left side
  }
});

// 2. Player hits Space / Enter on the Target Bar
function executeAttack() {
  gameState = 'ATTACK_ANIMATION';

  const center = canvas.width / 2;
  const distanceFromCenter = Math.abs(targetBar.x - center);
  const maxDistance = canvas.width / 2;

  // Calculate damage: perfect hit center = ~12-15 dmg, edge = low dmg
  let accuracy = 1 - (distanceFromCenter / maxDistance);
  accuracy = Math.max(0, accuracy); // Clamp lower bound to 0

  let damage = Math.floor(accuracy * 15);
  if (distanceFromCenter < 15) damage = 20; // Critical Hit bonus!

  enemy.hp = Math.max(0, enemy.hp - damage);

  // Update & Show Enemy HP UI
  const hpContainer = document.getElementById('enemy-hp-container');
  const hpFill = document.getElementById('enemy-hp-fill');
  const damageText = document.getElementById('damage-text');

  hpContainer.classList.remove('hidden');
  damageText.innerText = damage > 0 ? damage : 'MISS';
  hpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;

  // Wait 1.5s to show damage, then proceed to Enemy's turn
  setTimeout(() => {
    hpContainer.classList.add('hidden');
    startEnemyTurn();
  }, 1500);
}

// 3. Enemy Turn Loop
function startEnemyTurn() {
  gameState = 'ENEMY_TURN';
  soul.x = canvas.width / 2;
  soul.y = canvas.height / 2;
  bullets = [];

  const spawner = setInterval(() => {
    if (gameState === 'ENEMY_TURN') spawnBullet();
  }, 300);

  setTimeout(() => {
    clearInterval(spawner);
    bullets = [];
    gameState = 'MENU';
  }, 6000);
}

// --- Collision Logic ---
function checkCollision(bullet, soul) {
  const soulLeft = soul.x - soul.size / 2;
  const soulRight = soul.x + soul.size / 2;
  const soulTop = soul.y - soul.size / 2;
  const soulBottom = soul.y + soul.size / 2;

  return (
    bullet.x + bullet.radius > soulLeft &&
    bullet.x - bullet.radius < soulRight &&
    bullet.y + bullet.radius > soulTop &&
    bullet.y - bullet.radius < soulBottom
  );
}

function takeDamage(amount) {
  hp = Math.max(0, hp - amount);
  document.getElementById('hp-bar-fill').style.width = `${(hp / maxHp) * 100}%`;
  document.getElementById('hp-text').innerText = `${hp} / ${maxHp}`;
}

// --- Game Logic Update ---
function update() {
  if (gameState === 'ATTACK_TARGET') {
    // Move the timing bar horizontally across the canvas
    targetBar.x += targetBar.speed;

    // If it reaches the right edge without input, count as a miss
    if (targetBar.x > canvas.width) {
      executeAttack();
    }
  }

  if (gameState === 'ENEMY_TURN') {
    if (keys['ArrowUp'] || keys['w']) soul.y -= soul.speed;
    if (keys['ArrowDown'] || keys['s']) soul.y += soul.speed;
    if (keys['ArrowLeft'] || keys['a']) soul.x -= soul.speed;
    if (keys['ArrowRight'] || keys['d']) soul.x += soul.speed;

    soul.x = Math.max(soul.size / 2, Math.min(canvas.width - soul.size / 2, soul.x));
    soul.y = Math.max(soul.size / 2, Math.min(canvas.height - soul.size / 2, soul.y));

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      if (checkCollision(b, soul)) {
        takeDamage(5);
        bullets.splice(i, 1);
        continue;
      }

      if (b.y > canvas.height || b.x < 0 || b.x > canvas.width) {
        bullets.splice(i, 1);
      }
    }
  }
}

// --- Game Render Loop ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'MENU') {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.fillText(`* ${enemy.name} draws near!`, 30, 50);

  } else if (gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION') {
    // 1. Draw Target Reticle Background (Elongated oval shape)
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // 2. Center Bullseye Zone
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(canvas.width / 2 - 10, 10, 20, canvas.height - 20);

    // 3. Draw Moving Bar Cursor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(targetBar.x - targetBar.width / 2, 12, targetBar.width, canvas.height - 24);

  } else if (gameState === 'ENEMY_TURN') {
    // Draw Player Heart
    ctx.fillStyle = soul.color;
    ctx.fillRect(soul.x - soul.size / 2, soul.y - soul.size / 2, soul.size, soul.size);

    // Draw Bullets
    ctx.fillStyle = '#fff';
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  requestAnimationFrame(() => {
    update();
    draw();
  });
}

// Start Engine
draw();
// Add 'GAME_OVER' and 'VICTORY' to your possible gameState values

// --- Modify takeDamage Function ---
function takeDamage(amount) {
  hp = Math.max(0, hp - amount);
  document.getElementById('hp-bar-fill').style.width = `${(hp / maxHp) * 100}%`;
  document.getElementById('hp-text').innerText = `${hp} / ${maxHp}`;

  // CHECK GAME OVER CONDITION
  if (hp <= 0 && gameState !== 'GAME_OVER') {
    triggerGameOver();
  }
}

// --- GAME OVER SEQUENCE ---
function triggerGameOver() {
  gameState = 'GAME_OVER';
  bullets = []; // Clear active attacks

  // Show Game Over UI
  const gameOverScreen = document.getElementById('game-over-screen');
  gameOverScreen.classList.remove('hidden');
}

// --- Modify executeAttack (Victory Check) ---
function executeAttack() {
  gameState = 'ATTACK_ANIMATION';

  const center = canvas.width / 2;
  const distanceFromCenter = Math.abs(targetBar.x - center);
  const maxDistance = canvas.width / 2;

  let accuracy = Math.max(0, 1 - (distanceFromCenter / maxDistance));
  let damage = Math.floor(accuracy * 15);
  if (distanceFromCenter < 15) damage = 20;

  enemy.hp = Math.max(0, enemy.hp - damage);

  // Update UI
  const hpContainer = document.getElementById('enemy-hp-container');
  const hpFill = document.getElementById('enemy-hp-fill');
  const damageText = document.getElementById('damage-text');

  hpContainer.classList.remove('hidden');
  damageText.innerText = damage > 0 ? damage : 'MISS';
  hpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;

  // CHECK VICTORY CONDITION
  setTimeout(() => {
    hpContainer.classList.add('hidden');

    if (enemy.hp <= 0) {
      triggerVictory();
    } else {
      startEnemyTurn();
    }
  }, 1500);
}

// --- VICTORY SEQUENCE ---
function triggerVictory() {
  gameState = 'VICTORY';
  
  // 1. Fade out the enemy sprite
  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');
  
  enemySprite.classList.add('enemy-dead');
  dialogue.innerText = "GWAH...";

  // 2. Clear canvas text to show victory message after fade
  setTimeout(() => {
    dialogue.style.display = 'none';
  }, 1500);
}

// --- RESET / RESTART GAME ---
function resetGame() {
  // Reset Stats
  hp = maxHp;
  enemy.hp = enemy.maxHp;
  
  // Reset UI
  takeDamage(0); // Refresh HP bar
  document.getElementById('enemy-hp-fill').style.width = '100%';
  document.getElementById('game-over-screen').classList.add('hidden');
  
  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');
  enemySprite.classList.remove('enemy-dead');
  dialogue.style.display = 'block';
  dialogue.innerText = "Ribbit, ribbit...";

  // Reset State
  gameState = 'MENU';
}

// --- Modify Draw Loop ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'MENU') {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.fillText(`* ${enemy.name} draws near!`, 30, 50);

  } else if (gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION') {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(canvas.width / 2 - 10, 10, 20, canvas.height - 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(targetBar.x - targetBar.width / 2, 12, targetBar.width, canvas.height - 24);

  } else if (gameState === 'ENEMY_TURN') {
    ctx.fillStyle = soul.color;
    ctx.fillRect(soul.x - soul.size / 2, soul.y - soul.size / 2, soul.size, soul.size);

    ctx.fillStyle = '#fff';
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (gameState === 'VICTORY') {
    // Render Victory Message inside canvas box
    ctx.fillStyle = '#ffff00';
    ctx.font = '20px Courier New';
    ctx.fillText('* YOU WON!', 30, 50);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`* You earned 0 EXP and 10 gold.`, 30, 80);

  } else if (gameState === 'GAME_OVER') {
    // Keep canvas empty during game over overlay
  }

  requestAnimationFrame(() => {
    update();
    draw();
  });
}