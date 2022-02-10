const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// canvas

canvas.width = innerWidth
canvas.height = innerHeight

// canvas setup

const scoreEl = document.querySelector("#score")

// score div

const endDiv = document.querySelector(".end-div")
const totalScore = document.querySelector(".total-score")
const startBtn = document.querySelector("#start-btn")

// game over div

class Player {
	constructor(color) {
		this.position = {
			x: 100,
			y: 100
		}

		this.speed = 5

		this.color = color

		this.width = 30
		this.height = 30
	}

	draw() {
		c.fillStyle = this.color
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}

	update() {
		this.draw()

		if (keys.up.pressed && this.position.y > 0) {
			this.position.y -= this.speed
		} else if (keys.down.pressed && this.position.y + this.height < canvas.height) {
			this.position.y += this.speed
		} else if (keys.left.pressed && this.position.x > 0) {
			this.position.x -= this.speed
		} else if (keys.right.pressed && this.position.x + this.width < canvas.width) {
			this.position.x += this.speed
		}
	}
}

// player class


class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}

	update() {
		this.draw()
		this.x += this.velocity.x
		this.y += this.velocity.y
	}
}

// projectile class


class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}

	update() {
		this.draw()
		this.x += this.velocity.x
		this.y += this.velocity.y
	}
}

// enemy class


class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha = 1
	}

	draw() {
		c.save()
		c.globalAlpha = this.alpha
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
		c.restore()
	}

	update() {
		this.draw()
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.alpha -= 0.01
	}
}

// particle class


const keys = {
	up: { pressed: false },
	down: { pressed: false },
	left: { pressed: false },
	right: { pressed: false }
}

// keys

const magazine = 3

let player = new Player("#5261f8")
let projectiles = []
let enemies = []
let particles = []

// setup variables

function init() {
	player = new Player("#5261f8")
	projectiles = []
	enemies = []
	particles = []
	score = 0
	scoreEl.innerHTML = score
	totalScore.innerHTML = score
}

// init function

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 10) + 10

		let x
		let y

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width - radius
			y = Math.random() * canvas.height
		} else {
			y = Math.random() < 0.5 ? 0 - radius : canvas.width - radius
			x = Math.random() * canvas.width
		}
		
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`

		const angle = Math.atan2((player.position.y + (player.height / 2)) - y, (player.position.x + (player.width / 2)) - x)

		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}

		enemies.push(new Enemy(x, y, radius, color, velocity))
	}, 500)
}

// spawn enemies


let gameId
let score = 0

// game variables

function gameLoop() {
	gameId = requestAnimationFrame(gameLoop)

	// game id

	c.fillStyle = "rgba(0,0,0,0.1)"
	c.fillRect(0, 0, canvas.width, canvas.height)

	// canvas clear & background color

	player.update()

	// player update

	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1)

			// particle remove on fade
		} else {
			particle.update()

			// particle update
		}
	})

	// particles loop

	projectiles.forEach((projectile, index) => {
		projectile.update()

		// projectile update

		if (projectile.x - projectile.radius < 0 || 
			projectile.x + projectile.radius > canvas.width ||
			projectile.y - projectile.radius < 0 ||
			projectile.y + projectile.radius > canvas.height) {
			setTimeout(() => {
				projectiles.splice(index, 1)
			}, 0)
		}

		// projectile out-of-bound check
	})

	// projectiles loop
	
	enemies.forEach((enemy, eIndex) => {
		enemy.update()

		// enemy update

		const dist = Math.hypot(player.position.x - enemy.x, player.position.y - enemy.y)

		// enemy distance from player
		
		if (dist - enemy.radius - ((player.height / 2) * 1.414) < 0 - player.height / 2.22) {
			cancelAnimationFrame(gameId)
			endDiv.style.display = 'flex'
			totalScore.innerHTML = score
		}

		//  enemy collision with player check

		projectiles.forEach((projectile, pIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

			// projectile distance from enemy

			if (dist - enemy.radius - projectile.radius < 1) {
				// projectile collision with enemy

				score += 100
				scoreEl.innerHTML = score

				// score add

				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
						x: (Math.random() - 0.5) * (Math.random() * 6),
						y: (Math.random() - 0.5) * (Math.random() * 6)
					}))
				}

				// particles create loop

				if (enemy.radius - 10 > 10) {
					// enemy radius check

					gsap.to(enemy, { radius: enemy.radius - 10 })
					// enemy radius reduce animation
					
					setTimeout(() => {
						projectiles.splice(pIndex, 1)
						// particle removal
					}, 0)
				} else {
					setTimeout(() => {
						enemies.splice(eIndex, 1)
						projectiles.splice(pIndex, 1)
					}, 0)
					// enemy & projectile removal
				}
			}
		})

		// projectiles loop inside enemy loop

		if (enemy.x - enemy.radius < 0 ||
			enemy.x + enemy.radius > canvas.width ||
			enemy.y - enemy.radius < 0 ||
			enemy.y + enemy.radius > canvas.height) {
			setTimeout(() => {
				enemies.splice(eIndex, 1)
				// enemy removal
			}, 0)
		}

		// enemy out-of-bound check
	})

	// enemy loop
}

// game loop


addEventListener('click', ({clientX, clientY}) => {
	if (magazine > projectiles.length) {
		const angle = Math.atan2(clientY - (player.position.y + (player.height / 2)), clientX - (player.position.x + (player.width / 2)))
	
		const velocity = {
			x: Math.cos(angle) * 5,
			y: Math.sin(angle) * 5
		}

		projectiles.push(new Projectile(player.position.x + (player.width / 2), player.position.y + (player.height / 2), 5, 'red', velocity))
	}
})

// click event


addEventListener('keydown', ({keyCode}) => {
	switch (keyCode) {
		case 68: // D
			keys.right.pressed = true
			return
		case 83: // S
			keys.down.pressed = true
			return
		case 65: // A
			keys.left.pressed = true
			return
		case 87: // W
			keys.up.pressed = true
			return
	}
})

// keydown event

addEventListener('keyup', ({keyCode}) => {
	switch (keyCode) {
		case 68: // D
			keys.right.pressed = false
			return
		case 83: // S
			keys.down.pressed = false
			return

		case 65: // A
			keys.left.pressed = false
			return
		case 87: // W
			keys.up.pressed = false
			return
	}
})

// keyup event

startBtn.addEventListener('click', () => {
	endDiv.style.display = 'none'
	init()
	gameLoop()
	spawnEnemies()
})

// game over button click event