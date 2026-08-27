const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// Initial Game State
let gameState = 'MENU'
let menuState = 'MAIN';

let hp = 20;
const maxHp = 20;
let spareable = false;


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

ctx.fillStyle = '#ffffff';

ctx.fillRect(
    targetBar.x - targetBar.width / 2,
    12,
    targetBar.width,
    canvas.height - 24
);

//getting main buttons

document.getElementById('btn-fight').addEventListener('click', () => {
  if (gameState === 'MENU' && menuState === 'MAIN') {
    gameState = 'ATTACK_TARGET';

    //moves attack bar to the left
    targetBar.x = 0;
  }
});

document.getElementById('btn-act')
document.getElementById('btn-item')
document.getElementById('btn-mercy')


function updateHpUI(){

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
    for(let i = bullets.length -1 ; i>=0 ; i--){
      b.x += b.vx;
      b.y += b.vy;
    }
  }
}

//diusplays them

//function to do menuselection
function handleMenuSelection() {
  if(menuState === 'ACT'){
    spareable = true;
    showTextMessage()
  }
  if(menuState === 'MERCY'){
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

//for attacks
function takeDamage(amount){

}

function executeAttack(){
  if(gameState !== 'ATTACK_TARGET') return;

  //calls hurtanimation for enemy
  gameState = 'ATTACK_ANIMATION'

  lastHitDamage = calculateDamage(targetBar.x);

  //prevents negative hp
  enemy.hp = Math.max(
    0,
    enemy.hp - lastHitDamage);

  showEnemyHpBar = true;
  setTimeout(() => {
    showEnemyHpBar = false;
    lastHitDamage = null;
  },1500)

  if (enemy.hp <= 0) {
    triggerVictory(false);
} else {
    startEnemyTurn();
}
}

//damage zones
function calculateDamage(barX){
  const center = canvas.width /2;

  const distanceFromCenter = Math.abs(barX - center);


  if (distanceFromCenter > maxDistance * 0.6){
    //0-4
    Math.floor(Math.random() * 5)
  }
  else if( distanceFromCenter > 20){
    6-14
    Math.floor(6+ Math.random() * 9)
  }
  else{
    // 15-22
    Math.floor(15 + Math.random() * 8)
  }
}

//enemy turn to attack
function startEnemyTurn(){
  gameState = 'ENEMY_TURN';

  //moves soul to center
  soul.x = canvas.width /2;
  soul.y = canvas.height/2;

  //clears pprev projectiles
  bullets = [];

  const spawner = setInterval(() => {
    if (gameState === 'ENEMY_TURN') spawnBullet();
}, 300);
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

//keybnoard mandler
window.addEventListener('keydown' , (e) =>{
  
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
      

})

function draw(){


  if (gameState === 'MENU'){
    if(menuState === 'MAIN'){

    }
    else if (menuState === 'ACT'){
      
    }
    else if (menuState === 'ITEM'){
      selectedItemIndex = (selectedItemIndex + 1) % inventory.length;
      const item = inventory.splice(selectedItemIndex, 1)[0];

      //math min prevents hpo going abov hp cap
      hp = Math.min(maxHp, hp + item.heal);

      //helps update healthbar
      updateHpUI();

    }
    else if (menuState === 'MERCY'){

      //ternary comditionm to check if player is spoareable. if yes yellow if not white
      ctx.fillStyle = spareable ? '#ffff00' : '#ffffff';
    }

  }
  else if(gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION'){
      ctx.fillStyle = '#ffffff';

      ctx.fillRect(
          targetBar.x - targetBar.width / 2,
          12,
          targetBar.width,
          canvas.height - 24
      );
  }
  else if(gameState === 'ENEMY_TURN'){


  }
  else if(gameState === 'TEXT_DISPLAY'){
    //manual text skipping
    if (textTimeout) clearTimeout(textTimeout);
    startEnemyTurn();

  }
  else if(gameState === 'VICTORY'){

  }
  else if(gameState === 'GAME_OVER'){

  }

  


  requestAnimationFrame(() => {
    update();
    draw();
  })
}

draw();