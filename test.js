var Creature = require('./app/creature.js');


var creatures = [];
var start_test = function(){
	creatures = [];
	creatures.push(
		new Creature(
			"frank1",
			{x:0,y:0},
			5,
			5,
			'#f00',
			HERBIVORE
		)
	);
	creatures.push(
		new Creature(
			"frank2",
			{x:30,y:100},
			5,
			5,
			'#0F0',
			HERBIVORE
		)
	);
		/*
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
	);*/
	//console.log(creatures[0]);
	//creatures[0].position = {x:300,y:200};
	//creatures[0].move_to_destination();
	//console.log(creatures[0]);
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
}
start_test();