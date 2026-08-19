const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//game screen size 16:9 ratio
canvas.width = 1024
canvas.height = 576

//creates background or working space
c.fillRect(0,0,canvas.width,canvas.height)

const gravity =.2


//instances for player and enemy
class Sprite {
    constructor({position,velocity}){
        this.position = position
        this.velocity = velocity;
        this.height =  150
    }

    draw(){
        c.fillStyle ='blue'
        c.fillRect(this.position.x,this.position.y,50,this.height)
    }

    update(){
        this.draw()
        this.position.y += this.velocity.y

        if(this.position.y +this.height +this.velocity.y >=  canvas.height ){
            this.velocity.y = 0
        }
        else{
            this.velocity.y += gravity
        }
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
   }
})
enemy.draw()

//inf loop per frame for movement
function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0,0, canvas.width,canvas.height)
    player.update()
    enemy.update()
    
}

animate()