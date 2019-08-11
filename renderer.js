//This file handles the drawing of tiles onto the canvas
//relative to the player at the center.

//initializes other files
var fs = require("fs");
var map_loader = require("./map_loader");

//loads map to array to check values to render
var map_array = map_loader.load_map();

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
var road_img = document.getElementById("road");
var error_img = document.getElementById("error");

//the function that collision.js calls to actually render the graphics on screen    TODO: fix bug that causes extra line to be drawn below bottom of map
function render(player_pos){
	//canvas_ctx.fillStyle = "rgba(0,0,0,0)";
	//canvas_ctx.clearRect(0,0,50,50);
	//x and y coordinates for the canvas not to be confused with i and j for the player position and map_array
	var x=0;
	var y=0;
	//loop for getting values relative to player checking tile type and drawing the appropriate image
	for(i=(player_pos[0]-25);i<(player_pos[0]+26);i++){
		for(j=(player_pos[1]-25);j<(player_pos[1]+26);j++){
			//console.log(x,y);
			try{
				//TODO: put this inside if statement to check if player is outside or inside for rendering roofs and such
				if(map_array[i][j]== 0){//green grass grows
					canvas_ctx.drawImage(grass_img,x,y,1,1);
				}
				else if(map_array[i][j]== 1){//black wall
					canvas_ctx.drawImage(wall_img,x,y,1,1);
				}
				else if(map_array[i][j]== 2){//brown floor
					canvas_ctx.drawImage(floor_img,x,y,1,1);
				}
				else if(map_array[i][j]== 3){//blue water
					canvas_ctx.drawImage(water_img,x,y,1,1);
				}
				else if(map_array[i][j]== 4){//purple ladder
					canvas_ctx.drawImage(ladder_img,x,y,1,1);
				}
				else if(map_array[i][j]== 5){//gray road
					canvas_ctx.drawImage(road_img,x,y,1,1);
				}
				else if(map_array[i][j]== 9){//error and brother I hurt people
					canvas_ctx.drawImage(error_img,x,y,1,1);
				}
				else {
					canvas_ctx.drawImage(wall_img,x,y,1,1);
				}
			}
			catch(err){
				//console.log(err.message);
				canvas_ctx.drawImage(wall_img,x,y,1,1);
				}
			//increments x to draw row
			x++;
		}
		//resets x for new line and increments y
		x=0;
		y++;
	}
	//draws player
	canvas_ctx.drawImage(player_img,25,25,1,1);    //player_pos[1],player_pos[0]
	//requestAnimationFrame(render);
}
exports.render = render;
