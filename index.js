
var fs = require('fs');

var handler = function(req, res) {
    console.log("request in...");

    fs.readFile('./page.html', function (err, data) {
        if(err) throw err;
        res.writeHead(200);
        res.end(data);
    });
}
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);


var vm = require('vm');
var Moniker = require('moniker');
var Creature = require('./app/creature.js');
var content = fs.readFileSync('./app/creature.js');
//vm.runInThisContext(content);
var port = 3250;

app.listen(port);

io.sockets.on('connection', function (socket) {
    console.log("client connected...");
    socket.on('disconnect', function () {
        console.log("client disconnected...");

    });

    // #######   Broadcasting events ##########################
    socket.on("broadcast", function() {
		// if we havent already started then broadcast data
		if(!keep_broadcasting){
			keep_broadcasting = true;
			console.log("Broadcasting started...");
			main();
			console.log('Broadcasting ended. All cycles ended..');
		}

    });
    socket.on("stop_broadcast", function() {
        cycles = 0;
        keep_broadcasting = false;
        console.log("Broadcasting stop command received...");
    });
    // #########################################################
});

// ###### Main Cycle Management ################################
var cycles = 0;
var keep_broadcasting = false;
var tick_time = 200; // milliseconds 1000 = second
var main = function(){
	keep_broadcasting = true;
    start_world();
    run_cycle();
}
var test_cycle = function(){
	start_world();
	world_cycle();
}
var run_cycle = function(){
    world_cycle();
    end_cycle();
}
var end_cycle = function(){

    if(keep_broadcasting){
        cycles++;
        console.log('Cycle '+cycles+' end reached...');
        setTimeout(function() {
          run_cycle();
        }, tick_time);
    }
}
// ############################################################

var creatures = [];

var start_world = function(){
	creatures = [];
	creatures.push(
		new Creature(
			"frank1",
			{x:0,y:0},
			5,
			5,
			'#f00'
		)
	);
	creatures.push(
		new Creature(
			"frank2",
			{x:30,y:100},
			5,
			5,
			'#0F0'
		)
	);
	creatures.push(
		new Creature(
			"frank3",
			{x:100,y:100},
			5,
			5,
			'#0b0'
		)
	);
	creatures.push(
		new Creature(
			"frank4",
			{x:900,y:500},
			5,
			5,
			'#fF0'
		)
	);

}
var end_world = function(){

}
var world_cycle = function(){
    var d = new Date();
    var n = d.getTime();
	var tings = [];
	creatures.forEach(function(item){

		if(item.alive){

			tings = [];
			for (x = 0; x< creatures.length; x++){
				if(creatures[x].name !== item.name){
					//tings.push( {type:creatures[x].type,position:creatures[x].position } );
					tings.push( creatures[x] );

				}
			}

			item.set_nearby( tings );

			data = item.take_action();
			console.log(item);
		}

	});

    io.sockets.emit("broadcasting",
    {
        message: "time: " + n + " Cycle: "+cycles,
        creatures:creatures
    });
}

main();