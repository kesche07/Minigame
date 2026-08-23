//instances for player and enemy
class Sprite {
    constructor({position, imageSrc, scale = 1, framesMax = 1, offset={x:0,y:0}}){
        this.position = position
        this.width = 50
        this.height =  150
        this.image = new Image()
        this.image.src =imageSrc
        this.scale = scale
        this.framesMax = framesMax
        this.frameCurrent= 0
        this.framesElapsed = 0
        this.framesHold = 15
        this.offset = offset
    }

    draw(){
        c.drawImage(
            this.image,

            //for cropping per frame
            this.frameCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,

            this.position.x - this.offset.x, //removes side padding
            this.position.y -this.offset.y,
            (this.image.width / this.framesMax) *this.scale,
            this.image.height *this.scale)
    }

    animateFrames(){
        this.framesElapsed++
        if(this.framesElapsed % this.framesHold === 0){
        if(this.frameCurrent < this.framesMax - 1){
            this.frameCurrent++
        }
        else{
            this.frameCurrent =0
        }
    }
    }

    update(){
        this.draw()
        this.animateFrames()
    }
}

class Fighter extends Sprite{
    constructor({position,velocity,color, offset, imageSrc, scale = 1, framesMax = 1}){
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        })
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
        offset={x:0,y:0}
        

        this.frameCurrent= 0
        this.framesElapsed = 0
        this.framesHold = 15
    }

    update(){
        this.draw()
        this.animateFrames()
        this.hitbox.position.x = this.position.x + this.hitbox.offset.x
        this.hitbox.position.y = this.position.y

        this.position.x  += this.velocity.x
        this.position.y += this.velocity.y

        if(this.position.y +this.height +this.velocity.y >=  canvas.height - 96 ){
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

