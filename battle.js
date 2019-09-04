//main file for handling battles a.k.a. the core gameplay loop

//initialize variables
var tab_switcher = require("./tab_switcher");
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
var enemy_health=[]// = [5,5,5,5,5,5]; //change this to set difficulty        
var enemy_pos=[[0,0]]// = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]]; // position of all enemies          
//initializes enemy position on map
/*for(i=0;i<num_enemies;i++){
	for(j=0;j<2;j++){
		map_array[enemy_pos[i][j]][enemy_pos[i][j]] = 2;
	}
}*/
var enemy_dir=[]// = [1,1,1,1,1,1]; //1=right 2=left 3=down 4=up

//player projectile variables
var projectile_counter = []; //terms of inner arrays are current x coordinate, current y coor, slope, new x coor, new y coor [0,0,0,0,0]
var click_x// = 0;
var click_y// = 0;
var angle// = 0;

//enemy projectile vars
var enemy_projectile = []; //terms of inner arrays are current x coordinate, current y coor, slope, new x coor, new y coor [0,0,0,0,0]
var enemy_angle// = 0;
var enemy_fire_mode = []; //0=random, 1=patrol, 2=chase, 3=ambush
var patrol_delay; //counter for patrol fire so it fires at a consistent speed

//summoning "graphics"
var player_img = document.getElementById("player");
var wall_img = document.getElementById("wall"); //used for background, replace with custom texture or something later
var floor_img = document.getElementById("floor"); //used for enemies
var water_img = document.getElementById("water"); //used for player projectiles
var ladder_img = document.getElementById("ladder"); //used for enemy projectiles

//variables for checking if keys are pressed
var rightpressed = false;
var leftpressed = false;
var uppressed = false;
var downpressed = false;
var m1clicked = false;

//variable to start animation loop
var run = false;
var paused = true;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//listeners functions and other things

//listens for user inputs         //also handles some canvas stuff
var battle_canvas = document.getElementById("battlecanvas");
battle_canvas.addEventListener("keydown",keydownhandler,false);
battle_canvas.addEventListener("keyup",keyuphandler,false);
battle_canvas.addEventListener("mousedown",clickhandler,false); //"wheel" for rapid fire TODO: find way to make mouse down continuous             
battle_canvas.addEventListener("wheel",clickhandler,false);
//listens for wasd keypresses down      //87=w  65=a  83=s  68=d
function keydownhandler(event){
    if(event.keyCode == 68) {rightpressed = true;}
    else if(event.keyCode == 65){leftpressed = true;}
    else if(event.keyCode == 83){downpressed = true;}
    else if(event.keyCode == 87){uppressed = true;}
	else if(event.keyCode == 13){if(paused == true){start();}}
	else if(event.keyCode == 27){pause();/*run = false;*/} //pauses animation
}
//and up
function keyuphandler(event){
    if(event.keyCode == 68) {rightpressed = false;}
    else if(event.keyCode == 65){leftpressed = false;}
    else if(event.keyCode == 83){downpressed = false;}
    else if(event.keyCode == 87){uppressed = false;}
}

//listens for mouse clicks
var testing;
function clickhandler(event){
	//m1clicked = true;
	click_x = Math.floor(((event.clientX - battle_canvas.offsetLeft)/parseInt(getComputedStyle(battle_canvas).getPropertyValue("width"),10))*100); //calculates x coordinate of click
	click_y = Math.floor(((event.clientY - battle_canvas.offsetTop)/parseInt(getComputedStyle(battle_canvas).getPropertyValue("height"),10))*100); //calculates y coordinate of click
	angle = ((Math.atan2((battle_pos[1]-click_y),(click_x-battle_pos[0]))/(Math.PI/180))+360)%360; //arctangent of delta y/delta x   //then convert from radians to degrees   //then add 360 and modulo 360 to deal with negatives
	projectile_counter.push([0,0,0,0,0]); //adds new projectile to array
	projectile_counter[projectile_counter.length -1][0] = battle_pos[0]; //current x coor
	projectile_counter[projectile_counter.length -1][1] = battle_pos[1]; //current y coor
	projectile_counter[projectile_counter.length -1][2] = angle;//angle to fire at
	projectile_counter[projectile_counter.length -1][3] = 0; //new x coor
	projectile_counter[projectile_counter.length -1][4] = 0; //new y coor
}

