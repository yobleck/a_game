//main file for handling battles a.k.a. the core gameplay loop

//initialize variables
//initialize array that stores map coordinates
function createArray(length) {
    var array = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) array[length-1 - i] = createArray.apply(this, args);
    }
    return array;
}
var map_array = createArray(100,100); //2D array 0=blank 1=player 2=enemy 3=player projectile 4=enemy projectile      //health pick ups?
/*for(i=0;i<100;i++){
	for(j=0;j<100;j++){
		map_array[i][j] = 0;
	}
}*/

//player variables
var battle_pos// = [50,50]; //x,y
var player_health// = 10;
//initial player position written to map
//map_array[battle_pos[0]][battle_pos[1]] = 1;

//enemy variables
var num_enemies// = 6; // can be 1 thru 6    set this to be random chance (by userinput.js) as defined below 
var enemy_health// = [5,5,5,5,5,5]; //change this to set difficulty        
var enemy_pos// = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]]; // position of all enemies          
//initializes enemy position on map
/*for(i=0;i<num_enemies;i++){
	for(j=0;j<2;j++){
		map_array[enemy_pos[i][j]][enemy_pos[i][j]] = 2;
	}
}*/
var enemy_dir// = [1,1,1,1,1,1]; //1=right 2=left 3=down 4=up

//player projectile variables
var projectile_counter = []; //terms of inner arrays are x coordinate, y coordinate, slope, travel time [0,0,0,0]
var click_x = 0;
var click_y = 0;
var slope = 0;
var rorl = 0;

//summoning "graphics"
var player_img = document.getElementById("player");
var wall_img = document.getElementById("wall");//used for background, replace with custom texture or something later
var floor_img = document.getElementById("floor");// used for enemies
var water_img = document.getElementById("water");// used for player projectiles

//variables for checking if keys are pressed
var rightpressed = false;
var leftpressed = false;
var uppressed = false;
var downpressed = false;
var m1clicked = false;

//variable to start animation loop
var run = false;
var paused = true;

