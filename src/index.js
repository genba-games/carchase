import 'phaser';
import Game from './scenes/game'
import Boot from './scenes/boot'




var config = {
    type: Phaser.AUTO,
    parent: 'play',
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
    scene: [Boot,Game],
    pixelArt: true
};

window.game = new Phaser.Game(config);

window.fullscreenFunc = null;
document.querySelector('#play').addEventListener('click', function() {
    if(window.fullscreenFunc !== null) window.fullscreenFunc()
});