/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/04 (YYYY/MM/DD)
 * last edited: 2022/03/27
 */
var pc, lc;
var practice = {
	"active": false,
	"checkpoint": {
		"x": 0,
		"y": 0,
		"gravity": 1
	}
};
var inputBuffer = {};
var bestTimeEl, timerEl;
function setFps(v) {						// sets the framerate
	ms = Math.floor(1000 / v);
	move = (128 * speed) * (ms / 1000);
}
function setSpeed(v) {					// sets the speed of the game (maintains fps and changes movement)
	speed = v;
	move = (128 * speed) * (ms / 1000);
}
function setFrameSpeed(fps, spd) {		// sets the speed of the game (maintains movement and changes fps)
	ms = Math.floor(1000 / fps / spd);
	move = (128 * speed) * (ms / 1000) * spd;
}
function unwin() {
	$.get("#text").innerText = "press any key to start";
}
function win() {
	$.get("#text").innerText = "press any key to start (level completed)";
	reset();
	try{nextLevel();}catch{}	// runs a function so that people can implement series of levels that go to the next after you win
}
function start() {
	started = true;
	lastFrame = performance.now();
	setTimeout(onFrame, ms);
	flush(lc);
	size = getMapSize();
	drawLevel();
	$.get("#text").setAttribute("visible", false);
	$.get("#lvlInfo").setAttribute("visible", false);
	console.log(started);
}
function die() {
	deaths++;
	deathsEl.innerText = "Deaths: " + deaths;
	reset();
}
function reset() {
	if (practice.active) {
		player = {
			x: practice.checkpoint.x,
			y: practice.checkpoint.y
		};
		gravity = practice.checkpoint.gravity;
	}
	else {
		player = {
			x: 256 + (level.startPos[0] * 512),
			y: 256 + (level.startPos[1] * 512)
		};
		gravity = 1;
	}
	cam.x = Math.floor(player.x / 512);				// set the camera's position
	cam.y = Math.floor(player.y / 512);
	lvlCanvas.style.transform = "translate("		// offset the level
		+ -(cam.x * plrCanvas.width) + "px,  "
		+ -(cam.y * plrCanvas.width) + "px)";
	started = false;
	buffer = true;									// if you're colliding with something on start then it should affect you immediately rather than waiting a frame
	$.get("#text").setAttribute("visible", true);
	$.get("#lvlInfo").setAttribute("visible", true);
	console.log(started);
}
var lastCheck = 0;
var frames = 0;
var secondTimer = 0;
function onFrame() {

	var delta = performance.now() - lastFrame;		// get the true delay between frames
	var adjust = ms / delta;
	
	frames++;
	secondTimer += delta;
	var timerSecond = Math.floor(timer / 1000);
	if (timerSecond > lastCheck) {
		lastCheck = timerSecond;
		$.get("#fps").innerText = ((1000 * frames) / secondTimer).toFixed(2);
		frames = 0;
		secondTimer = 0;
	}

	
	if (input["w"] || input["ArrowUp"]) {
		player.y -= move * Math.sign(gravity) * adjust;
	} else {
		player.y += move * gravity * adjust;
	}
	if (input["a"] || input["ArrowLeft"]) {
		player.x -= move * adjust;
	}
	if (input["d"] || input["ArrowRight"]) {
		player.x += move * adjust;
	}
	if (input["r"]) {
		reset();
	}
	if (practice.active) {
		if (input["z"] || input[","])
			practice.checkpoint = {
				"x": player.x,
				"y": player.y,
				"gravity": gravity
			};
		if (mouse.down)
			practice.checkpoint = {
				"x": (Math.floor(mouse.x / 16) + (32 * cam.x)) * 16,
				"y": (Math.floor(mouse.y / 16) + (32 * cam.y)) * 16,
				"gravity": gravity
			};
	}
	if (input["x"] || input["."]) {
		if (!inputBuffer[".x"]) {
			window.alert("practice mode is now " + (practice.active = !practice.active));
			reset();
		}
		inputBuffer[".x"] = true;
	} else if (inputBuffer[".x"]) {
		inputBuffer[".x"] = false;
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
				die();
			else if (pTile.v == "3")
				gravity = -1;
			else if (pTile.v == "4")
				gravity = 1;
			else if (pTile.v == "5")
				for (i in input)
					if (input[i] == 1)
						die();
		} else
			buffer = true;
	} else if (buffer)
		buffer = false;
	if (pTile.v == "2") {
		if (practice.active)
			reset();
		else
			win();
	}
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
		size = getMapSize();
		drawLevel();
	}
	
	flush(pc);
	
	// pc.fillStyle = "#ff0000";									// debug stuff
	// drawRect(pc, pTile.x * 16, pTile.y * 16, 16, 16, false);	// 		this fills the tile that the game thinks the player is on
	pc.fillStyle = "#000000"
	drawImg(pc, // draw to the player canvas
			sprites["timmivoq_" + Math.floor(timer / 10) % 2],	// get the sprite (changes 10 times a second)
			player.x % 512,
			player.y % 512,
	16, 16);
	
	
	console.log(ms);
	console.log(delta);
	timer += delta;
	timerEl.innerText = "Current Time: " + Math.floor(timer);
	for (i in input)
		if (input[i])
			input[i]++;
	if (started) 
		setTimeout(onFrame, ms);
	lastFrame = performance.now();
}
var speed = 1;								// how fast the game should run
var ms = 0;									// the intended delay in miliseconds between each frame
var lastFrame = 0;							// the timestamp of the last frame
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
var buffer = true;		// so that we can be very nice to the player (all collisions excluding the one with green tiles give you a frame before they actually happen)
var timer = 0;
function loadPlayer() {
	player = {			// the player's position
		x: 256 + (level.startPos[0] * 512),
		y: 256 + (level.startPos[1] * 512)
	};
	practice.checkpoint = {
		"x": 256 + (level.startPos[0] * 512),
		"y": 256 + (level.startPos[1] * 512),
		"gravity": 1
	}
	lvlContainer = document.createElement("div")		// container for the level canvas
	plrCanvas = document.createElement("canvas");		// the canvas where the player is drawn
	lvlCanvas = document.createElement("canvas");		// the canvas where the level is drawn
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
	pc = plrCanvas.getContext("2d");					// 
	lc = lvlCanvas.getContext("2d");					// get their contexts
															// ---
	addMouse();
	started = false;
	document.addEventListener("keydown", function(e) {
		if (!started) 		// the game only begins once you press a button
			start();
	});
	setSpeed(1);
	setFps(30);
	var txt = document.createElement("h4");
	txt.innerText = "press any key to start";
	txt.className = "center";
	txt.id = "text";
	document.body.appendChild(txt);
	
	fpsEl = document.createElement("p");
	fpsEl.innerText = "0";
	fpsEl.id = "fps";
	document.body.appendChild(fpsEl);
	timerEl = document.createElement("p");
	timerEl.innerText = "Current Time: 0";
	timerEl.id = "timer";
	document.body.appendChild(timerEl);
	bestTimeEl = document.createElement("p");
	bestTimeEl.innerText = "Best Time: N/A";
	bestTimeEl.id = "bestTime";
	document.body.appendChild(bestTimeEl);
	deathsEl = document.createElement("p");
	deathsEl.innerText = "Deaths: 0";
	deathsEl.id = "Deaths";
	document.body.appendChild(deathsEl);
	bestDeathsEl = document.createElement("p");
	bestDeathsEl.innerText = "Personal Death Record: N/A";
	bestDeathsEl.id = "bestDeaths";
	document.body.appendChild(bestDeathsEl);
	
	cam.x = Math.floor(player.x / 512);
	cam.y = Math.floor(player.y / 512);
	lvlCanvas.style.transform = "translate(" + -(cam.x * plrCanvas.width) + "px,  " + -(cam.y * plrCanvas.width) + "px)";
	lvlContainer.style.width =
		lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";
	loadInfo({
		"name": level.name,
		"author": level.author,
		"description": level.description
	});
	size = getMapSize();
	drawLevel();
}
var deaths = 0;