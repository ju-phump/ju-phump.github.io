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
var series = [createLevel()];
var currLvl = 0;
function loadEditor() {
	level = series[0];
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
	addMouse();									// adds mouse functionality
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
	$.get("#exportButton").onclick = (e) => {
		$.get("#exportData").innerText = genData();
	};
	$.get("#exportMapButton").onclick = (e) => {
		$.get("#exportMapData").innerText = btoa(level.map.join('\n'));
	};
	$.get("#importMapButton").onclick = (e) => {
		try {
			level.map = atob(document.getElementById('importMapData').value).split('\n');
			size = getMapSize();
			drawLevel();
		} catch {
			window.alert("Invalid Map Data");
		}
	};
	$.get("#importFileData").oninput = function () {
		var file = this.files[0];
		file.text()
			.then((data) => {
				window.location.href = 'https://ju-phump.4j89.repl.co/editor/?=' + data;
			});
	}
	$.get("#downloadButton").onclick = function () {
		var out = $.get("#downloadLink"), name = level.name.replace(/[^0-9A-z]/g, "_") + ".b64";
		out.setAttribute('href', 'data:text/plain,' + genData());
		out.setAttribute("download", name);
		out.innerText = name;
	}
	$.get("#toggleButton").onclick = function () {
		var newVal = $.get("#menuContents").getAttribute("visible") == "false";
		$.get("#menuContents").setAttribute("visible", newVal);
		$.get("#menu").setAttribute("transparent", !newVal);
		if (newVal)
			$.get("#toggleButton").innerText = "hide";
		else
			$.get("#toggleButton").innerText = "show";
	}
	
	
	lvlContainer.style.width =
		lvlContainer.style.height = Math.min(innerWidth, innerHeight) * 0.8 + "px";
	
	$.get("#name").setAttribute("contenteditable", "true");
	$.get("#name").addEventListener("input", function() {
		level.name = $.get("#name").innerText;
	}, false);
	$.get("#author").setAttribute("contenteditable", "true");
	$.get("#author").addEventListener("input", function() {
		level.author = $.get("#author").innerText;
	}, false);
	$.get("#description").setAttribute("contenteditable", "true");
	$.get("#description").addEventListener("input", function() {
		level.description = $.get("#description").innerText;
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

	var seriesMenu = document.createElement("div");
	seriesMenu.id = "seriesMenu";
	seriesMenu.innerHTML = `
 		<h4>Series Settings</h4>
   		<p>Name: <a id="seriesName">Nameless</a></p>
	 	<p>Author: <a id="seriesAuthor">Unknown</a></p>
	 	<p>Description: <a id="seriesDesc">No Description</a></p>
 		<button id="prevLvl">&lt;</button> <a id="levelText">Level 1/1</a> <button id="nextLvl">&gt;</button><br>
   		<button id="addLvl">Add</button>
   		<button id="delLvl">Delete</button>
		<button id="exportSeries">Copy Series Data</button>
  	`;
	document.body.appendChild(seriesMenu);
	$.get("#nextLvl").onclick = function () {
		series[currLvl] = Object.assign({}, level);
		currLvl++;
		currLvl %= series.length;
		$.get("#levelText").innerText = `Level ${currLvl + 1}/${series.length}`;
		level = series[currLvl];
	}
	$.get("#prevLvl").onclick = function () {
		currLvl--;
		while (currLvl < 0)
			currLvl = series.length + currLvl;
		$.get("#levelText").innerText = `Level ${currLvl + 1}/${series.length}`;
		level = series[currLvl];
	}
	$.get("#addLvl").onclick = function () {
		series.insert(currLvl++, createLevel());
		$.get("#levelText").innerText = `Level ${currLvl + 1}/${series.length}`;
		level = series[currLvl];
	}
	$.get("#delLvl").onclick = function () {
		if (series.length <= 1)
			return alert("Series needs at least one level");
		if (!confirm("Are you sure you want to delete this level? (this cannot be undone)"))
			return;
		delete series[currLvl];
		series = series.filter(function(e){ return e === 0 || e });
		currLvl--;
		while (currLvl < 0)
			currLvl = series.length + currLvl;
		$.get("#levelText").innerText = `Level ${currLvl + 1}/${series.length}`;
		level = series[currLvl];
	}
	$.get("#exportSeries").onclick = function () {
		// Get the text field
		var copyText = $.get("#exportSeries");
		
		// Select the text field
		copyText.select();
		copyText.setSelectionRange(0, 99999); // For mobile devices
		
		// Copy the text inside the text field
		navigator.clipboard.writeText(genSeriesData(series));
		$.get("#exportSeries").innerText = "Copied!";
	}
	
	$.get("#exportSeries").onmouseout = function () {
		$.get("#exportSeries").innerText = "Copy Series Data";
	}
	$.get("#seriesName").setAttribute("contenteditable", "true");
	$.get("#seriesName").oninput = function() {
		series.name = $.get("#seriesName").innerText;
	};
	$.get("#seriesAuthor").setAttribute("contenteditable", "true");
	$.get("#seriesAuthor").oninput = function() {
		series.author = $.get("#seriesAuthor").innerText;
	};
	$.get("#seriesDesc").setAttribute("contenteditable", "true");
	$.get("#seriesDesc").oninput = function() {
		series.author = $.get("#seriesDesc").innerText;
	};
	var editables = $.all("*[contenteditable=\"true\"]");
	[].forEach.call(editables, el => {
		el.paste = function (e) {
			e.preventDefault();
			var text = e.clipboardData.getData("text/plain").replace("&", "&amp;").replace("<", "&gt;").replace(">", "&lt;");
			console.log(text);
			document.execCommand("insertText", false, text);
			
		};
	});
	console.log(editables);
}