//enemy projectile functions
//random
function random_fire(enemy){ //fires projectiles in random directions //takes enemy_pos[i] as input
	var temp_delay = Math.floor(Math.random()*100); //slows down fire rate
	if(temp_delay < 5){
		enemy_angle = ((Math.atan2((enemy[1]-Math.floor(Math.random()*100)),(Math.floor(Math.random()*100)-enemy[0]))/(Math.PI/180))+360)%360; //see clickhandler() for more details
		enemy_projectile.push([0,0,0,0,0]); //adds new projectile to array
		enemy_projectile[enemy_projectile.length -1][0] = enemy[0]; //current enemy x coor
		enemy_projectile[enemy_projectile.length -1][1] = enemy[1]; //current enemy y coor
		enemy_projectile[enemy_projectile.length -1][2] = enemy_angle; //angle to fire at
		enemy_projectile[enemy_projectile.length -1][3] = 0; //new x coor
		enemy_projectile[enemy_projectile.length -1][4] = 0; //new y coor
	}
}
//patrol
function patrol_fire(enemy){ //fire projectiles in a circular pattern or at every point on the grid in succession
	patrol_delay++; //TODO: multiple enemies with the same fire mode will speed this up
	if(patrol_delay%5==0){
		enemy_angle = Date.now().toString().substr(9)*0.36; //converts date into angle only works as long as UNIX time has same # of digits
		enemy_projectile.push([0,0,0,0,0]); //adds new projectile to array
		enemy_projectile[enemy_projectile.length -1][0] = enemy[0]; //current enemy x coor
		enemy_projectile[enemy_projectile.length -1][1] = enemy[1]; //current enemy y coor
		enemy_projectile[enemy_projectile.length -1][2] = enemy_angle; //angle to fire at
		enemy_projectile[enemy_projectile.length -1][3] = 0; //new x coor
		enemy_projectile[enemy_projectile.length -1][4] = 0; //new y coor
	}
}
//chase
function chase_fire(enemy){}
//ambush
function ambush_fire(enemy){}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//UPDATES the game state
function update(){
	{
	//if key pressed down and within play area, move player accordingly
	if(rightpressed==true && battle_pos[0]<99 && map_array[battle_pos[0]+1][battle_pos[1]]==0 /*|| map_array[battle_pos[0]+1][battle_pos[1]]==3*/){ //left  //set to 98 instead of 99 because of 'undefined' bug
		map_array[battle_pos[0]+1][battle_pos[1]]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[0]+=1;
	}
	if(leftpressed==true && battle_pos[0]>0 && map_array[battle_pos[0]-1][battle_pos[1]]==0 /*|| map_array[battle_pos[0]-1][battle_pos[1]]==3*/){ //right    //should be "else if"? lack of else might allow diagonal movement?
		map_array[battle_pos[0]-1][battle_pos[1]]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[0]-=1;
	}
	if(downpressed==true && battle_pos[1]<99 && map_array[battle_pos[0]][battle_pos[1]+1]==0 /*|| map_array[battle_pos[0]][battle_pos[1]+1]==3*/){ //down
		map_array[battle_pos[0]][battle_pos[1]+1]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[1]+=1;
	}
	if(uppressed==true && battle_pos[1]>0 && map_array[battle_pos[0]][battle_pos[1]-1]==0 /*|| map_array[battle_pos[0]][battle_pos[1]-1]==3*/){ //up
		map_array[battle_pos[0]][battle_pos[1]-1]=1;
		map_array[battle_pos[0]][battle_pos[1]]=0;
		battle_pos[1]-=1;
	}
	}
	//if enemy touches player then they lose health
	for(i=battle_pos[0]-1;i<battle_pos[0]+2;i++){
		for(j=battle_pos[1]-1;j<battle_pos[1]+2;j++){
			try{if(map_array[i][j]==2){player_health--;}}catch(err){} //lazy try catch block
		}
	}
//////////////////////////////////////////////////////////////////////////////////////////////
	//player projectiles handled here
	//TODO: homing missiles that track the mouse pos and explode on contact or when reaching the mouse
	for(i=0;i<projectile_counter.length;i++){
		//calculate new coor from start and angle //assume hypotenuse of 1 unit for now but maybe make it changeable based on player movement so that projectile speed changes
		projectile_counter[i][3] = projectile_counter[i][0]+Math.sin((projectile_counter[i][2]+90)*(Math.PI/180)); //new x coor  //convert from degrees to rad with *(Math.PI/180)   have to add 90 degrees for some reason??
		projectile_counter[i][4] = projectile_counter[i][1]+Math.cos((projectile_counter[i][2]+90)*(Math.PI/180)); //new y coor
		if(projectile_counter[i][3]>=0 && projectile_counter[i][3]<=99 && projectile_counter[i][4]>=0 && projectile_counter[i][4]<=99){ //checks to see if projectile is inbounds  //can't go above 99?
			//draw new coor to map_array
			map_array[Math.floor(projectile_counter[i][3])][Math.floor(projectile_counter[i][4])] = 3; //floor it to snap to grid   //TODO: make less jittery by making projectiles bigger or grid smaller
			//erase old drawing  //this can be changed to create ghost trails
			map_array[Math.floor(projectile_counter[i][0])][Math.floor(projectile_counter[i][1])] = 0;
			//set new coor to current coor  //should new coor be reset or left as is?
			projectile_counter[i][0] = projectile_counter[i][3];
			projectile_counter[i][1] = projectile_counter[i][4];
		}
		else{//if projectile is out of bounds erase it from map_array and delete it from projectile_counter
			map_array[Math.floor(projectile_counter[i][0])][Math.floor(projectile_counter[i][1])] = 0;
			projectile_counter.splice(i,1);
		}
		//redraw player
		map_array[battle_pos[0]][battle_pos[1]]=1; //TODO: this is inefficient. it only needs to be done once not every time
	}
	
	//handles enemy damage
	for(i=0;i<num_enemies;i++){ //set i<6 for all enemies
		if(map_array[enemy_pos[i][0]][enemy_pos[i][1]]==3){ //this section handles enemies taking damage
			enemy_health[i]--; //removes health if projectile is on same tile as enemy
			if(enemy_health[i]<1){ //if enemy dies
				enemy_pos.splice(i,1); //remove enemy
				enemy_health.splice(i,1); //and their health
				enemy_dir.splice(i,1); //and their movement dir
				num_enemies--; //and reduce enemy count
				enemy_fire_mode.splice(i,1); //and make enemy stop firing
				//TODO: delete projectile by searching projectile_counter for matching coordinates and splicing
			}
		}
	}
//////////////////////////////////////////////////////////////////////////////////////////////
	//ENEMY MOVEMENT DIRECTION    
	//TODO: make more consistent over time     
	//TODO: if enemy moves onto bullet delete bullet from array
	//TODO: add panic movement mode if player gets too close?
	for(j=0;j<num_enemies;j++){ //random number generator for enemy movement
		temp = Math.floor((Math.random()*10)); //x% of the time enemy will move in the same direction as last time
		if(temp>1){} //do nothing
		else{
			enemy_dir[j] = Math.floor((Math.random()*10)+1); //random numbers 1-4 move enemies. numbers greater than 4 do nothing in order to slow their movements down
		}
	}
	for(i=0;i<num_enemies;i++){ //set i<6 for all enemies
		if(enemy_dir[i]==1 && enemy_pos[i][0]<99 && map_array[enemy_pos[i][0]+1][enemy_pos[i][1]]==0){ //move right, position<99 so stays inbounds, nothing blocking path
			map_array[enemy_pos[i][0]+1][enemy_pos[i][1]]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][0]+=1;
		}
		else if(enemy_dir[i]==2 && enemy_pos[i][0]>0 && map_array[enemy_pos[i][0]-1][enemy_pos[i][1]]==0){ //move left
			map_array[enemy_pos[i][0]-1][enemy_pos[i][1]]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][0]-=1;
		}
		else if(enemy_dir[i]==3 && enemy_pos[i][1]<99 && map_array[enemy_pos[i][0]][enemy_pos[i][1]+1]==0){ //move down
			map_array[enemy_pos[i][0]][enemy_pos[i][1]+1]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][1]+=1;
		}
		else if(enemy_dir[i]==4 && enemy_pos[i][1]>0 && map_array[enemy_pos[i][0]][enemy_pos[i][1]-1]==0){ //move up
			map_array[enemy_pos[i][0]][enemy_pos[i][1]-1]=2;
			map_array[enemy_pos[i][0]][enemy_pos[i][1]]=0;
			enemy_pos[i][1]-=1;
		}
	}
