var express = require('express')
    , app = express(app)
    , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));

//we'll keep clients data here
var clients = {};

console.log('Start 2');

//get EurecaServer class
var Eureca = require('eureca.io');

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow: ['setId', 'spawnEnemy', 'kill', 'updateState']});

//attach eureca.io to our http server
eurecaServer.attach(server);


//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    clients[conn.id] = {id: conn.id, remote: remote};

    //here we call setId (defined in the client side)
    remote.setId(conn.id);
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

    // var removeId = clients[conn.id].id;

    delete clients[conn.id];

    for (var client in clients) {
        var remote = clients[client].remote;

        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }
});

// Рукопожатие при создании игры (после onConnect)
eurecaServer.exports.handshake = function () {
    for (var c in clients) {
        // console.log('::', clients);
        var remote = clients[c].remote;
        for (var client in clients) {
            //send latest known position
            var x = clients[client].laststate ? clients[client].laststate.x : 32;
            var y = clients[client].laststate ? clients[client].laststate.y : 32;
            // console.log('::', x, y);
            remote.spawnEnemy(clients[client].id, x, y, clients[client].laststate);
        }
    }
};


//Открывается со стороны клиента при каждом действии
eurecaServer.exports.handleKeys = function (keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        clients[c].remote.updateState(updatedClient.id, keys);
    }

    var laststate = clients[conn.id].laststate ? clients[conn.id].laststate : {};

    if (typeof (keys.health) !== 'undefined')
    console.log('---', laststate.health, keys.health, conn.id);

    // Сохранить последнее положение танка
    clients[conn.id].laststate = modifyLaststate(laststate, keys);
};

// Сохраняет в итоговом массиве только измененные значения
modifyLaststate = function (firstArray, addedArray) {
    var c = {},
        key;
    firstArray = Object.assign(firstArray, addedArray);
    for (key in firstArray) {
        if (firstArray.hasOwnProperty(key)) {
            c[key] = key in addedArray ? addedArray[key] : firstArray[key];
        }
    }

    return c;
};

server.listen(8000);