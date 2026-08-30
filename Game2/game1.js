const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// --- Game State ---
let gameState = 'MENU'; 
let menuState = 'MAIN';
let textMessage = '';
let textTimeout = null;

let hp = 20;
const maxHp = 20;
let spareable = false;
let selectedItemIndex = 0;

// Dynamic Hit Tracking
let lastHitDamage = null;
let showEnemyHpBar = false;

// Player Inventory
let inventory = [
  { name: 'Monster Candy', heal: 10 },
  { name: 'Spider Donut', heal: 12 }
];

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
  if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyX'].includes(e.code)) {
    e.preventDefault();
  }

  if (gameState === 'MENU' && menuState === 'ITEM' && inventory.length > 0) {
    if (e.key === 'ArrowUp' || e.key === 'w') {
      selectedItemIndex = (selectedItemIndex - 1 + inventory.length) % inventory.length;
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      selectedItemIndex = (selectedItemIndex + 1) % inventory.length;
    }
  }

  if (e.key === 'x' || e.key === 'X') {
    if (gameState === 'MENU' && menuState !== 'MAIN') {
      menuState = 'MAIN';
      selectedItemIndex = 0;
    }
  }

  if (e.key === ' ' || e.key === 'Enter') {
    if (gameState === 'ATTACK_TARGET') {
      executeAttack();
    } else if (gameState === 'MENU' && menuState !== 'MAIN') {
      handleMenuSelection();
    } else if (gameState === 'TEXT_DISPLAY') {
      if (textTimeout) clearTimeout(textTimeout);
      startEnemyTurn();
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

// --- MENU BUTTON LISTENERS ---
document.getElementById('btn-fight').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    gameState = 'ATTACK_TARGET';
    targetBar.x = 0;
  }
});

document.getElementById('btn-act').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    menuState = 'ACT';
  }
});

document.getElementById('btn-item').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    menuState = 'ITEM';
    selectedItemIndex = 0;
  }
});

document.getElementById('btn-mercy').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    menuState = 'MERCY';
  }
});

function handleMenuSelection() {
  if (menuState === 'ACT') {
    spareable = true;
    showTextMessage("* You told Froggit a compliment.\n  It didn't understand, but was flattered.");
  } 
  else if (menuState === 'ITEM') {
    if (inventory.length > 0) {
      const item = inventory.splice(selectedItemIndex, 1)[0];
      hp = Math.min(maxHp, hp + item.heal);
      takeDamage(0);

      if (selectedItemIndex >= inventory.length && inventory.length > 0) {
        selectedItemIndex = inventory.length - 1;
      }

      showTextMessage(`* You ate the ${item.name}.\n  You recovered ${item.heal} HP!`);
    } else {
      showTextMessage("* Your inventory is empty!");
    }
  } 
  else if (menuState === 'MERCY') {
    if (spareable) {
      triggerVictory(true);
    } else {
      showTextMessage("* Froggit's name is not yellow yet!");
    }
  }
}

function showTextMessage(msg) {
  gameState = 'TEXT_DISPLAY';
  textMessage = msg;
  menuState = 'MAIN';

  if (textTimeout) clearTimeout(textTimeout);

  textTimeout = setTimeout(() => {
    if (gameState === 'TEXT_DISPLAY') {
      startEnemyTurn();
    }
  }, 2500);
}

// --- CALCULATE DAMAGE BASED ON DISTANCE TO CENTER ---
function calculateDamage(barX) {
  const center = canvas.width / 2;
  const distanceFromCenter = Math.abs(barX - center);
  const maxDistance = canvas.width / 2;

  // Outer zone: Miss or weak hit (1-5 damage)
  if (distanceFromCenter > maxDistance * 0.6) {
    return Math.floor(Math.random() * 5); // 0 to 4
  } 
  // Mid zone: Medium hit (6-14 damage)
  else if (distanceFromCenter > 20) {
    return Math.floor(6 + Math.random() * 9); // 6 to 14
  } 
  // Perfect center: High critical damage (15-22 damage)
  else {
    return Math.floor(15 + Math.random() * 8); // 15 to 22
  }
}

// --- UPDATED ATTACK EXECUTION WITH CANVAS HP BAR ---
function executeAttack() {
  if (gameState !== 'ATTACK_TARGET') return;
  
  gameState = 'ATTACK_ANIMATION';
  lastHitDamage = calculateDamage(targetBar.x);
  enemy.hp = Math.max(0, enemy.hp - lastHitDamage);
  showEnemyHpBar = true;

  // Keep HP bar and damage text visible on canvas for 1.5 seconds
  setTimeout(() => {
    showEnemyHpBar = false;
    lastHitDamage = null;

    if (enemy.hp <= 0) {
      triggerVictory(false);
    } else {
      startEnemyTurn();
    }
  }, 1500);
}

