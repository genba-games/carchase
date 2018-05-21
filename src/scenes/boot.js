export default class Boot extends Phaser.Scene {
    constructor(){
        super({key:'Boot'})
    }
    create() {

        this.scene.start('Game')
    }

}