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
        this.load.tilemapTiledJSON('tilemap', 'assets/road1.json')
        this.load.image('asphalt', 'assets/asphalt_sheet.png')
        this.load.image('grass', 'assets/grass_sheet.png')
        this.load.spritesheet('tire_particle', 'assets/tire_particle.png', { frameWidth: 8, frameHeight: 8 })
        this.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 16, frameHeight: 16 })
    }

    create() {
        let menuContainer = this.add.container()
        this.move = { right: false, left: false }

        // tilemap
        let walls=['bottom_left_corner','top_left_corner','bottom_right_corner','top_right_corner','left_wall','right_wall','top_wall','bottom_wall']
        let map = this.add.tilemap('tilemap')
        var grass_sheet = map.addTilesetImage('grass_sheet', 'grass');
        let backgroundLayer = map.createStaticLayer('grass', grass_sheet);
        var asphalt_sheet = map.addTilesetImage('asphalt_sheet', 'asphalt');
        let roadLayer = map.createDynamicLayer('asphalt', asphalt_sheet,0,0)
        roadLayer.setCollisionByProperty({ type: walls })
        this.matter.world.setBounds(0,0,map.widthInPixels, map.heightInPixels);
        this.matter.world.convertTilemapLayer(roadLayer);
        roadLayer.forEachTile((tile) => {
            let type = tile.properties.type;
            if (type === 'bottom_left_corner') {
                tile.physics.matterBody.body.label = 'wall';
            } else if (type === 'top_left_corner') {
                tile.physics.matterBody.body.label = type;
            }else if (type === 'bottom_right_corner') {
                tile.physics.matterBody.body.label = type;
            }else if (type === 'top_right_corner') {
                tile.physics.matterBody.body.label = type;
            }else if (type === 'left_wall') {
                tile.physics.matterBody.body.label = type;
            }else if(type === 'right_wall'){
                tile.physics.matterBody.body.label = type;
            }else if (type === 'top_wall') {
                tile.physics.matterBody.body.label = 'wall';
            }else if (type === 'bottom_wall') {
                tile.physics.matterBody.body.label = type;
            }
        })
        // Loop over all the collision pairs that start colliding on each step of the Matter engine.
        this.matter.world.on('collisionstart', function (event) {
            for (var i = 0; i < event.pairs.length; i++)
            {
                // The tile bodies in this example are a mixture of compound bodies and simple rectangle
                // bodies. The "label" property was set on the parent body, so we will first make sure
                // that we have the top level body instead of a part of a larger compound body.
                var bodyA = getRootBody(event.pairs[i].bodyA);
                var bodyB = getRootBody(event.pairs[i].bodyB);
                console.log(bodyA)
                console.log(bodyB)
                if ((bodyA.label === 'car' && bodyB.label === 'wall') ||
                    (bodyB.label === 'car' && bodyA.label === 'wall'))
                {
                    const ballBody = bodyA.label === 'ball' ? bodyA : bodyB;
                    const ball = ballBody.gameObject;
                
                    // A body may collide with multiple other bodies in a step, so we'll use a flag to
                    // only tween & destroy the ball once.
                    if (ball.isBeingDestroyed)
                    {
                        continue;
                    }
                    ball.isBeingDestroyed = true;
                
                    this.matter.world.remove(ballBody);
                
                    this.tweens.add({
                        targets: ball,
                        alpha: { value: 0, duration: 150, ease: 'Power1' },
                        onComplete: function (ball) { ball.destroy(); }.bind(this, ball)
                    });
                }
            }
        }, this);
        // UI
        let right = this.add.image(376, 104, 'arrow').setInteractive()
        let left = this.add.image(40, 104, 'arrow').setInteractive()
        left.angle = 180
        right.on('pointerdown', () => { this.move.right = true }, this);
        right.on('pointerover', () => { this.move.right = true }, this);
        right.on('pointerout', () => { this.move.right = false }, this);
        right.on('pointerup', () => { this.move.right = false }, this);

        left.on('pointerdown', () => { this.move.left = true }, this);
        left.on('pointerover', () => { this.move.left = true }, this);
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
        // Player
        this.car = this.matter.add.sprite(180, 100, 'car')
        this.car.setFixedRotation();
        this.car.setFrictionAir(0.05);
        this.car.setMass(30);
        this.car.speedBase = 1.0
        this.car.speedMultiplier = this.car.speedBase
        this.car.topSpeed = 2.0
        this.car.body.label='car'

        let particles = this.add.particles('tire_particle')
        this.emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 0, end: 1 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
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
        let angle = this.car.angle + 90
        this.emitter.setAngle(range(angle - 10, angle + 10))

    }
}
