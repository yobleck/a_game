// This file is required by index.html file and is executed in that window.
// All of the Node.js APIs are available in this process. after enabling nodeIntegration
//this file is for taking user inputs and handing them over to collision.js

var fs = require('fs');
//calls collision.js so its functions can be used (also commands in collision will execute by themselves so keep in func)
var collision = require("./collision");
//var inventory_loader = require("./inventory_loader");  //OLD remove later


//variables for key presses
var rightpressed = false;
var leftpressed = false;
var uppressed = false;
var downpressed = false;
//var for inventory open status
var invopen = false
fs.writeFileSync('./sav/inv.opn', invopen);


//listens for wasd keypresses
//87=w  65=a  83=s  68=d
var canvas = document.getElementById("thecanvas");
canvas.addEventListener("keydown",keydownhandler,false);
canvas.addEventListener("keyup",keyuphandler,false);
//document.getElementById("thecanvas").focus();

//keydown spams rapidly and is kinda laggy if held so call collision function in keyup    update: fixed because smaller rendering size?    update2: or not. look into request animation frame or setinterval
function keydownhandler(event) {
    if(event.keyCode == 68) {
        //rightpressed = true;
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 65) {
        //leftpressed = true;
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 83) {
    	//downpressed = true;
		collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 87) {
    	//uppressed = true;
		collision.cpm(event.keyCode);
    }
}

//for letting go of the key
//should dirpressed be set to false?
function keyuphandler(event) {
    if(event.keyCode == 68) {
        //rightpressed = true;
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 65) {
        //leftpressed = true;
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 83) {
    	//downpressed = true;
		//collision.cpm(event.keyCode);
    }
    else if(event.keyCode == 87) {
    	//uppressed = true;
		//collision.cpm(event.keyCode);
    }
}
//todo: add mouseclick and other keydown/up functionality