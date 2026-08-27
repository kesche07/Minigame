let gameState = 'MENU'

//changes game variables
function update(){

}

//diusplays them
function draw(){
  if (gameState === 'MENU'){

  }
  else if(gameState === 'ATTACK_TARGET' || gameState === 'ATTACK_ANIMATION'){

  }
  else if(gameState === 'ENEMY_TURN'){

  }
  else if(gameState === 'TEXT_DISPLAY'){

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