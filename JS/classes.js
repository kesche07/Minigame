//instances for player and enemy
class Fighter {
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
        this.health = 100
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

class Sprite {
    constructor({position}){
        this.position = position
        this.width = 50
        this.height =  150
    }

    draw(){
        
    }

    update(){
        this.draw()
    }
}