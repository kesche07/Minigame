function rectangularCollision({rectangle1, rectangle2}){
    return (
        rectangle1.hitbox.position.x + rectangle1.hitbox.width >= rectangle2.position.x && 
        rectangle1.hitbox.position.x <= rectangle2.position.x +rectangle2.width &&
        rectangle1.hitbox.position.y + rectangle1.hitbox.height >= rectangle2.position.y &&
        rectangle1.hitbox.position.y <= rectangle2.position.y +rectangle2.height 
    )
}

function findWinner({player,enemy,timerId}){
    clearTimeout(timerId)
    document.querySelector('#endscreen').style.display = "flex"
    if(player.health === enemy.health){
            document.querySelector('#endscreen').innerHTML = 'Tie'
        }
        else if(player.health >enemy.health){
            document.querySelector('#endscreen').innerHTML = 'Player 1 Wins !!'
        }
        else{
            document.querySelector('#endscreen').innerHTML = 'Player 2 Wins !!'
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