//////////////////////////////////////////////////////////////////////////////////////////////
	//HANDLE ENEMY AIMING A.I./PROJECTILES HERE      //TODO: A.I. shoot projectiles pacman ghost style?   1/4 complete
	//enemies will have scanning range
	//fire pacman style patterns   //each enemy is assigned a mode and fires a projectile every tick if player is in range
		//chase: fire behind player
		//ambush: fire in front of player
		//patrol: fire in circle
		//random: self explanatory
		
	//handle generation of projectiles here
	for(i=0;i<enemy_fire_mode.length;i++){
		if(enemy_fire_mode[i]==0){
			random_fire(enemy_pos[i]);
		}
		else if(enemy_fire_mode[i]==1){
			patrol_fire(enemy_pos[i]);
		}
		else if(enemy_fire_mode[i]==2){
			chase_fire(enemy_pos[i]);
		}
		else if(enemy_fire_mode[i]==3){
			ambush_fire(enemy_pos[i]);
		}
	}
	
	//handles actual moving of projectiles
	for(i=0;i<enemy_projectile.length;i++){
		//calculate new coor from start and angle //assume hypotenuse of 1 unit for now but maybe make it changeable based on enemy movement so that projectile speed changes
		enemy_projectile[i][3] = enemy_projectile[i][0]+Math.sin((enemy_projectile[i][2]+90)*(Math.PI/180)); //new x coor  //convert from degrees to rad with *(Math.PI/180)   have to add 90 degrees for some reason??
		enemy_projectile[i][4] = enemy_projectile[i][1]+Math.cos((enemy_projectile[i][2]+90)*(Math.PI/180)); //new y coor
		if(enemy_projectile[i][3]>=0 && enemy_projectile[i][3]<=99 && enemy_projectile[i][4]>=0 && enemy_projectile[i][4]<=99){ //checks to see if projectile is inbounds  //can't go above 99?
			//draw new coor to map_array
			map_array[Math.floor(enemy_projectile[i][3])][Math.floor(enemy_projectile[i][4])] = 4; //floor it to snap to grid
			//erase old drawing  //this can be changed to create ghost trails
			map_array[Math.floor(enemy_projectile[i][0])][Math.floor(enemy_projectile[i][1])] = 0;
			//set new coor to current coor  //should new coor be reset or left as is?
			//TODO: player take damage from projectiles here
			//if(enemy_projectile[i][0]==battle_pos[0] && enemy_projectile[i][1]==battle_pos[1]){player_health--;console.log(player_health);}
			enemy_projectile[i][0] = enemy_projectile[i][3];
			enemy_projectile[i][1] = enemy_projectile[i][4];
		}
		else{//if projectile is out of bounds erase it from map_array and delete it from enemy_projectile
			map_array[Math.floor(enemy_projectile[i][0])][Math.floor(enemy_projectile[i][1])] = 0;
			enemy_projectile.splice(i,1);
		}
		//redraw enemy
		//in lazy try catch block for now. TODO: set this up so that it only runs if enemy still exists   //FOR LOOP WONT WORK CAUSES HUGE ISSUES
		try{
			map_array[enemy_pos[0][0]][enemy_pos[0][1]]=2;
			map_array[enemy_pos[1][0]][enemy_pos[1][1]]=2;
			map_array[enemy_pos[2][0]][enemy_pos[2][1]]=2;
			map_array[enemy_pos[3][0]][enemy_pos[3][1]]=2;
		}
		catch(err){} //should I put something in here?
	}
