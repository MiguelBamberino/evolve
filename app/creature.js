
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
var util = require("util");
//var Ting = require('./ting.js');
var _super = require("./ting.js").prototype,
    method = Creature.prototype = Object.create( _super );
	Creature.prototype.constructor = Creature;

function Creature(name,position,width,height,colour,type){
	// load the super class up
	 _super.constructor.apply( this, arguments );
	// set age related variables
	this.age = 1;
	this.grown = false;
	this.alive = true;
	// set misc variables
	this.view_distance = 50;
	this.changes = 0;
	this.bonked_time = 0;
	this.time_to_bonk = 20;
	this.nearby_tings = [];
}

function isOdd(num) { return num % 2;}
Creature.prototype.decide_action = function(){
	has_acted = false;
	// search for nearest options
	closest_same = this.search_for_closest(HERBIVORE);
	closest_food = this.search_for_closest(PLANT);
	closest_predator = this.search_for_closest(CARNIVORE);

	console.log(closest_same);
	if(this.grown ===true && closest_same.distance < this.view_distance  && this.bonked_time < this.time_to_bonk){
		has_acted = true;
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
	if(!has_acted){
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
	closest  = false;
	for (i=0; i < this.nearby_tings.length; i++){
		if(this.nearby_tings[i].type === TYPE){
			new_distance = this.distance_between(this.position,this.nearby_tings[i].position);
			if(closest===false || closest.distance > new_distance){
				closest = {type:this.nearby_tings[i].type,position:this.nearby_tings[i].position, distance:new_distance } ;
			}
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


module.exports = Creature;