/* yes this is under GPL v3.0
 * 
 * yes this code sucks
 * unfortunately i don't care
 *
 * code by Dante Davis
 *     started: 2022/03/13 (YYYY/MM/DD)
 * last edited: 2022/03/15
 */
document.body.innerHTML = `
<textarea id="data"></textarea>
<br><button id="comp">Compress</button><button id="decomp">Decompress</button>
<br>
<br><textarea id="out" readonly>Output goes here</textarea>
`;
document.getElementById("comp").onclick = function () {
	document.getElementById("out").innerText = btoa(mapCompress(atob(document.getElementById("data").value).split("\n")));
}
document.getElementById("decomp").onclick = function () {
	document.getElementById("out").innerText = btoa(mapDecompress(atob(document.getElementById("data").value)).join("\n"));
}