//listens for user inputs         //also handles some canvas stuff
var battle_canvas = document.getElementById("battlecanvas");
battle_canvas.addEventListener("keydown",keydownhandler,false);
battle_canvas.addEventListener("keyup",keyuphandler,false);
battle_canvas.addEventListener("click",clickhandler,false);
//listens for wasd keypresses down      //87=w  65=a  83=s  68=d
function keydownhandler(event){
    if(event.keyCode == 68) {rightpressed = true;}
    else if(event.keyCode == 65){leftpressed = true;}
    else if(event.keyCode == 83){downpressed = true;}
    else if(event.keyCode == 87){uppressed = true;}
	else if(event.keyCode == 13){if(paused == true){start();}}
	else if(event.keyCode == 27){pause();/*run = false;*/} //cancels animation/ends game
}
//and up
function keyuphandler(event){
    if(event.keyCode == 68) {rightpressed = false;}
    else if(event.keyCode == 65) {leftpressed = false;}
    else if(event.keyCode == 83) {downpressed = false;}
    else if(event.keyCode == 87) {uppressed = false;}
}
//listens for mouse clicks
function clickhandler(event){
	m1clicked = true;
	click_x = Math.floor(((event.clientX - battle_canvas.offsetLeft)/parseInt(getComputedStyle(battle_canvas).getPropertyValue("width"),10))*100); //calculates x coordinate of click
	click_y = Math.floor(((event.clientY - battle_canvas.offsetTop)/parseInt(getComputedStyle(battle_canvas).getPropertyValue("height"),10))*100); //calculates y coordinate of click
	slope = (battle_pos[1] - click_y)/(battle_pos[0] - click_x); // slope from player position to click
	projectile_counter.push([0,0,0,0,0]); //adds new term to array
	projectile_counter[projectile_counter.length -1][0] = battle_pos[0]; //x coor
	projectile_counter[projectile_counter.length -1][1] = battle_pos[1]; //y coor
	projectile_counter[projectile_counter.length -1][2] = slope; //slope
	projectile_counter[projectile_counter.length -1][3] = 0; //how many ticks the bullet has been alive
	if(click_x < battle_pos[0]){rorl = 0;} //if mouse is right or left of player
	else{rorl = 1;}
	projectile_counter[projectile_counter.length -1][4] = rorl;
	//console.log(projectile_counter);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//updates the game state
function update(){
	//if key pressed down and within play area, move player accordingly
	if(rightpressed==true && battle_pos[0]<98 && map_array[battle_pos[0]+1][battle_pos[1]]==0 /*|| map_array[battle_pos[0]+1][battle_pos[1]]==3*/){ //left  //set to 98 instead of 99 because of 'undefined' bug
		map_array[battle_pos[0]+1][battle_pos[1]]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[0]+=1;
	}
	if(leftpressed==true && battle_pos[0]>1 && map_array[battle_pos[0]-1][battle_pos[1]]==0 /*|| map_array[battle_pos[0]-1][battle_pos[1]]==3*/){ //right    //should be "else if"? lack of else might allow diagonal movement?   //set to 1 instead of 0 because of 'undefined' bug
		map_array[battle_pos[0]-1][battle_pos[1]]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[0]-=1;
	}
	if(downpressed==true && battle_pos[1]<98 && map_array[battle_pos[0]][battle_pos[1]+1]==0 /*|| map_array[battle_pos[0]][battle_pos[1]+1]==3*/){ //down
		map_array[battle_pos[0]][battle_pos[1]+1]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[1]+=1;
	}
	if(uppressed==true && battle_pos[1]>1 && map_array[battle_pos[0]][battle_pos[1]-1]==0 /*|| map_array[battle_pos[0]][battle_pos[1]-1]==3*/){ //up
		map_array[battle_pos[0]][battle_pos[1]-1]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[1]-=1;
	}
	
	//player projectiles handled here
	for(i=0;i<projectile_counter.length;i++){ //TODO: change equation so speed is constant (currently super fast when firing up and down) maybe swap equations at 45 deg. //or make bullets search for quickest path from start to finish
		if(projectile_counter[i][4]==1){ //firing to the right 
			if(projectile_counter[i][0]+projectile_counter[i][3]>0 && projectile_counter[i][0]+projectile_counter[i][3]<99 && projectile_counter[i][1]+projectile_counter[i][3]>0 /*&& projectile_counter[i][1]+projectile_counter[i][3]<99*/){ // this stops projectiles from going out of bounds
				map_array[projectile_counter[i][0]+projectile_counter[i][3]][Math.floor(projectile_counter[i][1]+(projectile_counter[i][3]*projectile_counter[i][2]))] = 3; //uses players firing position plus slope multiplied by tick counter(for y values) to draw projectile
				projectile_counter[i][3]++; // increments tick counter
				map_array[projectile_counter[i][0]+(projectile_counter[i][3]-2)][Math.floor(projectile_counter[i][1]+((projectile_counter[i][3]-2)*projectile_counter[i][2]))] = 0; //removes trailing projectiles //the -2 controls length of trail
			}
			else{ //this deletes projectiles once they've travelled too far
				map_array[projectile_counter[i][0]+(projectile_counter[i][3]-1)][Math.floor(projectile_counter[i][1]+((projectile_counter[i][3]-1)*projectile_counter[i][2]))] = 0; //removes projectiles previous image after it dies
				projectile_counter.splice(i,1); // removes projectile from counter so array doesn't bloat
			}
		}
		else if(projectile_counter[i][4]==0){ //firing to the left
			if(projectile_counter[i][0]-projectile_counter[i][3]>0 && projectile_counter[i][0]-projectile_counter[i][3]<99 /*&& projectile_counter[i][1]-projectile_counter[i][3]>0*/ && projectile_counter[i][1]-projectile_counter[i][3]<99){ // this stops projectiles from going out of bounds
				map_array[projectile_counter[i][0]-projectile_counter[i][3]][Math.floor(projectile_counter[i][1]-(projectile_counter[i][3]*projectile_counter[i][2]))] = 3; //uses players firing position plus slope multiplied by tick counter(for y values) to draw projectile
				projectile_counter[i][3]++; // increments tick counter
				map_array[projectile_counter[i][0]-(projectile_counter[i][3]-2)][Math.floor(projectile_counter[i][1]-((projectile_counter[i][3]-2)*projectile_counter[i][2]))] = 0; //removes trailing projectiles //the -2 controls length of trail
			}
			else{ //this deletes projectiles once they've travelled too far
				map_array[projectile_counter[i][0]-(projectile_counter[i][3]-1)][Math.floor(projectile_counter[i][1]-((projectile_counter[i][3]-1)*projectile_counter[i][2]))] = 0; //removes projectiles previous image after it dies
				projectile_counter.splice(i,1); // removes projectile from counter so array doesn't bloat
			}
		}
			
		map_array[battle_pos[0]][battle_pos[1]]=1; //redraws player
	}
	
	//handle enemy A.I./projectiles here      //50% chance of 1 enemy, 25% chance of 2 enemies, 13% chance of 3 enemies, 7% chance of 4 enemies, 4% chance of 5 enemies, 1% chance of 6 enemies        //A.I. shoot projectiles pacman ghost style?
	//enemy movement direction    ///make more consistent direction over time     //if enemy moves onto bullet subtract one health and delete bullet from array
	for(j=0;j<num_enemies;j++){
		temp = Math.floor((Math.random()*10)); //x% of the time enemy will move in the same direction as last time
		if(temp>1){}
		else{
			enemy_dir[j] = Math.floor((Math.random()*10)+1); //random numbers 1 thru 4 move enemies. numbers greater than 4 do nothing in order to slow their movements down
		}
	}
	for(i=0;i<num_enemies;i++){//set i<6 for all enemies
		if(map_array[enemy_pos[i][0]][enemy_pos[i][1]]==3){ //this section handles enemies taking damage
			enemy_health[i]--; //removes health if projectile is on same tile as enemy
			if(enemy_health[i]<1){ //if enemy dies
				enemy_pos.splice(i,1); //remove enemy
				enemy_health.splice(i,1); //and their health
				enemy_dir.splice(i,1); //and their movement dir
				num_enemies--; //and reduce enemy count
			}
		}
		if(enemy_dir[i]==1 && enemy_pos[i][0]<99 && map_array[enemy_pos[i][0]+1][enemy_pos[i][1]]==0){//move right, position<99 so stays inbounds, nothing blocking path
			map_array[enemy_pos[i][0]+1][enemy_pos[i][1]]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][0]+=1;
		}
		else if(enemy_dir[i]==2 && enemy_pos[i][0]>0 && map_array[enemy_pos[i][0]-1][enemy_pos[i][1]]==0){//move left
			map_array[enemy_pos[i][0]-1][enemy_pos[i][1]]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][0]-=1;
		}
		else if(enemy_dir[i]==3 && enemy_pos[i][1]<99 && map_array[enemy_pos[i][0]][enemy_pos[i][1]+1]==0){//move down
			map_array[enemy_pos[i][0]][enemy_pos[i][1]+1]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][1]+=1;
		}
		else if(enemy_dir[i]==4 && enemy_pos[i][1]>0 && map_array[enemy_pos[i][0]][enemy_pos[i][1]-1]==0){//move up
			map_array[enemy_pos[i][0]][enemy_pos[i][1]-1]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][1]-=1;
		}
	}
	if(num_enemies<1){stop();console.log("YOU WIN!");}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var canvas_ctx = battle_canvas.getContext("2d");
