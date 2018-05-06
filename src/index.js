import 'phaser';
import Game from './scenes/game'

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 360,
    height: 200,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Game],
    pixelArt: true
};

window.game = new Phaser.Game(config);
