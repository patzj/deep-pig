var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;
var PIG_INITIAL_POS_X = GAME_HEIGHT / 8;
var PIG_INITIAL_POS_Y = GAME_WIDTH / 2 + 14;
var DEFAULT_SCALE = 1.75;
var game = new Phaser.Game(
    GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, '', null);
var pig, sharks, jellyfishes, oxygens, torpedos, leftBound, background;
var sharkVelocity = -720;
var jellyfishVelocity = -180;
var oxygenVelocity = -360;
var torpedoVelocity = -960;
var oxygenBar;
var oxygenLevel = 100;
var distance = 0;
var distanceLabel;

var bootState = function(game) { };
bootState.prototype = {
    preload: function() {
        game.load.image('logo', 'assets/media/logo.png');
        game.load.image('sea', 'assets/media/sea.png');
        game.load.spritesheet('start-btn', 'assets/media/start-btn.png', 120, 60);
    },

    create: function() {
        game.scale.maxWidth = window.innerWidth;
        game.scale.maxHeight = Math.floor(game.scale.maxWidth / 1.333);
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.refresh();

        // background
        background = game.add.tileSprite(0, 0, 1280, 480, 'sea');

        // start button
        var logo = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'logo');
        logo.anchor.setTo(0.5, 0.5);

        var button =  game.add.button(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60,
            'start-btn', handleStart, this, null, null, 1, 0);
        button.anchor.setTo(0.5, 0.5);
    },

    update: function() {
        background.tilePosition.x -= 2;
    }
};

function handleStart() {
    game.state.start('main');
}

var gameOverState = function(game) { };
gameOverState.prototype = {
    preload: function() {
        game.load.image('sea', 'assets/media/sea.png');
        game.load.spritesheet('ok-btn', 'assets/media/ok-btn.png', 120, 60);
    },

    create: function() {
        game.scale.maxWidth = window.innerWidth;
        game.scale.maxHeight = Math.floor(game.scale.maxWidth / 1.333);
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.refresh();

        // background
        background = game.add.tileSprite(0, 0, 1280, 480, 'sea');

        var distanceFinal = game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, Math.round(distance),
        {
            fontSize: '72px',
            fill: '#eee',
            fontWeight: 'bold',
            align: 'center'
        });
        distanceFinal.anchor.setTo(0.5, 0.5);

        var button =  game.add.button(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60,
            'ok-btn', handleOK, this, null, null, 1, 0);
        button.anchor.setTo(0.5, 0.5);
    },

    update: function() {
        background.tilePosition.x -= 2;
    }
};