//////////////////////////////////////////////////////////////////////////////////////////////
	//WIN/LOSE conditions
	if(num_enemies<1){
		stop();
		tab_switcher.eg();
		//canvas_ctx.font = "10px Arial"
		//canvas_ctx.fillStyle = "#ffffff"
		//canvas_ctx.fillText("YOU WIN!",20,20);
		console.log("YOU WIN!");
	}
	
	if(player_health<1){
		stop();
		tab_switcher.eg();
		console.log("YOU LOSE :(");
	}
	//TODO: save player win/lose count to file
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var canvas_ctx = battle_canvas.getContext("2d");
//DRAW player, enemies and projectiles on screen
//TODO: use player and enemy take damage var to make screen border flash colors to indicate that damage has been taken/a hit has been made
//TODO: health bar for player and maybe enemy count and health bars      separate canvas?
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
			else if(map_array[i][j]== 4){//enemy projectile
				canvas_ctx.drawImage(ladder_img,i,j,1,1);
			}
		}
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TODO: decouple update rate from frame rate by having update() run in a separate loop that only calls update() if x amount of real time has passed, then feed into render/requestAnimationFrame etc.
var time_current=0; //fps counter vars
var time_past=0;
var lastframetimems = 0;
var delta = 0;
var timestep = 1000/30; //tick rate control. divisor = ticks per second which controls speed
function mainloop(timestamp){
	if(run == true){ //if run = false game pauses or stops and gets out of battle tab with win/lose condition
	
		time_current=performance.now();
		document.getElementById("fps").innerHTML = (1000/(time_current-time_past)).toPrecision(3); //frame rate counter
		time_past=time_current;

		delta += timestamp - lastframetimems;
		lastframetimems = timestamp;
		var numupdatesteps = 0;
		while(delta >= timestep){
			update();
			delta -= timestep;
			if(++numupdatesteps >= 240){ //resets update wait timer if waits too long. causes game to snap forward
				delta = 0;
				break;
			}
		}
		//update();
		render();
		requestAnimationFrame(mainloop);
	}
}
//requestAnimationFrame(mainloop); //this is here to call manually if no button starts the loop

