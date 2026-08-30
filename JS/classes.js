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

//game1 class
class Fighter extends Sprite{
    constructor({position,
        velocity,
        color,
        offset, 
        imageSrc,
        scale = 1,
        framesMax = 1,
        sprites,
        hitbox =  {
            offset: {
            },
            width: NaN,
            height:NaN
        }

        }){
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
            offset: hitbox.offset,
            width:hitbox.width,
            height: hitbox.height
        }
        this.isAttacking
        this.health = 100
        this.dead = false

        offset={x:0,y:0}
        this.sprites = sprites

        this.frameCurrent= 0
        this.framesElapsed = 0
        this.framesHold = 15

        this.jumps = 0

        for(const sprite in sprites){
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc

        }
    }

    update(){
        this.draw()
        if(!this.dead){
            this.animateFrames()
        }
        this.hitbox.position.x = this.position.x + this.hitbox.offset.x
        this.hitbox.position.y = this.position.y   + this.hitbox.offset.y

        //c.fillStyle = 'rgba(0, 0, 0, 0.5)'
        //c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)

        this.position.x  += this.velocity.x
        this.position.y += this.velocity.y

        if(this.position.y +this.height +this.velocity.y >=  canvas.height - 96 ){
            this.velocity.y = 0
            this.position.y =330
            this.jumps = 0
        }
        else{
            this.velocity.y += gravity
        }
    }

    attack(){
        this.switchSprite('attack1')
        this.isAttacking = true
            //setTimeout(()=>{
            //    this.isAttacking = false
            //},1000)
        }

    takeHit(){
        this.health -= 20
        if(this.health<=0){
            this.switchSprite('death')
        }
        else{
            this.switchSprite('takehit')
        }
    }

    switchSprite(sprite){

        //ovverriding animations when:
        //attacking
        if(this.image === this.sprites.attack1.image && 
            this.frameCurrent < this.sprites.attack1.framesMax -1)
            return

        //taking a hit
        if(this.image === this.sprites.takehit.image && 
            this.frameCurrent < this.sprites.takehit.framesMax -1)
            return

        //death
        if(this.image === this.sprites.death.image ){
            if(this.frameCurrent === this.sprites.death.framesMax -1)
                this.dead=true
            return
        }
        switch(sprite){
            case 'idle':
                if(this.image !== this.sprites.idle.image){
                    this.image = this.sprites.idle.image
                    this.framesMax = this.sprites.idle.framesMax
                    this.frameCurrent = 0
            }
                break;
            case 'run':
                if(this.image !== this.sprites.run.image){
                    this.image = this.sprites.run.image
                    this.framesMax = this.sprites.run.framesMax
                    this.frameCurrent = 0
                }
                break;
            case 'jump':
                if(this.image !== this.sprites.jump.image){
                    this.image = this.sprites.jump.image
                    this.framesMax = this.sprites.jump.framesMax
                    this.frameCurrent = 0
                }
                break
            case 'fall':
                if(this.image !== this.sprites.fall.image){
                    this.image = this.sprites.fall.image
                    this.framesMax = this.sprites.fall.framesMax
                    this.frameCurrent = 0
                }
            break
            case 'attack1':
                if(this.image !== this.sprites.attack1.image){
                    this.image = this.sprites.attack1.image
                    this.framesMax = this.sprites.attack1.framesMax
                    this.frameCurrent = 0
                }
            break
            case 'takehit':
                if(this.image !== this.sprites.takehit.image){
                    this.image = this.sprites.takehit.image
                    this.framesMax = this.sprites.takehit.framesMax
                    this.frameCurrent = 0
                }
            break
            case 'death':
                if(this.image !== this.sprites.death.image){
                    this.image = this.sprites.death.image
                    this.framesMax = this.sprites.death.framesMax
                    this.frameCurrent = 0
                }
            break
        }
    }
}


//game2 class
class Enemy extends Sprite {
    constructor({
        position,
        offset = { x: 0, y: 0 }, 
        imageSrc,
        scale = 1,
        framesMax = 1,
        sprites
    }){
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        })

        this.isAttacking = false
        this.health = 100
        this.dead = false
        this.sprites = sprites

        this.frameCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 15

        // Preload all enemy animation sheets
        for (const sprite in sprites) {
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc
        }
    }

    update(){
        this.draw()
        if (!this.dead) {
            this.animateFrames()
        }
    }

    takeHit(){
        this.health -= 20
        if (this.health <= 0) {
            this.switchSprite('death')
        } else {
            this.switchSprite('takehit')
        }
    }

    switchSprite(sprite){
        // Safe animation override checks
        if (this.sprites.takehit && this.image === this.sprites.takehit.image && 
            this.frameCurrent < this.sprites.takehit.framesMax - 1)
            return

        if (this.sprites.death && this.image === this.sprites.death.image) {
            if (this.frameCurrent === this.sprites.death.framesMax - 1)
                this.dead = true
            return
        }

        switch(sprite){
            case 'idle':
                if (this.sprites.idle && this.image !== this.sprites.idle.image) {
                    this.image = this.sprites.idle.image
                    this.framesMax = this.sprites.idle.framesMax
                    this.frameCurrent = 0
                }
                break

            case 'talking':
                if (this.sprites.talking && this.image !== this.sprites.talking.image) {
                    this.image = this.sprites.talking.image
                    this.framesMax = this.sprites.talking.framesMax
                    this.frameCurrent = 0
                }
                break

            case 'takehit':
                if (this.sprites.takehit && this.image !== this.sprites.takehit.image) {
                    this.image = this.sprites.takehit.image
                    this.framesMax = this.sprites.takehit.framesMax
                    this.frameCurrent = 0
                }
                break

            case 'death':
                if (this.sprites.death && this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image
                    this.framesMax = this.sprites.death.framesMax
                    this.frameCurrent = 0
                }
                break
        }
    }
}

class Player extends Sprite {
  constructor(config) {
    super(config);
    this.hp = 20;
    this.maxHp = 20;
    this.speed = 3;
    this.size = 12;
  }

  move(keys, canvasWidth, canvasHeight) {
    if (keys['ArrowUp'] || keys['w']) this.position.y -= this.speed;
    if (keys['ArrowDown'] || keys['s']) this.position.y += this.speed;
    if (keys['ArrowLeft'] || keys['a']) this.position.x -= this.speed;
    if (keys['ArrowRight'] || keys['d']) this.position.x += this.speed;

    const half = this.size / 2;
    this.position.x = Math.max(half, Math.min(canvasWidth - half, this.position.x));
    this.position.y = Math.max(half, Math.min(canvasHeight - half, this.position.y));
  }
}