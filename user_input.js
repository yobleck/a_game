// This file is required by index.html file and is executed in that window.
// All of the Node.js APIs are available in this process. after enabling nodeIntegration
//this file is for taking user inputs and handing them over to collision.js

//calls collision.js so its functions can be used (also commands in collision will execute by themselves so keep in func)
var collision = require("./collision");


//variables for key presses
var rightpressed = false;
var leftpressed = false;
var uppressed = false;
var downpressed = false;

//listens for wasd keypresses
//87=w  65=a  83=s  68=d
window.addEventListener("keydown",keydownhandler);
window.addEventListener("keyup",keyuphandler);

//keydown spams rapidly and is kinda laggy if held so call collision function in keyup
function keydownhandler(event) {
    if(event.keyCode == 68) {
        rightpressed = true;
		//document.getElementById("presstest").innerHTML = "d down";
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 65) {
        leftpressed = true;
		//document.getElementById("presstest").innerHTML = "a down";
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 83) {
    	downpressed = true;
		//document.getElementById("presstest").innerHTML = "s down";
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 87) {
    	uppressed = true;
		//document.getElementById("presstest").innerHTML = "w down";
		collision.cpm(event.keyCode);
    }
}

//for letting go of the key
//should dirpressed be set to false?
function keyuphandler(event) {
    if(event.keyCode == 68) {
        rightpressed = true;
		//document.getElementById("presstest").innerHTML = "d up";
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 65) {
        leftpressed = true;
		//document.getElementById("presstest").innerHTML = "a up";
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 83) {
    	downpressed = true;
		//document.getElementById("presstest").innerHTML = "s up";
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 87) {
    	uppressed = true;
		//document.getElementById("presstest").innerHTML = "w up";
		//collision.cpm(event.keyCode);
    }
}

//todo: add mouseclick and other keydown/up functionality
//redraw canvas on tick or on keypress? action game will require tick. rpg might only need update screen on user input