function handleOK() {
    game.state.start('boot');
}

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
        game.load.image('bound', 'assets/media/bound.png');
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
        background = game.add.tileSprite(0, 0, 1280, 480, 'sea');

        // pig
        pig = game.add.sprite(PIG_INITIAL_POS_X, PIG_INITIAL_POS_Y, 'pig');
        pig.scale.setTo(DEFAULT_SCALE, DEFAULT_SCALE);
        game.physics.arcade.enable(pig);
        pig.body.collideWorldBounds = true;
        pig.animations.add('move', [0, 1, 2, 3], 10, true);

        // sharks
        sharks = game.add.group();

        // jellyfishes
        jellyfishes = game.add.group();

        // oxygens
        oxygens = game.add.group();
        oxygens.enableBody = true;

        // torpedos
        torpedos = game.add.group();

        // oxygen bar
        var barConfig = {
            width: 120,
            height: 24,
            x: GAME_WIDTH / 2,
            y: 24,
            bg: { color: '#e60000' },
            bar: { color: '#00e64d' },
            animationDuration: 100
        };
        oxygenLevel = 100;
        oxygenBar = new HealthBar(game, barConfig);

        // left bound
        leftBound = game.add.sprite(1, 1, 'bound');
        leftBound.alpha = 0;
        game.physics.arcade.enable(leftBound);

        // game loops
        game.time.events.loop(1200, spawnShark, this);
        game.time.events.loop(1500, spawnShark, this);
        game.time.events.loop(2000, spawnJellyfish, this);
        game.time.events.loop(2000, spawnBubbles, this);
        game.time.events.loop(4000, spawnOxygen, this);
        game.time.events.loop(3000, spawnTorpedo, this);

        // distance
        distance = 0;
        distanceLabel = game.add.text(GAME_WIDTH / 2, 52, distance, {
            fontSize: '24px',
            fill: '#eee',
            fontWeight: 'bold',
            align: 'center'
        });
        distanceLabel.anchor.setTo(0.5, 0.5);
    },

    update: function() {
        // play pig movement animation
        pig.animations.play('move');
        background.tilePosition.x -= 2;

        // pig movement
        if(game.input.activePointer.isDown) {
            pigMove();
        } else {
            pigStop();
        }

        // overlap
        game.physics.arcade.overlap(pig, sharks, reduceOxygen, null, this);
        game.physics.arcade.overlap(pig, jellyfishes, reduceOxygen, null, this);
        game.physics.arcade.overlap(pig, torpedos, reduceOxygen, null, this);
        game.physics.arcade.overlap(pig, oxygens, addOxygen, null, this);

        // bound collision
        game.physics.arcade.overlap(
            leftBound, sharks, updateDistance, null, this);
        game.physics.arcade.overlap(
            leftBound, jellyfishes, updateDistance, null, this);
        game.physics.arcade.overlap(
            leftBound, torpedos, updateDistance, null, this);

        // game over
        if(oxygenLevel < 1) {
            game.state.start('gameOver');
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
    var yPos =
        Math.floor(Math.random() * (GAME_HEIGHT - 45 * DEFAULT_SCALE)) + 1;
    var shark = game.add.sprite(GAME_WIDTH, yPos, 'shark');
    shark.scale.setTo(DEFAULT_SCALE, DEFAULT_SCALE);
    sharks.add(shark);
    game.physics.arcade.enable(shark);
    shark.animations.add('move', [0, 1, 2, 3], 10, true);
    shark.body.velocity.x = sharkVelocity;
    shark.checkWorldBounds = true;
    shark.outOfBoundsKill = true;
    shark.animations.play('move');
}

function spawnJellyfish() {
    var yPos =
        Math.floor(Math.random() * (GAME_HEIGHT - 32)) + 1;
    var jellyfish = game.add.sprite(GAME_WIDTH, yPos, 'jellyfish');
    jellyfish.alpha = 0.9;
    jellyfish.angle = -10;
    jellyfishes.add(jellyfish);
    game.physics.arcade.enable(jellyfish);
    jellyfish.animations.add('move', [0, 1], 2, true);
    jellyfish.body.velocity.x = jellyfishVelocity;
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
    bubbles.checkWorldBounds = true;
    bubbles.outOfBoundsKill = true;
}

function spawnOxygen() {
    var yPos =
        Math.floor(Math.random() * (GAME_HEIGHT - 48 * DEFAULT_SCALE)) + 1;
    var oxygen = game.add.sprite(GAME_WIDTH, yPos, 'oxygen');
    oxygen.scale.setTo(DEFAULT_SCALE, DEFAULT_SCALE);
    oxygens.add(oxygen);
    game.physics.arcade.enable(oxygen);
    oxygen.angle = -20;
    oxygen.body.velocity.x = oxygenVelocity;
    oxygen.checkWorldBounds = true;
    oxygen.outOfBoundsKill = true;

    reduceOxygen(pig, { key: '' });
}

function spawnTorpedo() {
    var yPos =
        Math.floor(Math.random() * (GAME_HEIGHT - 32 * DEFAULT_SCALE)) + 1;
    var torpedo = game.add.sprite(GAME_WIDTH, yPos, 'torpedo');
    torpedo.scale.setTo(DEFAULT_SCALE, DEFAULT_SCALE);
    torpedos.add(torpedo);
    game.physics.arcade.enable(torpedo);
    torpedo.body.velocity.x = torpedoVelocity;
    torpedo.checkWorldBounds = true;
    torpedo.outOfBoundsKill = true;
}

function reduceOxygen(pig, obstacle) {
    var val;
    switch(obstacle.key) {
        case 'torpedo':
            val = 1;
            break;
        case 'shark':
            val = 0.75;
            break;
        case 'jellyfish':
            val = 0.5
            break
        default:
            val = 2;
    }
    oxygenLevel -= val;
    oxygenLevel = oxygenLevel < 0 ? 0 : oxygenLevel;
    oxygenBar.setPercent(oxygenLevel);
}

function addOxygen(pig, oxygen) {
    oxygen.kill();
    oxygenLevel += 10;
    oxygenLevel = oxygenLevel > 100 ? 100 : oxygenLevel;
    oxygenBar.setPercent(oxygenLevel);
}

function updateDistance(bound, obstacle) {
    distance += 0.1;
    distanceLabel.text = Math.round(distance);
}


game.state.add('boot', bootState);
game.state.add('main', mainState);
game.state.add('gameOver', gameOverState);
game.state.start('boot');
