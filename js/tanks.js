var myId=0;

var land;

var shadow;
var tank;
var turret;
var player;
var tanksList;
var explosions;

var logo;


var cursors;

var bullets;
var fireRate = 100;
// var nextFire = 0;

var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();

	eurecaClient.ready(function (proxy) {
		eurecaServer = proxy;
	});


	//methods defined under "exports" namespace become available in the server side

	eurecaClient.exports.setId = function(id) {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    };

	eurecaClient.exports.kill = function(id)
	{
		if (tanksList[id]) {
			tanksList[id].kill();
			console.log('killing ', id, tanksList[id]);
		}
	};

	eurecaClient.exports.spawnEnemy = function(i, x, y, state)
	{
	    // console.log(':2:',x,y);
        if (i === myId || ( i in tanksList)) return; // this is me

		var position = [];
        position.x = x;
		position.y = y;
		// console.log('SPAWN '+position.x+' '+position.y);

		tanksList[i] = new Tank(i, game, tank, state);
	};

	eurecaClient.exports.updateState = function(id, state)
	{
		if (tanksList[id])  {

            tanksList[id].cursor = typeof(state.left) !== 'undefined' ? state : tanksList[id].cursor;
            tanksList[id].tank.x = state.x ? state.x : tanksList[id].tank.x;
            tanksList[id].tank.y = state.y ? state.y : tanksList[id].tank.y;
            tanksList[id].tank.angle = state.angle ? state.angle : tanksList[id].tank.angle;
            tanksList[id].turret.rotation = state.rot ? state.rot : tanksList[id].turret.rotation;
            tanksList[id].health = state.health ? state.health : tanksList[id].health;

			tanksList[id].update();
		}
	}
};


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
}

// ===== FIRST CREATORS =====

function setWorld() {
    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;

    var graphics = game.add.graphics(0, 0);

    graphics.beginFill(0x660000, 1);
    graphics.drawCircle(0, 0, 200);
}

function setCursors() {
    return {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S)
    };
}

function setTank() {
    player = new Tank(myId, game, tank, null, {'myId' : myId});
    tanksList[myId] = player;
    tank = player.tank;
    turret = player.turret;
    tank.x=0;
    tank.y=0;
    bullets = player.bullets;
    shadow = player.shadow;

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(tank.x, tank.y);
}


// ===== CREATE ======

function create () {

    setWorld();
    tanksList = {};
    setTank();
    cursors = setCursors();
}

function update () {
	//do not update if client not ready
	if (!ready) return;

	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;



	turret.rotation = game.physics.arcade.angleToPointer(turret);
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;


    // Проверка на попадание пули и танка
    for (var i in tanksList)
    {
		if (!tanksList[i]) continue;
		var curBullets = tanksList[i].bullets;
		var curTank = tanksList[i].tank;
		for (var j in tanksList)
		{
			if (!tanksList[j]) continue;
			if (j!=i)
			{

				var targetTank = tanksList[j].tank;
				game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);
                // game.physics.arcade.collide(curTank, targetTank);

			}
		}
        if (tanksList[i].alive) {
            tanksList[i].update();
        }
    }
}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
    if (tank.health > 0) {
    console.log('Hit',tank.parents.hit(10),tank.id);
    } else {
        // tanksList[tank.parent].kill();
        // tank.destroy();
        console.log('Killed');
    }

}

function render () {}

