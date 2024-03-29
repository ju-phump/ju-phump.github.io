/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/05 (YYYY/MM/DD)
 * last edited: 2022/03/13
 */

/* compression stuff */

// convert number to base 32, used for tiles that repeat
function to32(n) {
	var digits = "abcdefghijklmnopqrstuvwxyzABCDEF"
	var r = "";
	while (n) {
		r += digits[n % 32];
		n = Math.floor(n / 32);
	}
	return r || "a";
}
function from32(n) {
	var digits = "abcdefghijklmnopqrstuvwxyzABCDEF"
	var r = 0;
	var multiplier = 1;
	var len = n.length;
	for (var i = 0; i < len; i++) {
		r += digits.indexOf(n[i]) * multiplier;
		multiplier *= 32;
	}
	return r;
}
// compresses map data
function mapCompress(data) {
	
	var processed = data.join("\n");
	processed = processed			// simple garbage removal
		.replace(/0+$/gm, "")		// removes 0s at the end of rows
		.replace(/\n+$/g, "");		// removes blank rows below the level
	var len = processed.length;
	var i = 0;
	var compressed = "";
	while (i < len) {		// run through the processed map data
		var c = processed[i];
		var amt = 0;
		if ("0123456789".includes(c)){
			while (c == processed[i]) {		// counts how many tiles of the same type show up in a row
				i++;
				amt++;
			}
			if (processed[i] == "\n" && c == "0")
				continue;
			if (amt > 2)			// if the number of similar tiles is 2 or under, then we won't be saving any space by compressing it.
				compressed += c + to32(amt - 3);	// note: we subtract 3 because we know that we aren't compressing any number less than 3
			else
				compressed += c.repeat(amt);
		} else {
			if (c == "\n")
				compressed += c;
			else
				compressed += "0";
			i++;
		}
	}
	compressed = compressed			// simple garbage removal (again, just in case we've produced more garbage)
		.replace(/0+$/gm, "")		// removes 0s at the end of rows
		.replace(/\n+$/g, "");		// removes blank rows below the level
	var final = "";
	compressed = compressed.split("\n");
	var len = compressed.length;
	for (var i = 0; i < len; i) {
		var row = compressed[i];
		var amt = 0;
		while (i < len && row == compressed[++i])
			amt++;
		if (amt > 0)	// if multiple rows are in the same place then compress them
			final += row + ";" + to32(amt - 1) + "\n";
		else
			final += row + "\n";
	}
	return final;
}
function mapDecompress(final) {
	final = final.split("\n")
	var compressed = [];
	var len = final.length;
	var temp = "";
	for (var i = 0; i < len; i++) {
		var row = final[i].split(";");
		if (row.length > 1) 
			compressed.push(...(Array(from32(row[1]) + 2).fill(row[0])))
		else
			compressed.push(row[0]);
	}
	compressed = compressed.join("\n");
	console.log(compressed);
	var data = "";
	var len = compressed.length;
	var temp = "";
	for (var i = 0; i < len; i++) {
		if ("0123456789\n".includes(compressed[i])) {
			temp = compressed[i];
			var number = "";
			while ("abcdefghijklmnopqrstuvwxyzABCDEF".includes(compressed[++i]))	// extract the base32 number following the tile ty[e] (if there is one)
				number += compressed[i];
			if (number == "")		// if there isn't any base32 number after the tile type, then just add the tile type once
				data += temp;
			else					// if there is a base32 number telling us the amount of the tile we want, then add that many instances of it
				data += temp.repeat(from32(number) + 3);	// note: we add 3 because we know that we aren't compressing any number less than 3
			i--;
		}
	}
	data = data			// simple garbage removal
		.replace(/0+$/gm, "")		// removes 0s at the end of rows
		.replace(/\n+$/g, "");		// removes blank rows below the level
	return data.split("\n");
}

/* Unicode to Base64 */
	/* used for encoding level names, authors, and descriptions. This is so that the vast majority of languages are supported. */
function toB64(string) { // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
	const codeUnits = new Uint16Array(string.length);
	for (let i = 0; i < codeUnits.length; i++) {
		codeUnits[i] = string.charCodeAt(i);
	}
	return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}
/* Base64 to Unicode */
	/* used for decoding level names, authors, and descriptions. This is so that the vast majority of languages are supported. */
