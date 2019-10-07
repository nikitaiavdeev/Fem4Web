// The WebGL Canvas
var canvas = null;
var textCanvas = null;

// The WebGL Context
var gl = null;
var ctx = null;
var csel = null;

//Create Camera
var camera = null;
//Create rendering
var render = null;
//Model
var model = null;
//cidAxis
var cidAxis = null;
//Model json data
var bdfData = null;
//Mouse hover
var hover = null;
var selection = null;
//Measurements
var measure = null;
//Wait loader
var loader = null;
//animationID
var animationID = null;

// Cache all imagese
window.onload = function () {
	let imgUrls = [
			'/static/img/build_status.svg',
			'/static/img/Logo.svg',
			'/static/img/ribbon/backView.svg',
			'/static/img/ribbon/bottomView.svg',
			'/static/img/ribbon/compass.svg',
			'/static/img/ribbon/crossSection.svg',
			'/static/img/ribbon/deform.svg',
			'/static/img/ribbon/fitView.svg',
			'/static/img/ribbon/fringe.svg',
			'/static/img/ribbon/frontView.svg',
			'/static/img/ribbon/help.svg',
			'/static/img/ribbon/import.svg',
			'/static/img/ribbon/import_bdf.svg',
			'/static/img/ribbon/import_csv.svg',
			'/static/img/ribbon/import_ses.svg',
			'/static/img/ribbon/isoView.svg',
			'/static/img/ribbon/labelIds.svg',
			'/static/img/ribbon/leftView.svg',
			'/static/img/ribbon/measure.svg',
			'/static/img/ribbon/openFile.svg',
			'/static/img/ribbon/toggleBackground.svg',
			'/static/img/ribbon/properties.svg',
			'/static/img/ribbon/rightView.svg',
			'/static/img/ribbon/settings.svg',
			'/static/img/ribbon/shadedRander.svg',
			'/static/img/ribbon/showHide.svg',
			'/static/img/ribbon/shrinkElements.svg',
			'/static/img/ribbon/toggleEdges.svg',
			'/static/img/ribbon/toggleNodes.svg',
			'/static/img/ribbon/topView.svg',
			'/static/img/ribbon/transparentRander.svg',
			'/static/img/ribbon/wireframeRander.svg',
			'/static/img/gui/checked.svg',
			'/static/img/gui/close.svg',
			'/static/img/gui/eye.svg',
			'/static/img/gui/hide.svg',
			'/static/img/gui/search.svg',
			'/static/img/gui/toggleTree.svg'
		],
		imgCount = 0,
		len = imgUrls.length;
	for (const url of imgUrls) {
		let img = new Image();
		img.src = url;
		img.onload = () => {
			if (++imgCount == len) {
				initH5View();
			}
		};
	}
};

function initH5View() {
	//Init Canvases
	canvas = document.getElementById('glCanvas3D'); //WebGL2 canvas
	textCanvas = document.getElementById('textCanvas');
	selectCanvas = document.getElementById('selectCanvas');

	//init WebGL
	try {
		gl = canvas.getContext('webgl2');
		ctx = textCanvas.getContext('2d');
		csel = selectCanvas.getContext('2d');
	} catch (e) {
		alert('Could not initialise WebGL, sorry :-(\n' + e);
		return;
	}
	if (!gl) {
		alert('Could not initialise WebGL, sorry :-(');
		return;
	}

	//Setup Global variables
	camera = new $glCamera();
	render = new $glRender();
	cidAxis = new $cidAxis();
	hover = new $glHover();
	selection = new $glSelection();
	measure = new $glMeasurements();

	//Init moouse and keyboard listeners
	initListeners();

	//First draw
	reportWindowSize();
	render.drawScene();

	loader = document.getElementById('initialLogo').style;
	loader.backgroundColor = 'transparent';
	loader.opacity = 1;
	loaderFade();
}

function loaderFade() {
	if ((loader.opacity -= 0.25) < 0)
		loader.display = "none";
	else
		setTimeout(loaderFade, 0);
}

function loaderShow() {
	loader.opacity = 1;
	loader.display = 'flex';
}