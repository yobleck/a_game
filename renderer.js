//This file handles the drawing of tiles onto the canvas
//relative to the player at the center.


//initializes stuff
var fs = require("fs");
var map_loader = require("./map_loader");

//loads map to array to check values to render
var map_array = map_loader.load_map();


//get rid of this and replace with tile based rendering from map.wtf input in renderer.js
//var bg_img = document.getElementById("overworld_test");
//canvas_ctx.drawImage(bg_img,0,0,100,100); //image size is original and then scaled in css
//this too
//var player_img = document.getElementById("player_test");
//canvas_ctx.drawImage(player_img,50,50,1,1);



//the function that collision.js will call to actually render the graphics on screen       //for now this is a static sized image but should be replaced with a scalable one centered on the player
function render(player_pos){
	//initializing the canvas
	var canvas = document.getElementById("thecanvas");
	var canvas_ctx = canvas.getContext("2d");
	//initializing images
	var player_img = document.getElementById("player");
	var grass_img = document.getElementById("grass");
	var floor_img = document.getElementById("floor");
	var wall_img = document.getElementById("wall");
	var water_img = document.getElementById("water");
	var ladder_img = document.getElementById("ladder");
	var error_img = document.getElementById("error");
	
	//draws map
	for(i=0;i<100;i++){
		for(j=0;j<100;j++){
			if(map_array[i][j]== 0){//green grass grows
				canvas_ctx.drawImage(grass_img,j,i,1,1);
			}
			else if(map_array[i][j]== 1){//black wall
				canvas_ctx.drawImage(wall_img,j,i,1,1);
			}
			else if(map_array[i][j]== 2){//brown floor
				canvas_ctx.drawImage(floor_img,j,i,1,1);
			}
			else if(map_array[i][j]== 3){//blue water
				canvas_ctx.drawImage(water_img,j,i,1,1);
			}
			else if(map_array[i][j]== 4){//purple ladder
				canvas_ctx.drawImage(ladder_img,j,i,1,1);
			}
			else if(map_array[i][j]== 9){//error and brother I hurt people
				canvas_ctx.drawImage(error_img,j,i,1,1);
			}
		}
	}
	//draws player
	canvas_ctx.drawImage(player_img,player_pos[1],player_pos[0],1,1);
	
}
exports.render = render;