function fromB64(encoded) {
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

/* Generate Level Data */
	/* used to generate a base64 string that can be used to encode level data */
function genData() {
	var data = Object.assign({}, level);		// create a copy of the level data (to avoid modifying the original data)
	data.name = toB64(data.name);
	data.author = toB64(data.author);
	data.description = toB64(data.description);
	data.map = mapCompress(data.map);				// compress the map data, removes garbage and makes the overall size way smaller
	return btoa(JSON.stringify(data));
}
/* Generate Series Data */
	/* used to generate a base64 string that can be used to encode series data */
function genSeriesData() {
	var data = Object.assign({}, series);		// create a copy of the series data (to avoid modifying the original data)
	var len = data.content.length;
	var lvls = data.content;
	for (var i = 0; i < len; i++) {
		var o = cont[i];
		data.content[i].name = toB64(o.name);
		data.content[i].author = toB64(o.author);
		data.content[i].description = toB64(o.description);
		data.content[i].map = mapCompress(o.map);				// compress the map data, removes garbage and makes the overall size way smaller
	}
	data.name = toB64(data.name);
	data.author = toB64(data.author);
	data.description = toB64(data.description);
	return btoa(JSON.stringify(data));
}
function loadData(src) {
	var data = 
			JSON.parse(atob(src));
	level.map = mapDecompress(data.map);	// decompress map (should work with uncompressed levels aswell)
	level.magic = data.magic;
	level.name = fromB64(data.name);
	level.author = fromB64(data.author);
	level.description = fromB64(data.description);
	level.startPos = data.startPos;
}
function setCookie(cname, cvalue) {
	document.cookie = cname + "=" + cvalue + ";path=/";
}
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
function getLevelCookie(name) {
	const cname = name;
	function getC(name) {
		var c = getCookie(name);
		let defaultVal = `{"bestTime": "N/A", "completions": 0, "bestDeaths": "N/A", "totalDeaths": 0}`;
		if (c == "") 
			setCookie(name, defaultVal);
		try {
			c = atob(c);
			c = JSON.parse(c);
		} catch {
			setCookie(name, btoa(defaultVal));
			c = JSON.parse(defaultVal);
		}
		console.log(c);
		return c;
	}
	return new (class LvlCookie {
		#bestTime = "N/A";
		#completions = 0;
		#bestDeaths = "N/A";
		#totalDeaths = 0;
		constructor(name) {
			var c = getC(name);
			this.cname = name;
			this.#bestTime = c.bestTime;
			this.#completions = c.completions;
			this.#bestDeaths = c.bestDeaths;
			this.#totalDeaths = c.totalDeaths;
		}
		set bestTime (v) {
			var c = getC(this.cname);
			c.bestTime = v;
			setCookie(this.cname, btoa(JSON.stringify(c)));
			this.#bestTime = v;
		}
		set completions (v) {
			var c = getC(this.cname);
			c.completions = v;
			setCookie(this.cname, btoa(JSON.stringify(c)));
			this.#completions = v;
		}
		set bestDeaths (v) {
			var c = getC(this.cname);
			c.bestDeaths = v;
			setCookie(this.cname, btoa(JSON.stringify(c)));
			this.#bestDeaths = v;
		}
		set totalDeaths (v) {
			var c = getC(this.cname);
			c.totalDeaths = v;
			setCookie(this.cname, btoa(JSON.stringify(c)));
			this.#totalDeaths = v;
		}
		get bestTime () {
			return this.#bestTime;
		}
		get completions () {
			return this.#completions;
		}
		get bestDeaths () {
			return this.#bestDeaths;
		}
		get totalDeaths () {
			return this.#totalDeaths;
		}
		completed() {
			var c = getC(this.cname);
			c.completions++;
			setCookie(this.cname, btoa(JSON.stringify(c)));
			this.#completions = c.completions;
		}
	})(name);
}
function flush(c) {
	c.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
function drawRect(c, x, y, w, h, center = true) {
	var ratio = document.getElementById("plr").width / 512;
	x *= ratio;
	y *= ratio;
	w *= ratio;
	h *= ratio;
	if (center)
		c.fillRect(x - (w/2), y - (h/2), w, h);
	else
		c.fillRect(x, y, w, h);
}
function drawImg(c, img, x, y, w, h, center = true) {
	var ratio = document.getElementById("plr").width / 512;
	x *= ratio;
	y *= ratio;
	w *= ratio;
	h *= ratio;
	if (center)
		c.drawImage(img, x - (w/2), y - (h/2), w, h);
	else
		c.drawImage(img, x, y, w, h);
}
function getMapSize() {
	var rows = level.map.length;
	var size = [0, rows];
	for (var y = 0; y < rows; y++) {
		var cols = level.map[y].length;
		for (var x = 0; x < cols; x++) {
			if (x > size[0])
				size[0]++;
		}
	}
	return size;
}
function drawLevel() {
	var ratio = document.getElementById("plr").width / 512;
	var rows = size[1];
	document.getElementById("lvl").width = (size[0] * 16 + 16) * ratio;
	document.getElementById("lvl").height = (size[1] * 16 + 16) * ratio;
	for (var y = 0; y < rows; y++) {
		var r = level.map[y];
		var cols = r.length;
		for (var x = 0; x < cols; x++){
			if (r[x] == "0")
				continue;
			lc.fillStyle = colours[r[x] - 1];
			drawRect(lc, x * 16, y * 16, 17, 17, false);
		}
	}
}
var colours = [
	"#000000",
	"#00ff00",
	"#ffff00",
	"#00ffff",
	"#ff0000"
];
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
	return this;
};
createLevel = function () {
	return {
		"name": "",
		"author": "",
		"description": "",
		"startPos": [0,0],
		"map": [
			"11111111111111111111111111111111",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"10000000000000000000000000000001",
			"11111111111111111111111111111111"
		],
		"magic": {}
	}
};
var level = createLevel();
function urlLevelLoad() {
	var url = window.location.href.split("?=")
	if (url.length > 1) {
		try {
			loadData(url[1]);
		} catch (exception) {window.alert("invalid level data")}
	}
}
var sprites = {
	"timmivoq_0": "/img/timmivoq0.png",
	"timmivoq_1": "/img/timmivoq1.png"
};
for (i in sprites) {
	var img = new Image();
	img.src = sprites[i];
	sprites[i] = img;
}
document.body.innerHTML += `
<div id="lvlInfo">
	<h1 id="name">${level.name || "Nameless"}</h1>
	<h3>By <a id="author">${level.author || "Unknown"}</a></h3>
	<p id="description">${level.description || "No Description"}</p>
</div>
`;
function loadInfo(lvlInfo) {
	document.getElementById("lvlInfo").innerHTML = `
		<h1 id="name">${level.name || "Nameless"}</h1>
		<h3>By <a id="author">${level.author || "Unknown"}</a></h3>
		<p id="description">${level.description || "No Description"}</p>
 	`;
	return;
}
var size = getMapSize();
var input = {};
document.onkeydown = (e) => {
	if (!input[e.key])
		input[e.key] = 1;
}
document.onkeyup = (e) => {
	input[e.key] = 0;
}
var mouse = {
	x: 0,
	y: 0,
	down: false
};
function addMouse() {
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
}
Server = class {
	constructor(location) {
		this.location = location;
	}
	getList(request, callback) {
		var ws = new WebSocket(this.location);
		var c = callback, r = request;
		ws.onmessage = function (e) {
			var response = e.data;
			if (response == "list not found" || response == "server error") {
				window.alert(response);
				return;
			}
			console.log(response);
			var data = 
					JSON.parse(response);
			c(data);
		};
		ws.onopen = function (e) {
			ws.send(`list:${r}`);
		};
		return ws;
	}
	getLevel(id, callback) {
		var ws = new WebSocket(this.location);
		var c = callback;
		ws.onmessage = function (e) {
		    var response = e.data;
			if (response == "level not found" || response == "server error") {
				window.alert(response);
				return;
			}
			cookie = getLevelCookie("level" + id);
			var data = 
					JSON.parse(response);
			var level = {};
			console.log(data);
			level.map = mapDecompress(data.map.join("\n"));
			level.magic = data.magic;
			level.name = fromB64(data.name);
			level.author = fromB64(data.author);
			level.description = fromB64(data.description);
			level.startPos = data.startPos;
			c(level);
		};
		var id = id;
		ws.onopen = function (e) {
			if (id != -1)
				ws.send("level:" + id);
			console.log("entering");
		};
		ws.onclose = function (e) {
			if (e.code == 1006)
				window.alert("server unreachable");
		};
		return ws;
	}
	getSeries(id, callback) {
		var c = callback;
		var id = id;
		ws.onmessage = function (e) {
		    var response = event.data;
			if (response == "series not found" || response == "server error" || response.startsWith("invalid")) {
				window.alert(response);
				return;
			}
			cookie = getLevelCookie("series" + id);
			bestDeathsEl.innerText = "Personal Death Record: " + cookie.bestDeaths;
			bestTimeEl.innerText = "Best Time: " + cookie.bestTime;
			var data = 
					JSON.parse(response);
			c(data);
		};
		ws.onopen = function (e) {
			if (id != -1)
				ws.send("series:" + id);
		};
		ws.onclose = function (e) {
			if (e.code == 1006)
				window.alert("server unreachable");
		};
		return ws;
	}
	uploadLevel(data) {
	    var ws = new WebSocket(this.location);
	    ws.onopen = function (e) {
	        ws.send("uploadlvl:" + data);
	    };
	    ws.onmessage = function (e) {
	        var msg = e.data;
			if (msg == "server overloaded") {
				window.alert("upload failed: server is overloaded");
			} else if (msg == "invalid level data") {
				window.alert("upload failed: invalid level data");
			} else if (msg.endsWith("in the queue")) {
				document.body.innerHTML = `
					<center>
						<h1>Upload a Level to the Servers</h1>	
					  	<h3>Success!</h3>
		   				<p>you are ${msg}</p>
					</center>
					`;
				window.alert("upload success, you are " + msg);
			} else if (msg == "server error") {
				window.alert("upload failed: server error");
			} else {
				window.alert("unknown server response");
			}
	    };
		ws.onclose = function (e) {
			if (e.code == 1006)
				window.alert("server unreachable");
		};
	    return ws;
	}
}

$ = {
	"get": function (query) {
		return document.querySelector(query);
	},
	"all": function (query) {
		return document.querySelectorAll(query);
	}
};
var cookie = null;