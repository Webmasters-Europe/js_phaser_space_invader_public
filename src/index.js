const config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
}

const game = new Phaser.Game(config)
let physics

let player
let gameOver = false
let aKey
let dKey
let spacebar
let bullet
let enemies
let time = 0
let enemyStep = 20
let enemyCount = 55
let walls
let missiles
let scoreText
let score = 0
let lives = 3
let lifeText

function preload() {
	this.load.image('background', 'assets/images/space.jpeg')
	this.load.image('player', 'assets/images/Ship.png')
	this.load.image('bullet', 'assets/images/Bullet.png')
	this.load.image('enemyTop1', 'assets/images/InvaderA1.png')
	this.load.image('enemyTop2', 'assets/images/InvaderA2.png')
	this.load.image('enemyMiddle1', 'assets/images/InvaderB1.png')
	this.load.image('enemyMiddle2', 'assets/images/InvaderB2.png')
	this.load.image('enemyBottom1', 'assets/images/InvaderC1.png')
	this.load.image('enemyBottom2', 'assets/images/InvaderC2.png')
	this.load.image('block', 'assets/images/OkBlock.png')
	this.load.image('blockHit', 'assets/images/WeakBlock.png')
}

function create() {
	setPhysics(this.physics)
	this.add.image(0, 0, 'background').setOrigin(0, 0).setScrollFactor(0)
	scoreText = this.add.text(16, 16, 'Score: ' + score, { fontSize: '32px' }).setScrollFactor(0)
	lifeText = this.add.text(1100, 16, 'Lives: ' + lives, { fontSize: '32px' }).setScrollFactor(0)

	this.anims.create({
		key: 'moveEnemyTop',
		frames: [{ key: 'enemyTop2' }, { key: 'enemyTop1' }],
		frameRate: 2,
		repeat: -1,
	})

	this.anims.create({
		key: 'moveEnemyMiddle',
		frames: [{ key: 'enemyMiddle2' }, { key: 'enemyMiddle1' }],
		frameRate: 2,
		repeat: -1,
	})

	this.anims.create({
		key: 'moveEnemyBottom',
		frames: [{ key: 'enemyBottom2' }, { key: 'enemyBottom1' }],
		frameRate: 2,
		repeat: -1,
	})

	createHouses()
	createPlayer()
	missiles = this.physics.add.group()
	createEnemies()
	createKeys(this.input.keyboard)
	createBullet()

	this.physics.add.collider(player, enemies, () => pauseGame())

	this.physics.add.collider(enemies, bullet, (enemy, bullet) => handleHitEnemy(enemy, bullet))

	this.physics.add.collider(bullet, walls, (bullet, wall) => handleHitWall(bullet, wall))

	this.physics.add.collider(missiles, walls, (missile, wall) => handleHitWall(missile, wall))

	this.physics.add.collider(player, missiles, (player, missile) => handleHitPlayer(player, missile))
}

function update() {
	if (gameOver) {
		return
	}
	time += 1 // extra auf deltaTime verzichtet, da nicht im Kurs vorgestellt
	checkMovement()
	checkShoot()
	checkBullet()
	checkEnemyMovement()
}

function setPhysics(physic) {
	physics = physic
}

function createHouses() {
	walls = physics.add.staticGroup()
	createHouseAt(127)
	createHouseAt(419)
	createHouseAt(711)
	createHouseAt(1003)
	walls.children.iterate(wall => {
		wall.new = true
	})
}

function createHouseAt(x, y = 600) {
	walls.create(x, y, 'block')
	walls.create(x + 30, y, 'block')
	walls.create(x, y - 20, 'block')
	walls.create(x + 30, y - 20, 'block')
	walls.create(x + 30, y - 40, 'block')

	walls.create(x + 60, y - 40, 'block')
	walls.create(x + 90, y - 40, 'block')
	walls.create(x + 60, y - 60, 'block')
	walls.create(x + 90, y - 60, 'block')

	walls.create(x + 120, y, 'block')
	walls.create(x + 150, y, 'block')
	walls.create(x + 120, y - 20, 'block')
	walls.create(x + 150, y - 20, 'block')
	walls.create(x + 120, y - 40, 'block')
}

