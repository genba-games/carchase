import {range} from 'lodash'
export default class Game extends Phaser.Scene {
    constructor() {
        super({key:'Game'})
    }
    init(){
        var canvas = this.sys.game.canvas;
        var fullscreen = this.sys.game.device.fullscreen;

        if (!fullscreen.available)
        {
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
        this.load.spritesheet('tire_particle','assets/tire_particle.png',{ frameWidth: 8, frameHeight: 8 })
        this.load.spritesheet('fullscreen','assets/fullscreen.png',{ frameWidth: 16, frameHeight: 16 })
    }

    create() {
        let menuContainer = this.add.container()
        this.move = { right: false, left: false }

        // tilemap
        this.map = this.add.tilemap('tilemap')
        var grass_sheet = this.map.addTilesetImage('grass_sheet', 'grass');
        this.backgroundLayer = this.map.createStaticLayer('grass', grass_sheet);
        var asphalt_sheet = this.map.addTilesetImage('asphalt_sheet', 'asphalt');
        this.roadLayer = this.map.createStaticLayer('asphalt', asphalt_sheet)

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
        let fullscreen = this.add.image(16,16,'fullscreen').setInteractive()
        fullscreen.on('pointerover',()=>{
            var canvas = this.sys.game.canvas;
            var fullscreen = this.sys.game.device.fullscreen;
            // make it a toggle
            window.fullscreenFunc = function() {
                canvas[fullscreen.request]()
            }
        },this)
        fullscreen.on('pointerout',()=>{
            window.fullscreenFunc=null
        },this)
        menuContainer.add([right, left, fullscreen])
        menuContainer.depth=1
        menuContainer.each(gui=>{
            gui.setScrollFactor(0)
        })
        // Player
        this.car = this.matter.add.sprite(180, 100, 'car')
        this.car.setFixedRotation();
        this.car.setFrictionAir(0.05);
        this.car.setMass(30);
        
        let particles = this.add.particles('tire_particle')
        this.emitter = particles.createEmitter({
            speed:100,
            scale:{start:0,end:1},
            alpha:{start:1,end:0},
            blendMode:'ADD',
        })
        
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
        this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
        this.cameras.main.startFollow(this.car)
    }
    rightButton(event) {
        // this.car.angle += 5
        this.move.right = true
    }
    leftButton(event) {
        // this.car.angle += 5
        this.move.left = true
    }
    update() {
        if (this.move.right) {
            this.car.angle += 5
        } else if (this.move.left) {
            this.car.angle -= 5
        } else {
            this.move.stop = true
        }
        this.car.thrustLeft(0.01)
        let angle = this.car.angle +90
        this.emitter.setAngle(range(angle-10,angle+10))
        
    }
}
