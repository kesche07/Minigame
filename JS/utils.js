const music = document.getElementById('bg-music');
  music.volume = 0.1; // 30% volume

  // Start on first user click/tap
  window.addEventListener('click', () => {
    music.play().catch(() => {});
  }, { once: true });

function rectangularCollision({rectangle1, rectangle2}){
    return (
        rectangle1.hitbox.position.x + rectangle1.hitbox.width >= rectangle2.position.x && 
        rectangle1.hitbox.position.x <= rectangle2.position.x +rectangle2.width &&
        rectangle1.hitbox.position.y + rectangle1.hitbox.height >= rectangle2.position.y &&
        rectangle1.hitbox.position.y <= rectangle2.position.y +rectangle2.height 
    )
}

function findWinner({player, enemy, timerId}){
    clearTimeout(timerId);
    const endScreenEl = document.querySelector('#endscreen');
    
    if (endScreenEl) {
        endScreenEl.style.display = "flex";
        if(player.health === enemy.health){
            endScreenEl.innerHTML = 'Tie';
        } else if(player.health > enemy.health){
            endScreenEl.innerHTML = 'Player 1 Wins !!';
        } else {
            endScreenEl.innerHTML = 'Player 2 Wins !!';
        }
    }
}

let timer = 60
let timerId
function decreaseTimer(){
    if(timer>0){
        timerId = setTimeout(decreaseTimer, 1000)
        timer--
        document.querySelector('#timer').innerHTML = timer
        

    }
    if(timer === 0){
        findWinner({player,enemy,timerId})
    }
}

const overlay = document.getElementById('controls-overlay');

function startGame() {
  // Hide the controls overlay screen
  overlay.style.display = 'none';

  // Start the countdown timer only after the player clicks
  

  // If you have a main animation/game loop function, start it here:
  // animate(); 
}

overlay.addEventListener('click', startGame, { once: true });
overlay.addEventListener('touchstart', startGame, { once: true });