function startEnemyTurn() {
  if (textTimeout) clearTimeout(textTimeout);
  gameState = 'ENEMY_TURN';
  menuState = 'MAIN';
  soul.x = canvas.width / 2;
  soul.y = canvas.height / 2;
  bullets = [];

  const spawner = setInterval(() => {
    if (gameState === 'ENEMY_TURN') spawnBullet();
  }, 300);

  setTimeout(() => {
    clearInterval(spawner);
    bullets = [];
    if (gameState === 'ENEMY_TURN') {
      gameState = 'MENU';
    }
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
  const hpFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-text');
  
  if (hpFill) hpFill.style.width = `${(hp / maxHp) * 100}%`;
  if (hpText) hpText.innerText = `${hp} / ${maxHp}`;

  if (hp <= 0 && gameState !== 'GAME_OVER') {
    triggerGameOver();
  }
}

function triggerGameOver() {
  gameState = 'GAME_OVER';
  bullets = [];
  if (textTimeout) clearTimeout(textTimeout);

  const gameOverScreen = document.getElementById('game-over-screen');
  if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

function triggerVictory(spared = false) {
  gameState = 'VICTORY';
  if (textTimeout) clearTimeout(textTimeout);
  
  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');
  
  if (enemySprite) {
    if (spared) enemySprite.style.opacity = '0.5';
    else enemySprite.classList.add('enemy-dead');
  }
  
  if (dialogue) {
    dialogue.innerText = spared ? "Ribbit (Thank you!)" : "GWAH...";
    setTimeout(() => { dialogue.style.display = 'none'; }, 1500);
  }
}

function resetGame() {
  if (textTimeout) clearTimeout(textTimeout);
  hp = maxHp;
  enemy.hp = enemy.maxHp;
  spareable = false;
  selectedItemIndex = 0;
  showEnemyHpBar = false;
  lastHitDamage = null;
  
  inventory = [
    { name: 'Monster Candy', heal: 10 },
    { name: 'Spider Donut', heal: 12 }
  ];
  
  takeDamage(0);
  
  const gameOverScreen = document.getElementById('game-over-screen');
  const enemySprite = document.getElementById('enemy-sprite');
  const dialogue = document.getElementById('dialogue-bubble');
  
  if (gameOverScreen) gameOverScreen.classList.add('hidden');
  
  if (enemySprite) {
    enemySprite.classList.remove('enemy-dead');
    enemySprite.style.opacity = '1';
  }
  
  if (dialogue) {
    dialogue.style.display = 'block';
    dialogue.innerText = "Ribbit, ribbit...";
  }

  gameState = 'MENU';
  menuState = 'MAIN';
}

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

// --- RENDERING ROUTINE WITH ENEMY HP DISPLAY ---
function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'MENU') {
    ctx.font = '20px Courier New';

    if (menuState === 'MAIN') {
      ctx.fillStyle = '#fff';
      ctx.fillText(`* ${enemy.name} draws near!`, 30, 50);
    } 
    else if (menuState === 'ACT') {
      ctx.fillStyle = '#fff';
      ctx.fillText('* Flatter', 50, 50);
      ctx.font = '14px Courier New';
      ctx.fillText('[ Press Space / Enter to Select, X to Cancel ]', 50, 115);
    } 
    else if (menuState === 'ITEM') {
      if (inventory.length > 0) {
        inventory.forEach((item, index) => {
          const yPos = 50 + (index * 30);

          if (index === selectedItemIndex) {
            ctx.fillStyle = soul.color;
            ctx.fillRect(30, yPos - 12, soul.size, soul.size);
            ctx.fillStyle = '#ffff00';
          } else {
            ctx.fillStyle = '#ffffff';
          }

          ctx.font = '20px Courier New';
          ctx.fillText(`* ${item.name}`, 50, yPos);
        });
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillText('* Empty', 50, 50);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Courier New';
      ctx.fillText('[ Up/Down: Select | Space: Eat | X: Cancel ]', 50, 120);
    } 
    else if (menuState === 'MERCY') {
      ctx.fillStyle = spareable ? '#ffff00' : '#ffffff';
      ctx.fillText('* Spare', 50, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Courier New';
      ctx.fillText('[ Press Space / Enter to Spare, X to Cancel ]', 50, 115);
    }

  } else if (gameState === 'TEXT_DISPLAY') {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    
    const lines = textMessage.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 30, 50 + (index * 25));
    });

  } else if (gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION') {
    
    //ctx.fillStyle = '#ffffff';
    //ctx.fillRect(targetBar.x - targetBar.width / 2, 12, targetBar.width, canvas.height - 24);


    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(canvas.width / 2 - 10, 10, 20, canvas.height - 20);

    
    // Render Enemy HP Bar and Damage Overlay directly on Canvas
    if (showEnemyHpBar) {
      const barWidth = 200;
      const barHeight = 16;
      const barX = (canvas.width - barWidth) / 2;
      const barY = 40;

      // Background Bar (Red)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Remaining HP (Green)
      const currentBarWidth = (enemy.hp / enemy.maxHp) * barWidth;
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(barX, barY, currentBarWidth, barHeight);

      // Damage Text Output
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 22px Courier New';
      const displayText = lastHitDamage > 0 ? `${lastHitDamage}` : 'MISS';
      ctx.fillText(displayText, canvas.width / 2 - 15, barY - 10);
    }

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