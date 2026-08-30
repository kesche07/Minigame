const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// Initial Game State
let gameState = 'MENU'
let menuState = 'MAIN';

let hp = 20;
const maxHp = 20;
let spareable = false;

let textMessage = '';
let textTimeout = null;

let lastHitDamage = null;
let showEnemyHpBar = false;


const hpFill = document.getElementById('hp-bar-fill');
const hpText = document.getElementById('hp-text');

let inventory = [
  { name: 'Monster Candy', heal: 10 },
  { name: 'Spider Donut', heal: 12 }
];

let selectedItemIndex = 0;

const enemy = {
    name: 'Froggit',
    hp: 30,
    maxHp: 30
};

const targetBar = {
    x: 0,
    speed: 8,
    width: 12
};

const soul = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 12,
  speed: 3,
  color: 'red'
};

let bullets = [];


//getting main buttons
document.getElementById('btn-fight').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    gameState = 'ATTACK_TARGET';

    //moves attack bar to the left
    targetBar.x = 0;
  }
});

document.getElementById('btn-act').addEventListener('click', () =>
{
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

document.getElementById('btn-retry')
  .addEventListener('click', () => {
    resetGame();
  });


//updates hp bar
function updateHpUI(){
  if (hpFill) {
    hpFill.style.width =
      `${(hp / maxHp) * 100}%`;
  }

  if (hpText) {
    hpText.innerText =
      `${hp} / ${maxHp}`;
  }

}

function triggerGameOver() {
    gameState = 'GAME_OVER';
    bullets = [];

    if (textTimeout)
        clearTimeout(textTimeout);

    const gameOverScreen =
        document.getElementById('game-over-screen');

    if (gameOverScreen)
        gameOverScreen.classList.remove('hidden');
}





//tracks keys
const keys = {};

//keybnoard mandler
window.addEventListener('keydown' , (e) =>{
  if (
  gameState === 'MENU' &&
  menuState === 'ITEM' &&
  inventory.length > 0
) {

  if (e.key === 'ArrowUp' || e.key === 'w') {

    selectedItemIndex =
      (selectedItemIndex - 1 + inventory.length)
      % inventory.length;

  }

  if (e.key === 'ArrowDown' || e.key === 's') {

    selectedItemIndex =
      (selectedItemIndex + 1)
      % inventory.length;

  }
}
  
  //exits from item/act to main without affecting game state
  if (e.key === 'x' || e.key === 'X') {
    if (gameState === 'MENU' && menuState !== 'MAIN') {
        menuState = 'MAIN';
        selectedItemIndex = 0;
    }
  }

  //enter nuttom for act
  if (e.key === ' ' || e.key === 'Enter') {
      if (gameState === 'MENU' && menuState !== 'MAIN') {
          handleMenuSelection();
      }
      else if (gameState === 'ATTACK_TARGET'){
        executeAttack();
      }
  }
      
  keys[e.key] = true;
});

window.addEventListener('keyup' , (e) =>{
  
  keys[e.key] = false;
})


//function to do menu selection
function handleMenuSelection() {
  if(menuState === 'ACT'){
    spareable = true;
    showTextMessage("* You told Froggit a compliment.\n" +
  "  It didn't understand, but was flattered.")
  }

  else if(menuState === 'ITEM'){
    if(inventory.length > 0){

        const item =
          inventory.splice(selectedItemIndex, 1)[0];

        hp = Math.min(
          maxHp,
          hp + item.heal
        );

        updateHpUI();

        showTextMessage(
          `* You ate the ${item.name}.\n` +
          `  You recovered ${item.heal} HP!`
        );

      }
      else{

        showTextMessage(
          "* Your inventory is empty!"
        );

      }
    }
    else if(menuState === 'MERCY'){
      if(spareable){
        triggerVictory(true);
      }
      else{
        showTextMessage("* Froggit will not spare you just yet.")
      }
  }
}

//funtion to show any dialouge
function showTextMessage(msg){
  gameState = 'TEXT_DISPLAY';
  textMessage = msg;

  textTimeout = setTimeout(() =>{
    if (gameState === 'TEXT_DISPLAY'){
      startEnemyTurn();
    }
  },2000);
}

// ATTACK 
//damage zones
function calculateDamage(barX){
  const center = canvas.width / 2;
    const distanceFromCenter = Math.abs(barX - center);
    const maxDistance = canvas.width / 2;

    // MISS
    if (distanceFromCenter > maxDistance * 0.6) {
        return 0;
    }

    // MEDIUM HIT
    else if (distanceFromCenter > 20) {
        return Math.floor(6 + Math.random() * 9);
    }

    // PERFECT HIT
    else {
        return Math.floor(15 + Math.random() * 8);
    }
}

function executeAttack(){

  if(gameState !== 'ATTACK_TARGET') return;

  // Attack has been selected
  gameState = 'ATTACK_ANIMATION';

  // Calculate damage
  lastHitDamage = calculateDamage(targetBar.x);

  // Reduce enemy HP
  enemy.hp = Math.max(
    0,
    enemy.hp - lastHitDamage
  );

  // Show HP bar and damage
  showEnemyHpBar = true;

  // Wait before continuing
  setTimeout(() => {

    showEnemyHpBar = false;
    lastHitDamage = null;

    // NOW decide what happens next
    if (enemy.hp <= 0) {
      triggerVictory(false);
    } else {
      startEnemyTurn();
    }

  }, 1500);
}

//VICTORY hp<0
function triggerVictory(spared = false){

  gameState = 'VICTORY';

  if (textTimeout) {
    clearTimeout(textTimeout);
  }

  const enemySprite =
    document.getElementById('enemy-sprite');

  const dialogue =
    document.getElementById('dialogue-bubble');

  if (enemySprite){

    if(spared){
      enemySprite.style.opacity = '0.5';
    }
    else{
      enemySprite.classList.add('enemy-dead');
    }

  }

  if(dialogue){

    dialogue.innerText =
      spared
        ? "Ribbit (Thank you!)"
        : "GWAH...";

  }
}

// ON ENEMY TURN

//enemy turn to attack
function startEnemyTurn(){

  menuState = 'MAIN';

  //clears previous keys
  keys['ArrowUp'] = false;
  keys['ArrowDown'] = false;
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;

  keys['w'] = false;
  keys['a'] = false;
  keys['s'] = false;
  keys['d'] = false;
  gameState = 'ENEMY_TURN';

  //moves soul to center
  soul.x = canvas.width /2;
  soul.y = canvas.height/2;

  //clears pprev projectiles
  bullets = [];

  //  SPAWNS BULLETS
  const spawner = setInterval(() => {
    if (gameState === 'ENEMY_TURN') spawnBullet();
  }, 300);

  //makes enemy turn only last 6 seconds, clears any bullets
  setTimeout(() => {
    clearInterval(spawner);
    bullets = [];
    if (gameState === 'ENEMY_TURN') {
      gameState = 'MENU';
    }
  }, 6000);
}

//for attacks
function takeDamage(amount){
  hp = Math.max(0, hp - amount);

  updateHpUI();

  if (hp <= 0 && gameState !== 'GAME_OVER') {
    triggerGameOver();
  }
}









function spawnBullet(){
  bullets.push({
    x: Math.random() * (canvas.width - 20) + 10,
    y:0,
    vx: (Math.random() - 0.5) *2,
    vy: 2 + Math.random() *2,
    radius : 5
  })
}

function checkCollision(bullet,soul){

  //checks hitbox of soul
  const soulLeft = soul.x - soul.size / 2;
  const soulRight = soul.x + soul.size / 2;
  const soulTop = soul.y - soul.size / 2;
  const soulBottom = soul.y + soul.size / 2;

  //returns true if bullet overlaps
  return (
    bullet.x + bullet.radius > soulLeft &&
    bullet.x - bullet.radius < soulRight &&
    bullet.y + bullet.radius > soulTop &&
    bullet.y - bullet.radius < soulBottom
  );
}

//changes game variables
function update(){

  //updates player attack
  if(gameState === 'ATTACK_TARGET'){

    targetBar.x += targetBar.speed;
    if (targetBar.x > canvas.width) {
        executeAttack();
    }
  }

  if(gameState === 'ENEMY_TURN'){
    

    //tracking player movements
    if (keys['ArrowUp'] || keys['w'])
    soul.y -= soul.speed;
    if (keys['ArrowDown'] || keys['s'])
    soul.y += soul.speed;
    if (keys['ArrowLeft'] || keys['a'])
    soul.x -= soul.speed;
    if (keys['ArrowRight'] || keys['d'])
    soul.x += soul.speed;

    //preventing soul from going out of boundaries
    soul.x = Math.max(
    soul.size / 2,
    Math.min(canvas.width - soul.size / 2, soul.x));

    soul.y = Math.max(
    soul.size / 2,
    Math.min(canvas.height - soul.size / 2, soul.y));
  
    for(let i = bullets.length -1 ; i>=0 ; i--){
     
      const b = bullets[i];

      b.x += b.vx;
      b.y += b.vy;


      //checks if bullets hit the player
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

function resetGame(){
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

  gameState = 'MENU';
  menuState = 'MAIN';

  bullets = [];

  updateHpUI();

  const gameOverScreen =
      document.getElementById('game-over-screen');

  if (gameOverScreen) {
      gameOverScreen.classList.add('hidden');
  }
}








function draw(){

  //clears canvas at every state change
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (gameState === 'MENU'){
      if(menuState === 'MAIN'){
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Courier New';

        ctx.fillText(
          `* ${enemy.name} draws near!`,
          30,
          50
        );
      }
        else if (menuState === 'ACT'){
        ctx.fillStyle = '#ffffff';
      ctx.font = '20px Courier New';

      ctx.fillText(
        '* Flatter',
        50,
        50
      );

      }
      else if (menuState === 'ITEM'){

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Courier New';

        inventory.forEach((item, index) => {

          const y = 50 + index * 30;

          if(index === selectedItemIndex){
            ctx.fillStyle = '#ff0000';

            ctx.fillRect(
              30,
              y - 12,
              12,
              12
            );

            ctx.fillStyle = '#ffff00';

          } else {
            ctx.fillStyle = '#ffffff';
          }

          ctx.fillText(
            `* ${item.name}`,
            50,
            y
          );

        });
      }
      else if (menuState === 'MERCY'){

        //ternary comditionm to check if player is spoareable. if yes yellow if not white
        ctx.fillStyle =
        spareable ? '#ffff00' : '#ffffff';

        ctx.font = '20px Courier New';

        ctx.fillText(
          '* Spare',
          50,
          50
        );

    }

    }
    else if(gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION'){
    
      //white attack box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;

      ctx.strokeRect(
        10,
        10,
        canvas.width - 20,
        canvas.height - 20
      );

      //green central zone
      ctx.fillStyle = '#00ff00';

      ctx.fillRect(
        canvas.width / 2 - 10,
        10,
        20,
        canvas.height - 20
      );
    
      //moving bar
    ctx.fillStyle = '#ffffff';

    ctx.fillRect(
      targetBar.x - targetBar.width / 2,
      12,
      targetBar.width,
      canvas.height - 24
    );
    //attack box
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;

    //center
    ctx.strokeRect(
      10,
      10,
      canvas.width - 20,
      canvas.height - 20
    );

    

    //showing enemy health bar
    if (showEnemyHpBar) {

    const barWidth = 200;
    const barHeight = 16;

    const barX =
      (canvas.width - barWidth) / 2;

    const barY = 40;

    // Red background
    ctx.fillStyle = '#ff0000';

    ctx.fillRect(
      barX,
      barY,
      barWidth,
      barHeight
    );

    // Green HP
    ctx.fillStyle = '#00ff00';

    ctx.fillRect(
      barX,
      barY,
      (enemy.hp / enemy.maxHp) * barWidth,
      barHeight
    );

    // Damage
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 22px Courier New';

    const damageText =
      lastHitDamage > 0
        ? `${lastHitDamage}`
        : 'MISS';

    ctx.fillText(
      damageText,
      canvas.width / 2 - 15,
      barY - 10
    );
  }
  }
  else if(gameState === 'ENEMY_TURN'){
    // Soul
    ctx.fillStyle = soul.color;

    ctx.fillRect(
      soul.x - soul.size / 2,
      soul.y - soul.size / 2,
      soul.size,
      soul.size
    );

    // Bullets
    ctx.fillStyle = '#ffffff';

    bullets.forEach((b) => {

      ctx.beginPath();

      ctx.arc(
        b.x,
        b.y,
        b.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

    });

  }
  else if(gameState === 'TEXT_DISPLAY'){
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Courier New';

    const lines = textMessage.split('\n');

    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        30,
        50 + index * 25
      );
    });

  }
  else if(gameState === 'VICTORY'){
    ctx.fillStyle = '#ffff00';
    ctx.font = '20px Courier New';

    ctx.fillText(
      '* YOU WON!',
      30,
      50
    );
  }
  else if(gameState === 'GAME_OVER'){

  }


  requestAnimationFrame(() => {
    update();
    draw();
  });
}

draw();