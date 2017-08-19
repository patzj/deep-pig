var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;
var PIG_INITIAL_POS_X = GAME_HEIGHT / 8;
var PIG_INITIAL_POS_Y = GAME_WIDTH / 2 + 14;
var game = new Phaser.Game(
    GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, '', null);
var pig, sharks, jellyfishes, oxygens, torpedos, background;
var sharkVelocity = -720;
var jellyfishVelocity = 180;
var oxygenVelocity = -360;
var torpedoVelocity = -960;

var mainState = function(game) { };
mainState.prototype = {
    preload: function() {
        game.load.spritesheet('pig', 'assets/media/pig.png', 48, 30);
        game.load.spritesheet('shark', 'assets/media/shark.png', 108, 45);
        game.load.spritesheet('jellyfish', 'assets/media/jellyfish.png', 32, 32);
        game.load.image('bubbles', 'assets/media/bubbles.png');
        game.load.image('oxygen', 'assets/media/oxygen.png');
        game.load.image('torpedo', 'assets/media/torpedo.png');
        game.load.image('sea', 'assets/media/sea.png');
    },

    create: function() {
        // game scaling
        game.scale.maxWidth = window.innerWidth;
        game.scale.maxHeight = Math.floor(game.scale.maxWidth / 1.333);
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.refresh();

        // physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // background
        // game.stage.backgroundColor = '#264d73';
        background = game.add.tileSprite(0, 0, 1280, 480, 'sea');

        // pig
        pig = game.add.sprite(PIG_INITIAL_POS_X, PIG_INITIAL_POS_Y, 'pig');
        game.physics.arcade.enable(pig);
        pig.body.collideWorldBounds = true;
        pig.animations.add('move', [0, 1, 2, 3], 10, true);

        // sharks
        sharks = game.add.group();

        // jellyfishes
        jellyfishes = game.add.group();

        // oxygens
        oxygens = game.add.group();

        // torpedos
        torpedos = game.add.group();

        // game loops
        game.time.events.loop(1200, spawnShark, this);
        game.time.events.loop(1500, spawnShark, this);
        // game.time.events.loop(2000, addSharkVelocity, this);
        game.time.events.loop(2000, spawnJellyfish, this);
        game.time.events.loop(2000, spawnBubbles, this);
        game.time.events.loop(4000, spawnOxygen, this);
        game.time.events.loop(3000, spawnTorpedo, this);
    },

    update: function() {
        // play pig movement animation
        pig.animations.play('move');
        background.tilePosition.x -= 2;

        if(game.input.activePointer.isDown) {
            pigMove();
        } else {
            pigStop();
        }
    }
}

function pigMove() {
    var yPos = game.input.y;
    game.physics.arcade.moveToXY(
        pig, PIG_INITIAL_POS_X, yPos, GAME_HEIGHT * 2, 100);

    if(game.input.y < pig.y) {
        pig.angle = -30;
    } else if(game.input.y > pig.y + pig.height) {
        pig.angle = 30;
    } else {
        pig.angle = 0;
    }
}

function pigStop() {
    pig.body.velocity.setTo(0, 0);
    pig.angle = 0;
}

function spawnShark() {
    var yPos = Math.floor(Math.random() * 372) + 1;
    var sharkScale = Math.random() + 0.8;
    var shark = game.add.sprite(GAME_WIDTH, yPos, 'shark');
    shark.scale.setTo(sharkScale, sharkScale);
    sharks.add(shark);
    game.physics.arcade.enable(shark);
    shark.animations.add('move', [0, 1, 2, 3], 10, true);
    shark.body.velocity.x = sharkVelocity;
    shark.checkWorldBounds = true;
    shark.outOfBoundsKill = true;
    shark.animations.play('move');
}

function addSharkVelocity() {
    sharkVelocity -= 5;
}

function spawnJellyfish() {
    var xPos = Math.floor(Math.random() * 640) + 160;
    var jellyfish = game.add.sprite(xPos, GAME_HEIGHT, 'jellyfish');
    jellyfish.alpha = 0.9;
    jellyfish.angle = -10;
    jellyfishes.add(jellyfish);
    game.physics.arcade.enable(jellyfish);
    jellyfish.animations.add('move', [0, 1], 2, true);
    game.physics.arcade.moveToXY(jellyfish, 0, 0, jellyfishVelocity);
    jellyfish.checkWorldBounds = true;
    jellyfish.outOfBoundsKill = true;
    jellyfish.animations.play('move');
}

function spawnBubbles() {
    var yPos = pig.y;
    var xPos = pig.x + pig.width;
    var bubbles = game.add.sprite(xPos, yPos, 'bubbles');
    game.physics.arcade.enable(bubbles);
    game.physics.arcade.moveToXY(bubbles, 0, 0, 360);
    bubbles.alpha = 0.3;
    bubbles.scale.setTo(0.75, 0.75);
    bubbles.checkWorldBounds = true;
    bubbles.outOfBoundsKill = true;
}

function spawnOxygen() {
    var yPos = Math.floor(Math.random() * 440) + 1;
    var oxygen = game.add.sprite(GAME_WIDTH, yPos, 'oxygen');
    oxygens.add(oxygen);
    game.physics.arcade.enable(oxygen);
    oxygen.angle = -20;
    oxygen.body.velocity.x = oxygenVelocity;
    oxygen.checkWorldBounds = true;
    oxygen.outOfBoundsKill = true;
}

function spawnTorpedo() {
    var yPos = Math.floor(Math.random() * 384) + 1;
    var torpedo = game.add.sprite(GAME_WIDTH, yPos, 'torpedo');
    torpedos.add(torpedo);
    game.physics.arcade.enable(torpedo);
    torpedo.body.velocity.x = torpedoVelocity;
    torpedo.checkWorldBounds = true;
    torpedo.outOfBoundsKill = true;
}

game.state.add('main', mainState);
game.state.start('main');
