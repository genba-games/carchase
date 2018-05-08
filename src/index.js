import 'phaser';
import Game from './scenes/game'

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 416,
    height: 208,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                y: 0,
                x: 0
            }
        }
    },
    scene: [Game],
    pixelArt: true
};

window.game = new Phaser.Game(config);
