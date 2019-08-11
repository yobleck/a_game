//this file loads the map into an array from the "insert map name here".wtf file

//initialize stuff
var map_array = [];
var fs = require('fs');


function load_map(){
	//opens file and reads contents to var
	var readmap = fs.readFileSync("./levels/map.wtf", "utf8", function(err, contents) {});
	//converts file input into 1D array
	var array1d = readmap.split("\n");
	//and then into the correct 2D array
	map_array = array1d;
	for(i=0;i<array1d.length;i++){
		map_array[i] = array1d[i].split(" ");
	}
	return map_array;
}
exports.load_map = load_map;




//work on this later
function switch_map(){}//this is for ladders. when user steps on ladder this function will trigger and switch maps or run load map with a different file path
									 // not looking forward to pairing ladders together between maps :(