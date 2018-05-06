export default class Game extends Phaser.Scene {
    constructor() {
        super('game')
    }

    preload() {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.spritesheet('car', 'assets/car.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.move = { right: false, left: false }
        let menuContainer = this.add.container()
        let right = this.add.image(320, 100, 'arrow').setInteractive()
        let left = this.add.image(40, 100, 'arrow').setInteractive()
        left.angle = 180
        right.on('pointerdown', this.rightButton,this);
        left.on('pointerdown', this.leftButton,this);
        menuContainer.add([right, left])
        this.car = this.add.sprite(200, 100, 'car')

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('car', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 1
        })

    }
    rightButton(event) {
        this.move.right = true
    }
    leftButton(event) {
        this.move.left = true
    }
    update() {
        if (this.move.right) {
            this.car.x = this.car.x + 16
            this.move.right = false
        }
        if (this.move.left) {
            this.car.x = this.car.x - 16
            this.move.left = false
        }

    }
}
