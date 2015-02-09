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

var fs = require('fs');
var vm = require('vm');
var Moniker = require('moniker');

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

HERBIVORE = 1;
CARNIVORE = 2;
/**
 *@author Mike Bamber
 * A basic object for modelling a creature in evolution world
 *
 *@param  name
 *@param  position
 *@param  width
 *@param  height
 *@param  colour
 */
function Creature(name,position,width,height,colour){

	this.name = name;

	this.age = 1;
	this.grown = false;
	this.alive = true;

	this.width = width;
	this.height = height;
	this.colour = colour;
	this.base_colour = colour;
	this.type = HERBIVORE;

	this.position = position;
	this.destination = {x:0,y:0};
	this.travelling = false;
	this.speed = 10;

	this.changes = 0;
	this.bonked_time = 0;
	this.time_to_bonk = 20;
	this.nearby_tings = [];
}
function isOdd(num) { return num % 2;}
Creature.prototype.decide_action = function(){
	have_action = false;
	// search for sexy partner
	closest_same = this.search_for_closest(HERBIVORE);
	if(this.grown ===true && closest_same.distance < 50  && this.bonked_time < this.time_to_bonk){
		have_action = true;
		if(closest_same.distance < 5){
			this.bonked_time += 1;
			this.travelling = false;
			if(isOdd(this.bonked_time)){
				this.colour = "#F0F";
			}else{
				this.colour = "#909";
			}

			if(this.bonked_time === this.time_to_bonk){
				this.colour = this.base_colour;
			}
		}else{
			// keep moving towards your lover
			this.destination = closest_same.position;
		}
	}
	// if not then search for food

	// if we still havent decided on an action and not currently moving somewhere then pick a new place to go to
	if(!have_action){
		this.pick_random_destination();
	}
}
/**
 *
 * @returns {Creature.prototype.take_action.action}
 */
Creature.prototype.take_action = function(){

	this.get_older();
	this.decide_action();

	if(this.travelling){
		this.move_to_destination();
	}
	this.nearby_tings = [];
	action = {action:'move-to',meta:this.position};
	return action;
}
/**
 * get the closest object of supplied type, based on known nearby objects
 * @param {enum} TYPE
 * @returns {object} closest
 */
Creature.prototype.search_for_closest = function(TYPE){
	// check over nearby objects
	closest = {type:this.nearby_tings[0].type,position:this.nearby_tings[0].position, distance:1000000000000 } ;
	for (i=0; i < this.nearby_tings.length; i++){
		new_distance = this.distance_between(this.position,this.nearby_tings[i].position);
		if(closest.distance > new_distance){
			closest = {type:this.nearby_tings[i].type,position:this.nearby_tings[i].position, distance:new_distance } ;
		}
	}
	return closest;
}
/**
 * select a random x,y position in the world bounds to move to
 * @returns {undefined}
 */
Creature.prototype.pick_random_destination = function(){
	randX = Math.floor((Math.random() * 1000) + 1);
	randY = Math.floor((Math.random() * 1000) + 1);
	this.destination = { x:randX , y:randY };
	this.travelling = true;
}
/**
 * MATH helper function, should be moved.
 * return the distance between two x,y positions
 * @param {vector} start
 * @param {vector} end
 * @returns {unresolved}
 */
Creature.prototype.distance_between = function(start,end){
	x_dist = end.x - start.x;
	y_dist = end.y - start.y;
	travel_sqd = Math.pow(x_dist,2) + Math.pow(y_dist,2);
	distance = Math.sqrt(travel_sqd);
	return distance;
}
/**
 * work out the next position for this object, to allow it
 * to move to is set destination
 * @returns {undefined}
 */
Creature.prototype.move_to_destination = function(){

	dist_to_target = this.distance_between(this.position,this.destination);
	cycles_to_there = dist_to_target / this.speed;
	this.position.x += (x_dist / cycles_to_there);
	this.position.y += (y_dist / cycles_to_there);

	//now lets check if we actually arrived at our destination
	if(cycles_to_there < 2){
		this.travelling = false;
		this.changes += 1;
	}
}
/**
 * Carry out the action(s) of aging this creature
 * @returns {undefined}
 */
Creature.prototype.get_older = function(){
	this.age +=1;
	// if we are still not an adult then grow
	if(!this.grown){
		if(this.age < 40){
			this.grow();
		}else{
			// if we just became and adult then set true
			this.grown = true;
		}
	}
	if(this.age > 200){
		this.die();
	}
}
/**
 * Kill off this creature
 * @returns {undefined}
 */
Creature.prototype.die = function(){
	this.alive = false;
	this.colour = '#111';
}
/**
 * Simulate this creature growing in ita
 * early age
 * @returns {undefined}
 */
Creature.prototype.grow = function(){
	this.width +=1;
	this.height +=1;
}
//######### Getters and Setters ###############################
Creature.prototype.set_nearby = function(things){
	this.nearby_tings = things;
}
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