/* //an attempt to get teh game to fun at 60 fps. mostly unsuccessful
function mainloop(){
	setTimeout(mainloop,1000/40);
		if(run == true){ //if run = false game pauses or stops and gets out of battle tab with win/lose condition
	
		time_current=performance.now();
		document.getElementById("fps").innerHTML = (1000/(time_current-time_past)).toPrecision(3); //frame rate counter
		time_past=time_current;
		var timestamp = performance.now();
		delta += timestamp - lastframetimems;
		lastframetimems = timestamp;
		var numupdatesteps = 0;
		while(delta >= timestep){
			update(); //put timestep in paren?
			delta -= timestep;
			if(++numupdatesteps >= 240){ //resets update wait timer if waits too long. causes game to snap forward
				delta = 0;
				break;
			}
		}
		//update();
		render();
	}
}*/

//game state pauses but doesn't reset
function pause(){
	run = false;
	paused = true;
	//cancels any keys player had pressed when game paused
	rightpressed = false;
    leftpressed = false;
    downpressed = false;
    uppressed = false;
}
//starts or unpauses game state
function start(){
	run = true;
	paused = false;
	//have to cancel player inputs here too apparently
	rightpressed = false;
    leftpressed = false;
    downpressed = false;
    uppressed = false;
	requestAnimationFrame(mainloop);
}
//stops game and resets position health etc.
//there's some redundant code here. optimize later with DRY principle
function stop(){
	run = false;
	paused = true;
	//cancels any keys player had pressed when game ended
	rightpressed = false;
    leftpressed = false;
    downpressed = false;
    uppressed = false;
	//canvas_ctx.clearRect(0,0,battle_canvas.width,battle_canvas.height);//clears canvas
	for(i=0;i<100;i++){ //clears array
		for(j=0;j<100;j++){
			map_array[i][j] = 0;
		}
	}
	//resets player
	battle_pos = [50,50];
	player_health = 10;//TODO: high value so player doesn't die instantly?
	map_array[battle_pos[0]][battle_pos[1]] = 1;
	//resets enemies
	//num_enemies = Math.floor(Math.random()*4)+1; //1-4
	var randtemp = Math.floor(Math.random()*100)+1
	if(randtemp>=50){num_enemies=1;}
	else if(randtemp>=25 &&randtemp<50){num_enemies=2;}
	else if(randtemp>=12 &&randtemp<25){num_enemies=3;}
	else if(randtemp>=0 &&randtemp<12){num_enemies=4;}
	else{console.log(randtemp , "you done fucked up your math sonny boy");}
	
	for(i=0;i<num_enemies;i++){
		enemy_health[i]=1; //[1,1,1,1]
		enemy_dir[i]=1; //[1,1,1,1]
		enemy_pos[i]=[Math.floor(Math.random()*100),Math.floor(Math.random()*100)]; //[[0,0],[1,1],[2,2],[3,3]]
	}
	for(i=0;i<num_enemies;i++){
		map_array[enemy_pos[i][0]][enemy_pos[i][1]] = 2;
	}
	//resets player projectiles
	projectile_counter.length = 0;
	click_x = 0;
	click_y = 0;
	angle = 0;
	//resets enemy projectiles
	enemy_projectile.length = 0;
	enemy_angle = 0;
	patrol_delay = 0;
	enemy_fire_mode.length = 0;
	for(i=0;i<num_enemies;i++){
		enemy_fire_mode[i] = Math.floor(Math.random()*4);
	}
}







