//this file handles player collision based of inputs from user_input.js
//decides whether the player can move or not
//and then tells renderer.js what to do

//initializes renderer.js
var fs = require('fs');
var renderer = require("./renderer");
var map_loader = require("./map_loader")

//loads map data for collision checking
var map_array = map_loader.load_map();

//starting player position read from file and converted into ints in array
var readplayer = fs.readFileSync("./sav/player.pos", "utf8", function(err, contents) {});
var player_pos = readplayer.split(",");
player_pos[0] = parseInt(player_pos[0]);
player_pos[1] = parseInt(player_pos[1]);
console.log(player_pos);//p.s. players name is Eebruk


//draws the map for the first time
renderer.render(player_pos);


//function for checking collision and whether or not player can move
//87=w  65=a  83=s  68=d     //keycodes
function can_player_move(input_num){
	if(input_num == 68){
		//console.log(input_num);
		if(map_array[player_pos[0]][player_pos[1]+1] == 0 || map_array[player_pos[0]][player_pos[1]+1] == 2 || map_array[player_pos[0]][player_pos[1]+1] == 5){//checks if tile in desired direction of movement is grass or floor
			//console.log("can move right");
			player_pos[1]+=1;
			//console.log(player_pos);
			fs.writeFileSync('./sav/player.pos', player_pos); //writes player_pos to file         maybe don't do this every time.
			renderer.render(player_pos);//calls renderer.js to draw graphics
		}
		else {
			//console.log("cant move right");
		}
	}
	else if(input_num == 65){
		//console.log(input_num);
		if(map_array[player_pos[0]][player_pos[1]-1] == 0 || map_array[player_pos[0]][player_pos[1]-1] == 2 || map_array[player_pos[0]][player_pos[1]-1] == 5){
			//console.log("can move left");
			player_pos[1]-=1;
			//console.log(player_pos);
			fs.writeFileSync('./sav/player.pos', player_pos);
			renderer.render(player_pos);
		}
		else {
			//console.log("cant move left");
		}
	}
	else if(input_num == 83){
		//console.log(input_num);
		if(map_array[player_pos[0]+1][player_pos[1]] == 0 || map_array[player_pos[0]+1][player_pos[1]] == 2 || map_array[player_pos[0]+1][player_pos[1]] == 5){
			//console.log("can move down");
			player_pos[0]+=1;
			//console.log(player_pos);
			fs.writeFileSync('./sav/player.pos', player_pos);
			renderer.render(player_pos);
		}
		else {
			//console.log("cant move down");
		}
	}
	else if(input_num == 87){
		//console.log(input_num);
		if(map_array[player_pos[0]-1][player_pos[1]] == 0 || map_array[player_pos[0]-1][player_pos[1]] == 2 || map_array[player_pos[0]-1][player_pos[1]] == 5){
			//console.log("can move up");
			player_pos[0]-=1;
			//console.log(player_pos);
			fs.writeFileSync('./sav/player.pos', player_pos);
			renderer.render(player_pos);
		}
		else {
			//console.log("cant move up");
		}
	}
}
//makes collision function available in user_input.js and shortens function name
exports.cpm = can_player_move;
