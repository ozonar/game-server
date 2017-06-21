Tank = function (index, game, player, position) {
    this.cursor = {
        left:false,
        right:false,
        up:false,
        fire:false
    };

    this.input = {
        left:false,
        right:false,
        up:false,
        fire:false
    };

    var x = 0;
    var y = 0;

    if (typeof (position) !== 'undefined') {
        x = position.x;
        y = position.y;
    }
    console.log(':tank:',x,y);

    this.game = game;
    this.health = 30;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);


    this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);
    // this.tank.body.parent = index;

    this.tank.angle = 0;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

};

Tank.prototype.update = function() {

    var inputChanged = (
        this.cursor.left !== this.input.left ||
        this.cursor.right !== this.input.right ||
        this.cursor.up !== this.input.up ||
        this.cursor.fire !== this.input.fire
    );


    if (inputChanged)
    {
        //Handle input change here
        //send new values to the server
        if (this.tank.id === myId)
        {
            // send latest valid state to the server
            this.input.x = this.tank.x;
            this.input.y = this.tank.y;
            this.input.angle = this.tank.angle;
            this.input.rot = this.turret.rotation;


            eurecaServer.handleKeys(this.input);

        }
    }

    //cursor value is now updated by eurecaClient.exports.updateState method


    if (this.cursor.left)
    {
        this.tank.angle -= 4;
    }
    else if (this.cursor.right)
    {
        this.tank.angle += 4;
    }
    if (this.cursor.up)
    {
        //  The speed we'll travel at
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 4;
        }
    }
    if (this.cursor.fire)
    {
        this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }



    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }
    else
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
    }




    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};


Tank.prototype.fire = function(target) {
    if (!this.alive) return;
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        this.nextFire = this.game.time.now + this.fireRate;
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);

        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
    }
};


Tank.prototype.kill = function() {
    this.alive = false;
    this.tank.kill();
    this.turret.kill();
    this.shadow.kill();
};