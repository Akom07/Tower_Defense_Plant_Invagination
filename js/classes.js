class Sprite {
    constructor({ position = { x: 0, y: 0 }, imageSrc, frames = { max: 1 }, offset = { x: 0, y: 0 } }) {
        this.position = position

        this.image = new Image()
        this.image.src = imageSrc
        this.frames = {
            max: frames.max,
            current: 0,
            elapsed: 0,
            hold: 15,
        }
        this.offset = offset
    }
    draw() {
        const cropWidth = this.image.width / this.frames.max;
        const crop = {
            position: {
                x: cropWidth * this.frames.current,
                y: 0
            },
            width: cropWidth,
            height: this.image.height
        }
        c.drawImage(
            this.image,
            crop.position.x,
            crop.position.y,
            crop.width,
            crop.height,
            this.position.x,
            this.position.y + this.offset.y,
            crop.width,
            crop.height
        )
        this.frames.elapsed++
        if (this.frames.elapsed % this.frames.hold === 0) {
            this.frames.current++
            if (this.frames.current >= this.frames.max - 1) {
                this.frames.current = 0
            }
        }
    }
}

class PlacementTiles {
    constructor({ position = { x: 0, y: 0 } }) {
        this.position = position
        this.size = 32
        this.color = 'rgba(255,255,255,0.15)'
        this.isOccupied = false
    }
    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.size, this.size)
    }
    update(mouse) {
        this.draw()
        if (mouse.x > this.position.x &&
            mouse.x < this.position.x + this.size &&
            mouse.y > this.position.y &&
            mouse.y < this.position.y + this.size) {

            this.color = 'white'
        } else {
            this.color = 'rgba(255,255,255,0.15)'
        }
    }
}


class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 } }) {
        super({ position, imageSrc: './asset/Mushroom-Run.png', frames: { max: 8 } })
        this.position = position
        this.width = 50
        this.height = 50
        this.waypointindex = 0
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.radius = 25
        this.health = 100
        this.velocity = {
            x: 0,
            y: 0
        }

    }
    draw() {
        super.draw()

        //health bar
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10)
        c.fillStyle = 'green'
        c.fillRect(this.position.x, this.position.y - 15, this.width * this.health / 100, 10)

    }
    update() {
        this.draw()

        const waypoint = waypoints[this.waypointindex]
        const yDistance = waypoint.y - this.center.y
        const xDistance = waypoint.x - this.center.x
        const angle = Math.atan2(yDistance, xDistance)
        //enemy speed = mult *3
        const speed = 2

        this.velocity.x = Math.cos(angle) * speed
        this.velocity.y = Math.sin(angle) * speed
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }


        if (Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) <
            Math.abs(this.velocity.x) &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
            Math.abs(this.velocity.y) &&
            this.waypointindex < waypoints.length - 1) {
            this.waypointindex++

        }

    }
}

class Projectile extends Sprite {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
        super({ position, imageSrc: './asset/fireball.png', frames: { max: 5 } })
        this.velocity = {
            x: 0,
            y: 0
        }
        this.enemy = enemy
        this.radius = 10

    }

    update() {
        this.draw()

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y,
            this.enemy.center.x - this.position.x)

        this.velocity.x = Math.cos(angle) * 5
        this.velocity.y = Math.sin(angle) * 5

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y



    }

}





class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 } }) {
        super({
            position,
            imageSrc: './asset/tower.png',
            offset: {
                x: 0,
                y: -32
            }
        })
        this.position = position
        this.width = 32
        this.height = 32 * 2
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = []
        this.radius = 200
        this.target
        this.fireRate = 0


    }
    // draw() {
    //     c.fillStyle = 'blue'
    //     c.fillRect(this.position.x, this.position.y, this.width, 32)
    //     c.beginPath
    //     c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
    //     c.fillStyle = 'rgba(0,0,255,0.2)'
    //     c.fill()
    // }
    update() {
        this.draw()
        if (this.fireRate % 75 === 0 && this.target) {
            this.projectiles.push(
                new Projectile({
                    position: {
                        x: this.center.x,
                        y: this.center.y
                    },
                    enemy: this.target
                })
            )
        }
        this.fireRate++
    }
}