//draw player, enemies and projectiles on screen
function render(){
	for(i=0;i<100;i++){
		for(j=0;j<100;j++){
			if(map_array[i][j]== 0){//nothing
					canvas_ctx.drawImage(wall_img,i,j,1,1);
			}
			else if(map_array[i][j]== 1){//player
				canvas_ctx.drawImage(player_img,i,j,1,1);
			}
			else if(map_array[i][j]== 2){//enemy
				canvas_ctx.drawImage(floor_img,i,j,1,1);
			}
			else if(map_array[i][j]== 3){//player projectile
				canvas_ctx.drawImage(water_img,i,j,1,1);
			}
			/*
			else if(map_array[i][j]== 4){//enemy projectile
				canvas_ctx.drawImage(ladder_img,i,j,1,1);
			}*/
		}
	}
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function mainloop(timestamp){
	update();
	render();
	if(run == true){
	requestAnimationFrame(mainloop);
	}
	//if run = false get out of battle tab choose win/lose condition or something
}
//requestAnimationFrame(mainloop);

//game state pauses but doesn't reset
function pause(){
	run = false;
	paused = true;
}
//starts or unpauses gamestate
function start(){
	run = true;
	paused = false;
	requestAnimationFrame(mainloop);
}
//stops game and resets position health etc.
//there is a lot of redundant code here. optimize later with DRY principle
function stop(){
	run = false;
	paused = true;
	for(i=0;i<100;i++){ //clears canvas
		for(j=0;j<100;j++){
			map_array[i][j] = 0;
		}
	}
	//resets player
	battle_pos = [50,50];
	player_health = 10;
	map_array[battle_pos[0]][battle_pos[1]] = 1;
	//resets enemies
	num_enemies = 6;
	enemy_health = [5,5,5,5,5,5];  //
	enemy_dir = [1,1,1,1,1,1]; //
	enemy_pos = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]]; //
	for(i=0;i<num_enemies;i++){
		for(j=0;j<1;j++){
			map_array[enemy_pos[i][j]][enemy_pos[i][j]] = 2;
		}
	}
	//resets player projectiles
	projectile_counter.length = 0;
	click_x = 0;
	click_y = 0;
	slope = 0;
	rorl = 0;
}







