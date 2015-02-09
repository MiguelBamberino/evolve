HERBIVORE = 1;
CARNIVORE = 2;
PLANT = 3;

function Ting(name,position,width,height,colour,TYPE){

	this.id = 1;
	this.name = name;
	this.width = width;
	this.height = height;
	this.colour = colour;
	this.base_colour = colour;
	this.type = TYPE;

	this.position = position;
	this.destination = {x:0,y:0};
	this.travelling = false;
	this.speed = 10;

}
/**
 * work out the next position for this object, to allow it
 * to move to is set destination
 * @returns {undefined}
 */
Ting.prototype.move_to_destination = function(){

	dist_to_target = this.distance_between(this.position,this.destination);
	cycles_to_there = dist_to_target / this.speed;
	//now lets check if we actually arrived at our destination
	if(cycles_to_there > 1 && dist_to_target !== 0){
		this.position.x += (x_dist / cycles_to_there);
		this.position.y += (y_dist / cycles_to_there);
	}else{
		this.travelling = false;
		this.changes += 1;
	}
}
module.exports = Ting;
