/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/04 (YYYY/MM/DD)
 * last edited: 2022/03/09
 */
var pc, lc;
function loadEditor() {
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
		plrCanvas.height = Math.min(innerWidth, innerHeight) * 0.8;	// ---
	plrCanvas.className = "dotted";							// add a dotted border
															// ---
	lvlContainer.appendChild(lvlCanvas);					// 
	document.body.appendChild(lvlContainer);				// add the canvases to the document
	document.body.appendChild(plrCanvas);					// 
															// ---
	pc = plrCanvas.getContext("2d");						// 
	lc = lvlCanvas.getContext("2d");						// get their contexts
															// ---
	addMouse();					// adds mouse functionality
	var item = 0;								// the tile that the player has selected
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
		
		if (input["="]) {
			if (!buffer)
				item = (item + 1) % (colours.length + 1);
			buffer = true;
		} else if (input["-"]) {
			if (!buffer)
				item = (item - 1) % (colours.length + 1);
			if (item < 0)
				item = Math.abs(colours.length + 1 + item % (colours.length + 1));
			buffer = true;
		} else if (buffer) {
			buffer = false;
		}
		if (input["s"]) {		// set players position
			level.startPos = [cam.x, cam.y];
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
		if (cam.x == level.startPos[0] && cam.y == level.startPos[1])
			drawImg(pc, // draw to the player canvas
				sprites["timmivoq_" + Math.floor(timer * 4) % 2],	// get the sprite (changes 4 times a second)
				256, 
				256, 
			16, 16);
		if (mouse.down && mouse.x > 0 && mouse.y > 0) {
			var
				x = pTile.x + (32 * cam.x),
				y = pTile.y + (32 * cam.y);
			while (level.map.length < y + 1) {	// update level size if the level is too small
				level.map.push("");
			}
			while (level.map[y].length < x + 1) {	// update level size if the level is too small
				level.map[y] += "0";
			}
			var line = level.map[y]
			level.map[y] = line.substring(0, x) + item + line.substring(x + 1);	// set the currently selected tile to the selected tile type
			flush(lc);															// flush the level canvas
			size = getMapSize();												// update size of the level
			drawLevel();														// update the level canvas
		}
		timer += ms;
		setTimeout(onFrame, ms);
	}
	var timer = 0;
	setSpeed(1);
	setFps(30);
	setTimeout(onFrame, ms);
	var menu = document.createElement("div");
	menu.id = "menu"
	menu.innerHTML += `
	<div id="menuContents">
		<a>press the "+" key (to the left of backspace) and the "-" key to iterate through the tile types</a>
		<br><a>press the "S" key to set the player's start position</a>
		<br>
		<br><button onclick="window.location.href = 'https://ju-phump.4j89.repl.co/player/?=' + genData();">Playtest</button>
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
		<br><a id="downloadLink"></a>
		<br><br><button id="uploadButton">Upload</button>
	</div>
	<br><button id="toggleButton">hide</button>
	`;
	document.body.appendChild(menu);
	drawLevel();
	document.getElementById("exportButton").onclick = (e) => {
		document.getElementById("exportData").innerText = genData();
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
		out.setAttribute('href', 'data:text/plain,' + genData());
		out.setAttribute("download", name);
		out.innerText = name;
	}
	document.getElementById("toggleButton").onclick = function () {
		var newVal = document.getElementById("menuContents").getAttribute("visible") == "false";
		document.getElementById("menuContents").setAttribute("visible", newVal);
		document.getElementById("menu").setAttribute("transparent", !newVal);
		if (newVal)
			document.getElementById("toggleButton").innerText = "hide";
		else
			document.getElementById("toggleButton").innerText = "show";
	}
	
	
	lvlContainer.style.width =
		lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";
	
	document.getElementById("name").setAttribute("contenteditable", "plaintext-only");
	document.getElementById("name").addEventListener("input", function() {
		level.name = document.getElementById("name").innerText;
	}, false);
	document.getElementById("author").setAttribute("contenteditable", "plaintext-only");
	document.getElementById("author").addEventListener("input", function() {
		level.author = document.getElementById("author").innerText;
	}, false);
	document.getElementById("description").setAttribute("contenteditable", "plaintext-only");
	document.getElementById("description").addEventListener("input", function() {
		level.description = document.getElementById("description").innerText;
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
}