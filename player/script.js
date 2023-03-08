/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/04 (YYYY/MM/DD)
 * last edited: 2022/03/08
 */
var lvlContainer = document.createElement("div")		// container for the level canvas
var plrCanvas = document.createElement("canvas");		// the canvas where the player is drawn
var lvlCanvas = document.createElement("canvas");		// the canvas where the level is drawn
														// ---
plrCanvas.id = "plr";									// 
lvlCanvas.id = "lvl";									// set the canvas's id in case we lose it
lvlContainer.id = "lvlContainer"						//
														// ---
	lvlCanvas.width =										// set the size of the canvases/containers
	lvlCanvas.height =										//
	plrCanvas.width =										//
	plrCanvas.height = Math.min(innerWidth, innerHeight) * 0.8;	//
lvlContainer.appendChild(lvlCanvas);
document.body.appendChild(lvlContainer);				// add the canvases to the document
document.body.appendChild(plrCanvas);					// 
														// ---
var pc = plrCanvas.getContext("2d");					// 
var lc = lvlCanvas.getContext("2d");					// get their contexts
														// ---

started = false;
document.onkeydown = (e) => {
	keys[e.key] = true;
	if (!started) {				// the game only begins once you press a button
		start();
	}
}
document.onkeyup = (e) => {
	keys[e.key] = false;
}

var speed = 1;								// how fast the game should run
var ms = 0;									// the delay in miliseconds between each frame
var move = (128 * speed) * (ms / 1000);		// tells the player how many pixels it should move

var 
	player = {			// the player's position
		x: 256 + (level.startPos[0] * 512),
		y: 256 + (level.startPos[1] * 512)
	},
	pTile = {			// which tile the player is currently on
		x: 0,
		y: 0,
		v: 0
	},
	cam = {
		x: 0,
		y: 0
	},
	gravity = 1;		// the gravity on the player (positive = down, negative = up)

var keys = {};		// what keys are being pressed
var buffer = true;		// so that we can be very nice to the player (all collisions excluding the one with green tiles give you a frame before they actually happen)
var timer = 0;
function setFps(v) {						// sets the framerate
	ms = 1000/v;
	move = (128 * speed) * (ms / 1000);
}
function setSpeed(v) {					// sets the speed of the game (maintains fps and changes movement)
	speed = v;
	move = (128 * speed) * (ms / 1000);
}
function setFrameSpeed(fps, spd) {		// sets the speed of the game (maintains movement and changes fps)
	ms = 1000/fps;
	move = (128 * speed) * (ms / 1000);
	ms /= spd;
}


function reset() {
	player = {
		x: 256 + (level.startPos[0] * 512),
		y: 256 + (level.startPos[1] * 512)
	};
	cam.x = Math.floor(player.x / 512);				// set the camera's position
	cam.y = Math.floor(player.y / 512);
	lvlCanvas.style.transform = "translate("		// offset the level
		+ -(cam.x * plrCanvas.width) + "px,  "
		+ -(cam.y * plrCanvas.width) + "px)";
	started = false;
	buffer = true;									// if you're colliding with something on start then it should affect you immediately rather than waiting a frame
	document.getElementById("text").setAttribute("visible", true);
	console.log(started);
	gravity = 1;
}
function unwin() {
	document.getElementById("text").innerText = "press any key to start";
}
function win() {
	player = {
		x: 256 + (level.startPos[0] * 512),
		y: 256 + (level.startPos[1] * 512)
	};
	document.getElementById("text").innerText = "press any key to start (level completed)";
	reset();
	try{nextLevel();}catch{}	// runs a function so that people can implement series of levels that go to the next after you win
}
function start() {
	started = true;
	setTimeout(onFrame, ms);
	flush(lc);
	drawLevel();
	document.getElementById("text").setAttribute("visible", false);
	console.log(started);
}

function onFrame() {
	if (keys["w"] || keys["ArrowUp"]) {
		player.y -= move * Math.sign(gravity);
	} else {
		player.y += move * gravity;
	}
	if (keys["a"] || keys["ArrowLeft"]) {
		player.x -= move;
	}
	if (keys["d"] || keys["ArrowRight"]) {
		player.x += move;
	}
	if (keys["r"]) {
		reset();
	}
	pTile.x = Math.floor((player.x) / 16);						// calculate which tile the player is on
	pTile.y = Math.floor((player.y) / 16);						//		this is useful for the collision detection
	try{pTile.v = level.map[pTile.y][pTile.x];}catch (e){console.warn(e);pTile.v = 0;}	//	the type of the tile the player is on
	var posFormat = "p" + pTile.x + "," + pTile.y;
	if (level.magic.hasOwnProperty(posFormat)) {
		var spell = level.magic[posFormat];
		if (buffer) {
			if (spell[0] == "teleport") {
				player.x = spell[1][0] * 16 + (player.x % 16);
				player.y = spell[1][1] * 16 + (player.y % 16);
			}
		} else
			buffer = true;
	} else if (pTile.v != 0) {
		if (buffer) {
			if (pTile.v == "1")
				reset();
			else if (pTile.v == "3")
				gravity = -1;
			else if (pTile.v == "4")
				gravity = 1;
		} else
			buffer = true;
	} else if (buffer)
		buffer = false;
	if (pTile.v == "2")
		win();
	if (Math.floor(player.x / 512) != cam.x || Math.floor(player.y / 512) != cam.y) {
		cam.x = Math.floor(player.x / 512);
		cam.y = Math.floor(player.y / 512);
		lvlCanvas.style.transform = "translate(" + -(cam.x * plrCanvas.width) + "px,  " + -(cam.y * plrCanvas.width) + "px)";
	}
	
	if (lvlCanvas.width != Math.min(innerWidth, innerHeight)) {
		lvlCanvas.width =										// update the size
		lvlCanvas.height =										//
		plrCanvas.width =										//
		plrCanvas.height = Math.min(innerWidth, innerHeight) * 0.8;	//
		lvlContainer.style.width =
			lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";
		drawLevel();
	}
	
	flush(pc);
	
	// pc.fillStyle = "#ff0000";									// debug stuff
	// drawRect(pc, pTile.x * 16, pTile.y * 16, 16, 16, false);	// 		this fills the tile that the game thinks the player is on
	pc.fillStyle = "#000000"
	drawRect(pc, player.x % 512, player.y % 512, 8, 8);
	
	
	console.log(ms);
	timer += ms;
	timerEl.innerText = "Current Time: " + Math.floor(timer);
	if (started) 
		setTimeout(onFrame, ms);
}
setSpeed(1);
setFps(30);
var txt = document.createElement("h4");
txt.innerText = "press any key to start";
txt.className = "center";
txt.id = "text";
document.body.appendChild(txt);
var timerEl = document.createElement("p");
timerEl.innerText = "Current Time: 0";
timerEl.id = "timer";
document.body.appendChild(timerEl);
var bestEl = document.createElement("p");
bestEl.innerText = "Best Time: " + getCookie("bestTime") || "0 ms";
bestEl.id = "timer";
document.body.appendChild(bestEl);
drawLevel();
cam.x = Math.floor(player.x / 512);
cam.y = Math.floor(player.y / 512);
lvlCanvas.style.transform = "translate(" + -(cam.x * plrCanvas.width) + "px,  " + -(cam.y * plrCanvas.width) + "px)";
lvlContainer.style.width =
	lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";