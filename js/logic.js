const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = 1280
canvas.height = 768;

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const centerX = canvasWidth / 2;
const centerY = canvasHeight / 2;

const placementTilesData2D = []
for (let i = 0; i < placementTilesData.length; i += 40) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 40))
}

const placementTiles = []

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 1406) {
            placementTiles.push(new PlacementTiles({ position: { x: (x * 32) - canvasWidth / 2 + centerX, y: (y * 32) - canvasHeight / 2 + centerY } }))
        }
    })
})

const image = new Image()
image.onload = () => {
    animate()
}
image.src = './asset/map.png'

const enemies = []

function spawnEnemis(spawnCount) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffset = i * 150
        enemies.push(new Enemy({
            position: { x: (waypoints[0].x - xOffset) - canvasWidth / 2 + centerX, y: waypoints[0].y - canvasHeight / 2 + centerY }
        }))
    }
}

let enemyCount = 3
spawnEnemis(enemyCount)

const buildings = []
let activeTile = undefined
let hearts = 5
let coins = 100

function animate() {
    const animationId = requestAnimationFrame(animate)

    c.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.update()

        if (enemy.position.x > canvas.width) {
            hearts -= 1
            enemies.splice(i, 1)
            document.querySelector('#heart').innerText = hearts
            if (hearts === 0) {
                console.log("gameover");
                cancelAnimationFrame(animationId)
                document.querySelector('#gameOver').style.display = 'flex'
            }
        }
    }

    if (enemies.length === 0) {
        enemyCount += 3
        spawnEnemis(enemyCount)
    }

    placementTiles.forEach(tile => {
        tile.update(mouse)
    })
    buildings.forEach(building => {
        building.update()
        building.target = null
        const validEnemies = enemies.filter((enemy) => {
            const xDistance = enemy.center.x - building.center.x
            const yDistance = enemy.center.y - building.center.y
            const distance = Math.hypot(xDistance, yDistance)
            return distance < enemy.radius + building.radius
        })

        building.target = validEnemies[0]

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i]
            projectile.update()

            const xDifference = projectile.enemy.center.x - projectile.position.x
            const yDifference = projectile.enemy.center.y - projectile.position.y
            const distance = Math.hypot(xDifference, yDifference)

            if (distance < projectile.enemy.radius + projectile.radius) {
                projectile.enemy.health -= 20
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy
                    })
                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1)
                        coins += 25
                        document.querySelector('#coin').innerText = coins
                    }
                }

                console.log(projectile.enemy.health);
                building.projectiles.splice(i, 1)
            }
        }
    })
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let clickedTile = null;
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (
            x > tile.position.x &&
            x < tile.position.x + tile.size &&
            y > tile.position.y &&
            y < tile.position.y + tile.size
        ) {
            clickedTile = tile;
            break;
        }
    }

    if (clickedTile && !clickedTile.isOccupied && coins - 50 >= 0) {
        coins -= 50;
        document.querySelector('#coin').innerText = coins;
        buildings.push(new Building({
            position: {
                x: clickedTile.position.x,
                y: clickedTile.position.y
            }
        }));
        clickedTile.isOccupied = true;
    }
});

window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    activeTile = null;

    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (
            mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile;
            break;
        }
    }
});