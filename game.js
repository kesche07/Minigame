const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//game screen size 16:9 ratio
canvas.width = 1024
canvas.height = 576

//creates background or working space
c.fillRect(0,0,canvas.width,canvas.height)

const gravity =.7


//instances for player and enemy
class Sprite {
    constructor({position,velocity,color, offset}){
        this.position = position
        this.velocity = velocity
        this.width = 50
        this.color = color
        this.height =  150
        this.lastKey
        this.hitbox = {
            position:{
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50
        }
        this.isAttacking
    }

    draw(){
        c.fillStyle =this.color
        c.fillRect(this.position.x,this.position.y,50,this.height)

        //attack box
        if(this.isAttacking){
        c.fillStyle ='yellow'
        c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)
    }
    }

    update(){
        this.draw()
        this.hitbox.position.x = this.position.x + this.hitbox.offset.x
        this.hitbox.position.y = this.position.y

        this.position.x  += this.velocity.x
        this.position.y += this.velocity.y

        if(this.position.y +this.height +this.velocity.y >=  canvas.height ){
            this.velocity.y = 0
        }
        else{
            this.velocity.y += gravity
        }
    }

    attack(){
            this.isAttacking = true
            setTimeout(()=>{
                this.isAttacking = false
            },100)
        }
}

//player creation
const player = new Sprite({
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
const enemy = new Sprite({
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
function rectangularCollision({rectangle1, rectangle2}){
    return (
        rectangle1.hitbox.position.x + rectangle1.hitbox.width >= rectangle2.position.x && 
        rectangle1.hitbox.position.x <= rectangle2.position.x +rectangle2.width &&
        rectangle1.hitbox.position.y + rectangle1.hitbox.height >= rectangle2.position.y &&
        rectangle1.hitbox.position.y <= rectangle2.position.y +rectangle2.height 
    )
}
//inf loop per frame for movement
function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0,0, canvas.width,canvas.height)
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
            console.log('player attack')
        }

    //enemy attacking detection
    if(rectangularCollision({
        rectangle1:enemy,
        rectangle2:player})&&
        enemy.isAttacking)
        {
            enemy.isAttacking = false
            console.log('enemy attack')
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
    () => { keys.a.pressed = true; lastKey = 'a' },
    () => { keys.a.pressed = false }
)

bindButton(
    'p-right',
    () => { keys.d.pressed = true; lastKey = 'd' },
    () => { keys.d.pressed = false }
)

bindButton(
    'p-jump',
    () => { if (player.velocity.y === 0) player.velocity.y = -10 }
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
    () => { if (enemy.velocity.y === 0) enemy.velocity.y = -10 }
)