function createPlayer() {
	player = physics.add.sprite(640, 650, 'player')
	player.setDepth(10)
}

function createEnemies() {
	enemies = physics.add.group()
	Array(55)
		.fill()
		.forEach((_, i) => {
			let enemy
			if (i < 11) {
				enemy = enemies.create(calculeteEnemySpawnX(i), calculeteEnemySpawnY(i), 'enemyTop1')
				enemy.anims.play('moveEnemyTop')
				return
			}
			if (i < 33) {
				enemy = enemies.create(calculeteEnemySpawnX(i), calculeteEnemySpawnY(i), 'enemyMiddle1')
				enemy.anims.play('moveEnemyMiddle')
				return
			}
			enemy = enemies.create(calculeteEnemySpawnX(i), calculeteEnemySpawnY(i), 'enemyBottom1')
			enemy.anims.play('moveEnemyBottom')
		})
}

function calculeteEnemySpawnY(idx) {
	return 100 + 50 * Math.floor(idx / 11)
}

function calculeteEnemySpawnX(idx) {
	return 80 * (idx + 1) - 80 * 11 * Math.floor(idx / 11)
}

function createKeys(keyboard) {
	aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, true, true)
	dKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, true, true)
	spacebar = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
}

function createBullet() {
	bullet = physics.add.sprite(0, 0, 'bullet')
	bullet.disableBody(true, true)
}

function checkMovement() {
	if (aKey.isDown && !dKey.isDown) {
		player.x > 30 ? player.setVelocityX(-300) : player.setVelocityX(0)
	}
	if (dKey.isDown && !aKey.isDown) {
		player.x < 1250 ? player.setVelocityX(300) : player.setVelocityX(0)
	}
	if (!aKey.isDown && !dKey.isDown) {
		player.setVelocityX(0)
	}
}

function checkShoot() {
	if (spacebar.isDown && !bullet.active) {
		bullet.x = player.x
		bullet.y = player.y
		bullet.enableBody(true, bullet.x, bullet.y, true, true)
		bullet.setVelocityY(-500)
	}
}

function checkBullet() {
	if (bullet.active && bullet.y < 0) {
		bullet.disableBody(true, true)
	}
}

function checkEnemyMovement() {
	if (time % 30 !== 0) return
	if (time % (30 * 18) === 0) {
		enemyStep *= -1
		enemies.children.iterate(enemy => {
			enemy.y += 50
			enemy.y === player.y ? pauseGame() : null
		})
	}

	enemies.children.iterate(enemy => {
		enemy.x += enemyStep
		if (Phaser.Math.Between(0, 70) === Phaser.Math.Between(0, 70)) {
			launchMissile(enemy.x, enemy.y)
		}
	})
}

function pauseGame() {
	physics.pause()
	gameOver = true
	enemies.children.iterate(enemy => enemy.anims.stop())
}

function launchMissile(x, y) {
	let bullet
	missiles.children.iterate(missile => {
		if (!missile.active) {
			bullet = missile
		}
	})
	if (bullet) {
		bullet.x = x
		bullet.y = y
		bullet.enableBody(true, bullet.x, bullet.y, true, true)
		bullet.setVelocityY(500)
	} else {
		let missile = missiles.create(x, y, 'bullet')
		missile.setVelocityY(500)
	}
}

function checkMissiles() {
	missiles.children.iterate(missile => {
		if (missile.active && missile.y > 720) {
			missile.disableBody(true, true)
		}
	})
}

function handleHitEnemy(enemy, bullet) {
	enemy.disableBody(true, true)
	bullet.disableBody(true, true)
	enemyCount -= 1
	score += 10
	scoreText.setText('Score: ' + score)
	if (enemyCount === 0) pauseGame()
}

function handleHitWall(bullet, wall) {
	bullet.disableBody(true, true)
	if (wall.new) {
		wall.setTexture('blockHit')
		wall.new = false
	} else {
		wall.disableBody(true, true)
	}
}

function handleHitPlayer(player, missile) {
	missile.disableBody(true, true)
	player.setVelocityY(0)
	lifeText.setText('Lives: ' + --lives)
	if (lives === 0) pauseGame()
}
