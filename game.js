const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//game screen size 16:9 ratio
canvas.width = 1024
canvas.height = 576

//creates background or working space
c.fillRect(0,0,canvas.width,canvas.height)

const gravity =.7


//Sprite creations

//bg creation
const background = new Sprite({
    position: {
        x:0,
        y:0
    },
    imageSrc: './Assets/background.png',
})

//shop
const shop = new Sprite({
    position: {
        x:640,
        y:135
    },
    imageSrc: './Assets/shop.png',
    scale:2.7,
    framesMax:6
})

//player creation
const player = new Fighter({
   position:{
    x: 0,
    y: 0
   }
   ,
   velocity: {
    x:0,
    y:0
   },
   color: 'red',
   offset: {
    x:0,
    y:0
   }
})



//enemy creation
const enemy = new Fighter({
    position:{
    x: 400,
    y: 100
   }
   ,
   velocity: {
    x:0,
    y:0
   },
   color: 'blue',
   offset: {
    x:-50,
    y:0
   }
})
enemy.draw()

const keys = {
    a:
    {
        pressed:false
    },
    d:
    {
        pressed:false
    },
    w:
    {
       pressed:false 
    },
    ArrowLeft:
    {
        pressed:false
    },
    ArrowRight:
    {
        pressed:false
    },
    ArrowUp:
    {
       pressed:false 
    }

}


decreaseTimer()

//inf loop per frame for movement
function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0,0, canvas.width,canvas.height)
    
    background.update()
    shop.update()

    player.update()
    enemy.update()

    //player
    player.velocity.x = 0

    if (keys.a.pressed && player.lastKey==='a'){
        player.velocity.x=-5
    }
    else if (keys.d.pressed && player.lastKey==='d'){
        player.velocity.x=5
    }

    //enemy
    enemy.velocity.x = 0
    if (keys.ArrowLeft.pressed && enemy.lastKey==='ArrowLeft'){
        enemy.velocity.x=-5
    }
    else if (keys.ArrowRight.pressed && enemy.lastKey==='ArrowRight'){
        enemy.velocity.x=5
    }
    
    //if player is attacking detection
    if(rectangularCollision({
        rectangle1:player,
        rectangle2:enemy})&&
        player.isAttacking)
        {
            player.isAttacking = false
            enemy.health -= 20
            document.querySelector('#enemyhealth').style.width= enemy.health + '%'
        }

    //enemy attacking detection
    if(rectangularCollision({
        rectangle1:enemy,
        rectangle2:player})&&
        enemy.isAttacking)
        {
            enemy.isAttacking = false
            player.health -= 20
            document.querySelector('#playerhealth').style.width= player.health + '%'
        }
    
    //endgame based on health

    if(enemy.health <= 0 || player.health <= 0){
        findWinner({player,enemy,timerId})
    }

}

    
        
    

animate()


window.addEventListener('keydown', (event) =>{
    switch (event.key.toLowerCase()){

        //player controls
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break 
        case 'a':
            keys.a.pressed = true
            player.lastKey ='a'
            break 

        case 'w':
            player.velocity.y = -20
            break 
        
        case 's':
            player.attack()
            break

    }

    //enemy
    switch (event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break 
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey ='ArrowLeft'
            break 

        case 'ArrowUp':
            enemy.velocity.y = -20
            break 
        case 'ArrowDown':
            enemy.attack()
            break
    }
})

window.addEventListener('keyup', (event) =>{
    switch (event.key.toLowerCase()){

        //player
        case 'd':
            keys.d.pressed = false
            break 
        case 'a':
            keys.a.pressed = false
            break 
        case 'w':
            keys.w.pressed = false
            break 
    }
        //enemy
    switch (event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break 
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break 
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break 
    }
})



//  {#bcb,59}
//for buttons WIP
//WIP
// Helper function to handle button press/release states
function bindButton(buttonId, onPress, onRelease) {
    const btn = document.getElementById(buttonId)
    if (!btn) return

    // Trigger movement on press
    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault() // Prevents zooming/scrolling on mobile
        onPress()
    })

    // Stop movement on release (or when finger/mouse leaves the button)
    btn.addEventListener('pointerup', (e) => {
        e.preventDefault()
        if (onRelease) onRelease()
    })
    btn.addEventListener('pointerleave', (e) => {
        e.preventDefault()
        if (onRelease) onRelease()
    })
}

// Bind Player Buttons
bindButton(
    'p-left',
    () => { keys.a.pressed = true; player.lastKey = 'a' },
    () => { keys.a.pressed = false }
)

bindButton(
    'p-right',
    () => { keys.d.pressed = true; player.lastKey = 'd' },
    () => { keys.d.pressed = false }
)

bindButton(
    'p-jump',
    () => { if (player.velocity.y === 0) player.velocity.y = -20 }
)

// Bind Enemy Buttons
bindButton(
    'e-left',
    () => { keys.ArrowLeft.pressed = true; enemy.lastKey = 'ArrowLeft' },
    () => { keys.ArrowLeft.pressed = false }
)

bindButton(
    'e-right',
    () => { keys.ArrowRight.pressed = true; enemy.lastKey = 'ArrowRight' },
    () => { keys.ArrowRight.pressed = false }
)

bindButton(
    'e-jump',
    () => { if (enemy.velocity.y === 0) enemy.velocity.y = -20 }
)
