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
	console.log(creatures);
}
start_test();