/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/04 (YYYY/MM/DD)
 * last edited: 2022/03/07
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

document.onkeydown = (e) => {
	keys[e.key] = true;
	
}
document.onkeyup = (e) => {
	keys[e.key] = false;
}
plrCanvas.onmousemove = (e) => {
	var a = Math.min(plrCanvas.width, plrCanvas.height);
	var ratio = 512 / a;
	var rect = e.target.getBoundingClientRect();
  	var x = e.clientX - rect.left; //x position within the element.
  	var y = e.clientY - rect.top;  //y position within the element.
	mouse.x = x * ratio;
	mouse.y = y * ratio;
}
plrCanvas.onmousedown = (e) => {
	mouse.down = true;
}
plrCanvas.onmouseup = (e) => {
	mouse.down = false;
}
var mouse = {
	x: 0,
	y: 0,
	down: false
};
var item = 0;
var speed = 1;								// how fast the game should run
var ms = 0;									// the delay in miliseconds between each frame
var move = (128 * speed) * (ms / 1000);		// tells the player how many pixels it should move

var 
	player = {			// the player's position
		x: 256,
		y: 256
	},
	pTile = {			// which tile the player is currently on
		x: 0,
		y: 0,
		v: 0
	},
	gravity = 1;		// the gravity on the player (positive = down, negative = up)

var keys = {};		// what keys are being pressed
var buffer = false;
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

function onFrame() {
	pTile = {
		x: Math.floor(mouse.x / 16),
		y: Math.floor(mouse.y / 16)
	};
	
	if (keys["="]) {
		if (!buffer)
			item = (item + 1) % (colours.length + 1);
		buffer = true;
	} else if (keys["-"]) {
		if (!buffer)
			item = Math.abs((item - 1) % (colours.length + 1));
		buffer = true;
	} else if (buffer) {
		buffer = false;
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
	pc.fillStyle = item > 0? colours[item - 1]: "#ffffff";
	drawRect(pc, 
		pTile.x * 16, 
		pTile.y * 16, 
	16, 16, false);
	pc.fillStyle = "#000000";
	drawRect(pc, 
		256, 
		256, 
	8, 8);
	if (mouse.down && mouse.x > 0 && mouse.y > 0) {
		var 
			x = pTile.x + (32 * cam.x),
			y = pTile.y + (32 * cam.y);
		while (level.map.length < y) {
			level.map.append("");
		}
		while (level.map[y].length < x) {
			level.map[y] += "0";
		}
		level.map[y] = `${level.map[y].substring(0, x)}${item}${level.map[y].substring(x + 1)}`;
		flush(lc);
		size = getMapSize();
		drawLevel();
	}
	setTimeout(onFrame, ms);
}
setSpeed(1);
setFps(30);
setTimeout(onFrame, ms);
var menu = document.createElement("div");
menu.innerHTML += `
<p>press the + key (to the left of backspace) and the - key to iterate through the tiles</p>
<br><button onclick="window.location.href = 'https://ju-phump.4j89.repl.co/player/?=' + toB64(JSON.stringify(level));">Playtest</button>
<br>
<br><textarea id="importMapData"></textarea>
<br><button id="importMapButton">Import Map</button>
<br>
<br><button id="exportMapButton">Export Map</button>
<br><textarea id="exportMapData"></textarea>
<br>
<br><button id="exportButton">Export Data</button>
<br><textarea id="exportData"></textarea>
<br><p>Import File:</p>
<input type="file" id="importFileData" name="filename">
<br>
<br><button id="downloadButton">Export File</button>
<a id="downloadLink"><p></p></a>
`;
document.body.appendChild(menu);
drawLevel();
document.getElementById("exportButton").onclick = (e) => {
	document.getElementById("exportData").innerText = toB64(JSON.stringify(level));
};
document.getElementById("exportMapButton").onclick = (e) => {
	document.getElementById("exportMapData").innerText = btoa(level.map.join('\n'));
};
document.getElementById("importMapButton").onclick = (e) => {
	try {
		level.map = atob(document.getElementById('importMapData').value).split('\n');
		size = getMapSize();
		drawLevel();
	} catch {
		window.alert("Invalid Map Data");
	}
};
document.getElementById("importFileData").oninput = function () {
	var file = this.files[0];
	file.text()
		.then((data) => {
			window.location.href = 'https://ju-phump.4j89.repl.co/editor/?=' + data;
		});
}
document.getElementById("downloadButton").onclick = function () {
	var out = document.getElementById("downloadLink"), name = level.name.replace(/[^0-9A-z]/g, "_") + ".b64";
	out.setAttribute('href', 'data:text/plain,' + toB64(JSON.stringify(level)));
	out.setAttribute("download", name);
	out.innerText = name;
}
lvlContainer.style.width =
	lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";

document.getElementById("name").setAttribute("contenteditable", "plaintext-only");
document.getElementById("name").addEventListener("input", function() {
	level.name = document.getElementById("name").innerText;
}, false);
var cam = {x:0,y:0}
var hScroll = document.createElement("input");
hScroll.type = "range";
hScroll.min = "0";
hScroll.max = "10"; 
hScroll.value = "0";
hScroll.id = "hScroll";
hScroll.className = "scroll";
hScroll.oninput = function() {
	cam.x = this.value;
		lvlCanvas.style.transform = "translate(" + -(cam.x * plrCanvas.width) + "px,  " + -(cam.y * plrCanvas.width) + "px)";
}
document.body.appendChild(hScroll);
var vScroll = document.createElement("input");
vScroll.type = "range";
vScroll.min = "0";
vScroll.max = "10"; 
vScroll.value = "0";
vScroll.id = "vScroll";
vScroll.className = "scroll";
vScroll.oninput = function() {
	cam.y = this.value;
		lvlCanvas.style.transform = "translate(" + -(cam.x * plrCanvas.width) + "px,  " + -(cam.y * plrCanvas.width) + "px)";
}
document.body.appendChild(vScroll);
