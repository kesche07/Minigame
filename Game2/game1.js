const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// --- Game State ---
// States: 'MENU', 'ITEM_MENU', 'ATTACK_TARGET', 'ATTACK_ANIMATION', 'ENEMY_TURN', 'VICTORY', 'GAME_OVER'
let gameState = 'MENU'; 
let hp = 20;
const maxHp = 20;

// --- Enemy Stats ---
const enemy = {
  name: 'Froggit',
  hp: 30,
  maxHp: 30,
  canBeSpared: false // Refuses spare by default
};

// --- Inventory System ---
let selectedItemIndex = 0;
const inventory = [
  { name: 'Monster Candy', heal: 10 },
  { name: 'Spider Donut', heal: 12 },
  { name: 'Butterscotch Pie', heal: 20 }
];

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
  if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }

  // Action on Attack Bar
  if ((e.key === ' ' || e.key === 'Enter') && gameState === 'ATTACK_TARGET') {
    executeAttack();
  }

  // Navigation & Selection inside ITEM sub-menu
  if (gameState === 'ITEM_MENU') {
    if (e.key === 'ArrowDown') {
      selectedItemIndex = (selectedItemIndex + 1) % inventory.length;
    } else if (e.key === 'ArrowUp') {
      selectedItemIndex = (selectedItemIndex - 1 + inventory.length) % inventory.length;
    } else if (e.key === ' ' || e.key === 'Enter') {
      useItem(selectedItemIndex);
    } else if (e.key === 'Escape' || e.key === 'x') {
      gameState = 'MENU';
    }
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

// --- BUTTON LISTENERS ---

// 1. FIGHT Button
document.getElementById('btn-fight').addEventListener('click', () => {
  if (gameState === 'MENU') {
    gameState = 'ATTACK_TARGET';
    targetBar.x = 0;
  }
});

// 2. ITEM Button
document.getElementById('btn-item').addEventListener('click', () => {
  if (gameState === 'MENU') {
    gameState = 'ITEM_MENU';
    selectedItemIndex = 0;
  }
});

// 3. MERCY Button (Refusal Logic)
document.getElementById('btn-mercy').addEventListener('click', () => {
  if (gameState === 'MENU') {
    executeMercy();
  }
});

// --- ACTION LOGIC ---

// Item Consumption
function useItem(index) {
  if (inventory.length === 0) return;

  const item = inventory[index];
  const oldHp = hp;
  hp = Math.min(maxHp, hp + item.heal);
  const healedAmount = hp - oldHp;

  // Update UI
  document.getElementById('hp-bar-fill').style.width = `${(hp / maxHp) * 100}%`;
  document.getElementById('hp-text').innerText = `${hp} / ${maxHp}`;

  inventory.splice(index, 1);

  // Show action message, then proceed to enemy turn
  gameState = 'ATTACK_ANIMATION';
  renderMessage(`* You ate the ${item.name}.`, `* Recovered ${healedAmount} HP!`);

  setTimeout(() => {
    startEnemyTurn();
  }, 1500);
}

// Mercy Attempt
function executeMercy() {
  if (enemy.canBeSpared) {
    triggerVictory();
  } else {
    gameState = 'ATTACK_ANIMATION';
    const dialogue = document.getElementById('dialogue-bubble');
    if (dialogue) dialogue.innerText = "No way!";

    renderMessage(`* You tried to Spare ${enemy.name}.`, `* But its name was not in YELLOW...`);

    setTimeout(() => {
      startEnemyTurn();
    }, 1500);
  }
}

// Attack Execution
function executeAttack() {
  gameState = 'ATTACK_ANIMATION';

  const center = canvas.width / 2;
  const distanceFromCenter = Math.abs(targetBar.x - center);
  const maxDistance = canvas.width / 2;

  let accuracy = Math.max(0, 1 - (distanceFromCenter / maxDistance));
  let damage = Math.floor(accuracy * 15);
  if (distanceFromCenter < 15) damage = 20;

  enemy.hp = Math.max(0, enemy.hp - damage);

  const hpContainer = document.getElementById('enemy-hp-container');
  const hpFill = document.getElementById('enemy-hp-fill');
  const damageText = document.getElementById('damage-text');

  if (hpContainer && hpFill && damageText) {
    hpContainer.classList.remove('hidden');
    damageText.innerText = damage > 0 ? damage : 'MISS';
    hpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  }

  setTimeout(() => {
    if (hpContainer) hpContainer.classList.add('hidden');

    if (enemy.hp <= 0) {
      triggerVictory();
    } else {
      startEnemyTurn();
    }
  }, 1500);
}

// Helper to draw text box messages during transitions
function renderMessage(line1, line2 = '') {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '20px Courier New';
  ctx.fillText(line1, 30, 50);
  if (line2) ctx.fillText(line2, 30, 80);
}

// --- ENEMY TURN & FLOW CONTROL ---

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
    if (gameState === 'ENEMY_TURN') gameState = 'MENU';
  }, 6000);
}

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

  if (hp <= 0 && gameState !== 'GAME_OVER') {
    triggerGameOver();
  }
}

function triggerGameOver() {
  gameState = 'GAME_OVER';
  bullets = [];
  const gameOverScreen = document.getElementById('game-over-screen');
  if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

function triggerVictory() {
  gameState = 'VICTORY';
  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');

  if (enemySprite) enemySprite.classList.add('enemy-dead');
  if (dialogue) dialogue.innerText = "GWAH...";

  setTimeout(() => {
    if (dialogue) dialogue.style.display = 'none';
  }, 1500);
}

function resetGame() {
  hp = maxHp;
  enemy.hp = enemy.maxHp;
  takeDamage(0);

  document.getElementById('enemy-hp-fill').style.width = '100%';
  const gameOverScreen = document.getElementById('game-over-screen');
  if (gameOverScreen) gameOverScreen.classList.add('hidden');

  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');
  if (enemySprite) enemySprite.classList.remove('enemy-dead');
  if (dialogue) {
    dialogue.style.display = 'block';
    dialogue.innerText = "Ribbit, ribbit...";
  }

  gameState = 'MENU';
}

// --- UPDATE & RENDER LOOPS ---

function update() {
  if (gameState === 'ATTACK_TARGET') {
    targetBar.x += targetBar.speed;
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'MENU') {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.fillText(`* ${enemy.name} draws near!`, 30, 50);

  } else if (gameState === 'ITEM_MENU') {
    ctx.font = '20px Courier New';

    if (inventory.length === 0) {
      ctx.fillStyle = '#fff';
      ctx.fillText('* Inventory is empty!', 30, 50);
    } else {
      inventory.forEach((item, index) => {
        const yPos = 50 + index * 30;
        if (index === selectedItemIndex) {
          ctx.fillStyle = 'red';
          ctx.fillText('♥', 30, yPos);
          ctx.fillStyle = '#ffff00';
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillText(`* ${item.name}`, 55, yPos);
      });
    }

  } else if (gameState === 'ATTACK_TARGET') {
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
    ctx.fillStyle = '#ffff00';
    ctx.font = '20px Courier New';
    ctx.fillText('* YOU WON!', 30, 50);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`* You earned 0 EXP and 10 gold.`, 30, 80);
  }

  requestAnimationFrame(() => {
    update();
    draw();
  });
}

// Start Engine
draw();