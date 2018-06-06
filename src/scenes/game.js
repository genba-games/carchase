import { range } from 'lodash'
import getRootBody from '../utils/utils'
export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' })
    }
    init() {
        var canvas = this.sys.game.canvas;
        var fullscreen = this.sys.game.device.fullscreen;
        if (!fullscreen.available) {
            return;
        }
        canvas[fullscreen.request]();
    }
    preload() {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.spritesheet('car', 'assets/car.png', { frameWidth: 12, frameHeight: 16 });
        this.load.image('ball', 'assets/pangball.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/road1.json')
        this.load.image('asphalt', 'assets/asphalt_sheet.jpeg')
        this.load.image('grass', 'assets/grass_sheet.png')
        this.load.spritesheet('tire_particle', 'assets/tire_particle.png', { frameWidth: 8, frameHeight: 8 })
        this.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 16, frameHeight: 16 })

    }

    create() {
        let menuContainer = this.add.container()
        this.move = { right: false, left: false }

        // tilemap
        let walls = ['corner_down_left', 'corner_up_left', 'corner_down_right', 'corner_up_right', 'wall_left', 'wall_right', 'wall_up', 'wall_down']
        let slow = ['grass']
        let boost = []
        let bad = []
        // let tileCollide = walls.concat(slow,boost,bad)
        let tileCollide = slow
        let map = this.add.tilemap('tilemap')
        var grass_sheet = map.addTilesetImage('grass_sheet', 'grass');
        let grassLayer = map.createStaticLayer('grass', grass_sheet);
        grassLayer.setCollisionByProperty({ type: tileCollide })
        this.matter.world.convertTilemapLayer(grassLayer);
        var asphalt_sheet = map.addTilesetImage('asphalt_sheet', 'asphalt');
        let roadLayer = map.createDynamicLayer('asphalt', asphalt_sheet, 0, 0)
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        grassLayer.forEachTile((tile) => {
            let type = tile.properties.type;
            // this code should replace the switch below

            tileCollide.forEach(wall => {
                if (wall == type) {
                    tile.physics.matterBody.body.label = 'wall'
                }
            })
        })
        // THIS BLOCK OF CODE IS NECESSARY IF WE'D LIKE TO PROGRAM INTERACTION BETWEEN BODIES.
        // Loop over all the collision pairs that start colliding on each step of the Matter engine.
        // this.matter.world.on('collisionstart', function (event) {
        //     for (var i = 0; i < event.pairs.length; i++) {
        //         // The tile bodies in this example are a mixture of compound bodies and simple rectangle
        //         // bodies. The "label" property was set on the parent body, so we will first make sure
        //         // that we have the top level body instead of a part of a larger compound body.
        //         var bodyA = getRootBody(event.pairs[i].bodyA);
        //         var bodyB = getRootBody(event.pairs[i].bodyB);
        //         if ((bodyA.label === 'car' && bodyB.label === 'wall') ||
        //             (bodyB.label === 'car' && bodyA.label === 'wall')) {
        //             const carBody = bodyA.label === 'car' ? bodyA : bodyB;
        //             const car = carBody.gameObject;

        //             // A body may collide with multiple other bodies in a step, so we'll use a flag to
        //             // only tween & destroy the ball once.
        //             // if (car.isBeingDestroyed)
        //             // {
        //             //     continue;
        //             // }
        //             // car.isBeingDestroyed = true;

        //             // this.matter.world.remove(carBody);

        //             // this.tweens.add({
        //             //     targets: car,
        //             //     alpha: { value: 0, duration: 150, ease: 'Power1' },
        //             //     onComplete: function (car) { car.destroy(); }.bind(this, car)
        //             // });
        //         }
        //     }
        // }, this);
        // UI
        let right = this.add.image(376, 104, 'arrow').setInteractive()
        let left = this.add.image(40, 104, 'arrow').setInteractive()
        left.angle = 180
        right.on('pointerdown', this.rightButton, this);
        right.on('pointerover', this.rightButton, this);
        right.on('pointerout', () => { this.move.right = false }, this);
        right.on('pointerup', () => { this.move.right = false }, this);

        left.on('pointerdown', this.leftButton, this);
        left.on('pointerover', this.leftButton, this);
        left.on('pointerout', () => { this.move.left = false }, this);
        left.on('pointerup', () => { this.move.left = false }, this);

        let fullscreen = this.add.image(16, 16, 'fullscreen').setInteractive()
        fullscreen.on('pointerover', () => {
            var canvas = this.sys.game.canvas;
            var fullscreen = this.sys.game.device.fullscreen;
            // make it a toggle
            window.fullscreenFunc = function () {
                canvas[fullscreen.request]()
            }
        }, this)
        fullscreen.on('pointerout', () => {
            window.fullscreenFunc = null
        }, this)

        menuContainer.add([right, left, fullscreen])
        menuContainer.depth = 1
        menuContainer.each(gui => {
            gui.setScrollFactor(0)
        })
        // ball
        let ball = this.matter.add.image(Phaser.Math.Between(82, 344), Phaser.Math.Between(41, 80), 'ball');
        ball.setCircle();
        ball.setFriction(0.005);
        ball.setBounce(1);
        // Player
        this.car = this.matter.add.sprite(180, 100, 'car')
        this.car.setFixedRotation();
        this.car.setFrictionAir(0.05);
        this.car.setMass(30);
        this.car.speedBase = 1.0
        this.car.speedMultiplier = this.car.speedBase
        this.car.topSpeed = 2.0
        this.car.body.label = 'car'
        this.car.body.restitution = 1
        let particles = this.add.particles('tire_particle')
        this.emitter = particles.createEmitter({
            speed: 30,
            frequency: 10,
            scale: { start: 0, end: 0.5 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: {
                "min": 300,
                "max": 400
            },
        })

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('car', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        })
        this.car.play('idle')
        this.emitter.startFollow(this.car)
        // Camera
        this.cameras.main.setSize(416, 208);
        // Sets the camera bound to the tilemap h and w, so if we change it it 
        //will change aswell
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.car)
    }

    speedMultiplierReset() {
        this.car.speedMultiplier = this.car.speedBase
    }

    rightButton(event) {
        this.move.right = true
        this.speedMultiplierReset()
    }

    leftButton(event) {
        this.move.left = true
        this.speedMultiplierReset()
    }

    // Increments the speed multiplier until it gets to the top speed.
    speedMultiplierIncrease() {
        let sm = this.car.speedMultiplier
        let ts = this.car.topSpeed
        let step = 0.1
        sm = sm < ts ? sm + step : sm
        this.car.speedMultiplier = sm
    }
    checkEmitter(object) {
        let sm = object.speedMultiplier
        let ts = object.topSpeed
        this.emitter.on = sm < ts ? true : false
    }
    update() {
        if (this.move.right) {
            this.car.angle += 5
        } else if (this.move.left) {
            this.car.angle -= 5
        } else {
            this.speedMultiplierIncrease()
            this.move.stop = true
        }
        this.car.thrustLeft(0.01 * this.car.speedMultiplier)
        this.checkEmitter(this.car)
    }
}
