// The WebGL Canvas
var canvas;
var textCanvas;

// The WebGL Context
var gl;
var ctx;
var csel;

//Create Camera
var camera;
//Create rendering
var render;
//Model
var model;
//cidAxis
var cidAxis;
//Model json data
var bdfData;
//Mouse hover
var hover;
var selection;
//Measurements
var measure;
//Wait loader
var loader;
//animationID
var animationID;


// Cache all imagese
var imgUrls =[
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
			'/static/img/ribbon/isoView.svg',
			'/static/img/ribbon/labelIds.svg',
			'/static/img/ribbon/leftView.svg',
			'/static/img/ribbon/measure.svg',
			'/static/img/ribbon/openFile.svg',
			'/static/img/ribbon/perspectiveView.svg',
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
		];
var imgCount = 0;

window.onload = function() {
	for(let url of imgUrls){
		let img = new Image();
		img.src = url;
		img.onload = svgLoaded;
	}	
};

function svgLoaded(){
	imgCount++;
	if(imgCount == imgUrls.length){
		initH5View();
	}
}

function initH5View(){
	//Setup Global variables
	
	camera = new glCamera();
	render = new glRender();
	model = new glMesh();
	cidAxis = new $cidAxis;
	
	canvas	= document.getElementById('glCanvas3D');
	textCanvas = document.getElementById('textCanvas');
	selectCanvas = document.getElementById('selectCanvas');
		
	//init WebGL
	try {
		gl = canvas.getContext('webgl2');
		ctx = textCanvas.getContext('2d');
		csel = selectCanvas.getContext('2d');
	} catch (e) {}
	if (!gl) {
		alert('Could not initialise WebGL, sorry :-(');
		return;
	}
	
	initListerners();
	render.loadScene();
	
	hover = new glHover();
	selection = new glSelection();
	measure = new glMeasurements();
	cidAxis.init();
	
	loader = document.getElementById('initialLogo').style;
	loader.backgroundColor = 'transparent';
	loader.opacity = 1;
	loaderFade();
};

function loaderFade(){
	(loader.opacity-=.25)<0?loader.display="none":setTimeout(loaderFade, 0);
}
function loaderShow(){
	loader.opacity = 1;
	loader.display = 'flex';
}