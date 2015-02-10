// define some kind of ENUMS, reserved variable names
YES = 1;
NO = 0;
// next enums used for comunication between creatures
RESPONSE_TO_MATE = 1;
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
        
        // mating related variables
        this.mating_cooldown = 0;
        this.time_between_matings = 50;
        this.mate_id = false;
        this.time_mating_for = 0;
        this.time_required_to_mate = 20;
        
	// set misc variables
        this.distance = false;
        this.reach = 5;
	this.view_distance = 50;
	this.changes = 0;
	this.nearby_tings = [];
}

function isOdd(num) { return num % 2;}
Creature.prototype.decide_action = function(){
    action = false;
    // search for nearest options
    closest = this.search_for_closest(false);
     console.log(new_distance);
                        console.log(closest);
    if( closest.type === this.eaten_by ){
        // leggit ! attempt to flee from another creature
        this.flee(closest);
        action = {type:'fleeing',meta:this.destination};

    }else if( closest.type === this.type ){

        action = this.attempt_to_mate(closest);

    }else if(closest.type === this.eats ){
        // if not then search for food
        action = {type:'eating',meta:this.destination};
    }

    

    // if we still havent decided on an action and not currently moving somewhere then pick a new place to go to
    if(!action){
        this.pick_random_destination();    
        action = {type:'moving',meta:this.destination};
    }
    
    return action;
}
Creature.prototype.flee = function(from){
    
}
/**
 *
 * @returns {Creature.prototype.take_action.action}
 */
Creature.prototype.take_action = function(){

	this.get_older();
	action = this.decide_action();

	if(this.travelling){
            this.move_to_destination();
            action = {type:'move-to',meta:this.position};
	}

	this.nearby_tings = [];
	
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
            if(this.nearby_tings[i].type === TYPE || TYPE === false){
                new_distance = this.distance_between(this.position,this.nearby_tings[i].position);
                if(closest===false || closest.distance > new_distance){
                        this.nearby_tings.distance = new_distance;
                        closest = this.nearby_tings;                                    
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

// ############ Age Functions #################################################
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

//################ Mating functions ############################################
Creature.prototype.attempt_to_mate = function(closest){
    action = false;
    if(this.mate_id){
        this.travelling = false;
        // are the couple still having fun ?
        if(this.time_mating_for < this.time_required_to_mate){
            this.time_mating_for += 1;	
            if(isOdd(this.time_mating_for)){
                this.colour = "#F0F";
            }else{
                this.colour = "#909";
            }
        }else{
            // end of sexy time
            this.colour = this.base_colour;
            // set up an object to controlling object can create child and update other creature
            action = {type:"end-sex",mate_id:this.mate_id};
        }
    }else if( closest !== false ){
        // if they have met then time to attempt mating
        if(closest.distance < this.reach){
            action = {type:"request",target_id:closest.id,request_type:"mating",mate_id:this.id};
        }else{
            // keep moving closer
            this.destination = closest.position;
        }
    }
    return action;
}
/**
 * Return whether a creature is eligible to mate. 
 * @returns {bool}
 */
Creature.prototype.can_mate = function(){
    return ( this.grown && this.mating_cooldown === 0 );
}
/**
 * ask this creature if it will mate
 * @param {obj} request
 * @returns {Creature.prototype.request_to_mate.response}
 */
Creature.prototype.request_to_mate = function(request){
    var response = {type:"response",response_type:"mating",answer:NO,mate_id:this.id,cycles_to_mate:this.time_required_to_mate};
    // do you accept thee to be your lawful wedded
    if( !this.mate_id && this.can_mate() ){
        this.mate_id = request.mate_id;
        response.answer = YES;
        this.travelling = false;
    }
    return response;
}
/**
 * If other creature approves then set the mate id so creatures can begin mating
 * @param {obj} response
 * @returns {undefined}
 */
Creature.prototype.response_to_mate = function(response){
    if(response.answer === YES){
         this.mate_id = response.mate_id;
         this.time_required_to_mate = response.cycles_to_mate;
         this.travelling = false;
    }
}
/**
 * seperate this parent from its partner after sex
 * @returns {undefined}
 */
Creature.prototype.decouple = function(){
    this.mating_cooldown = this.time_between_matings;
    this.mate_id = false;
    this.pick_random_destination();
}
//######### Getters and Setters ################################################
Creature.prototype.set_nearby = function(things){
	this.nearby_tings = things;
}


module.exports = Creature;