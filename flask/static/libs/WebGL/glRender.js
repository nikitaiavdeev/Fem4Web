var glRenderStyle = {
	SHADED : 0,
	FLAT : 1,
	TRANSPARENT : 2,
	WIREFRAME : 3,
};

function glRender(){
	this.howShow = glRenderStyle.SHADED;
	
	this.showNodes = false;
	this.nodeSize = 5.0;
	this.nodeSelectSize = 20.0;
	this.nodeHoverSize = 10.0;
	
	this.showEdges = true;
	this.edgeThickness = 0.7;
	
	this.shrink = false;
	this.shrinkLevel = 0.1;
	
	this.light = new $glVec3(0.5, 0.7, 1.0).normalize().elements; // Light for model
	this.axisLight = new $glVec3(0.5, 0.7, 1.0).normalize().elements; // Light for axis
	
	this.alpha = 1.0; // transparency level
	
	this.hoverColor = [1, 0.5, 0, 1];
	this.measureColor = [1, 0, 0, 1];
	this.nodeMeasureSize = 3.0;
	
	this.shaderAxis;
	this.shaderHover;
	this.shaderSelect;
	this.shaderModel;
	
	this.selectTexture;
	this.depthTexture;
	this.selectFramebuffer;
	this.tf;
};

glRender.prototype = {
	loadScene:function() {
		// WebGL initialization
		this.initPrograms();
		this.initSelection();
		cidAxis.init();
		
		gl.enable(gl.DEPTH_TEST); // Enable depth testing
		gl.depthFunc(gl.LEQUAL); // Near things obscure far things
		
		gl.enable(gl.BLEND); // Blend colors
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		gl.enable(gl.POLYGON_OFFSET_FILL); // Polygon depth offset for better lines
		gl.polygonOffset(1, 0);
		
		reportWindowSize();
		this.drawScene();
	},
	initSelection:function(){
		// create off screen texture
		this.selectTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.selectTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		// create depth texture
		this.depthTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		this.selectFramebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.selectTexture, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

		// clear frame buffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	},
	initPrograms:function() {
		this.initAxisProgram();
		this.initHoverProgram();
		this.initSelectProgram();
		this.initViewProgram();
	},
	initAxisProgram:function(){
		// Create Axis program
		let glProgram = this.createProgram(vsAxisSource, fsAxisSource);
		
		this.shaderAxis = {
			program: glProgram,
			
			aPosition: gl.getAttribLocation(glProgram, 'aPosition'),
			aNormal: gl.getAttribLocation(glProgram, 'aNormal'),
			
			uRotMatrix: gl.getUniformLocation(glProgram, 'uRotMatrix'),
			uPVMatrix: gl.getUniformLocation(glProgram, 'uPVMatrix'),
			uInvMatrix: gl.getUniformLocation(glProgram, 'uInvMatrix'),
			uOrigin: gl.getUniformLocation(glProgram, 'uOrigin'),
			uSize: gl.getUniformLocation(glProgram, 'uSize'),
			uColor: gl.getUniformLocation(glProgram, 'uColor'),
			uLight: gl.getUniformLocation(glProgram, 'uLight'),
		};
		
		gl.useProgram(this.shaderAxis.program);
		gl.uniform3fv(this.shaderAxis.uLight, this.axisLight);
	},
	initHoverProgram:function(){
		// Create Hover program
		let glProgram = this.createProgram(vsHoverSource, fsHoverSource);
		
		this.shaderHover = {
			program: glProgram,
			
			aPosition: gl.getAttribLocation(glProgram, 'aPosition'),
			aBarycentric: gl.getAttribLocation(glProgram, 'aBarycentric'),
			
			uPVMatrix: gl.getUniformLocation(glProgram, 'uPVMatrix'),
			uShrink: gl.getUniformLocation(glProgram, 'uShrink'),
			uPointSize: gl.getUniformLocation(glProgram, 'uPointSize'),
			uColor: gl.getUniformLocation(glProgram, 'uColor'),
		};
	},
	initSelectProgram:function(){
		// Create Selection program
		let glProgram = this.createProgram(vsSelectSource, fsSelectSource);
		
		this.shaderSelect = {
			program: glProgram,
			
			aPosition: gl.getAttribLocation(glProgram, 'aPosition'),
			aColor: gl.getAttribLocation(glProgram, 'aColor'),
			aBarycentric: gl.getAttribLocation(glProgram, 'aBarycentric'),
			aStage: gl.getAttribLocation(glProgram, 'aStage'),
			
			uPVMatrix: gl.getUniformLocation(glProgram, 'uPVMatrix'),
			uShrink: gl.getUniformLocation(glProgram, 'uShrink'),
			uPointSize: gl.getUniformLocation(glProgram, 'uPointSize'),
			uWidth: gl.getUniformLocation(glProgram, 'uWidth'),
			uHeight: gl.getUniformLocation(glProgram, 'uHeight')
		};
		
		gl.useProgram(this.shaderSelect.program);
		gl.uniform1f(this.shaderSelect.uPointSize, this.nodeSelectSize);
	},
	initViewProgram:function(){
		// Create Visible program
		let glProgram = this.createProgram(vsModelSource, fsModelSource, true);

		this.shaderModel = {
			program: glProgram,
			
			aPosition: gl.getAttribLocation(glProgram, 'aPosition'),
			aColor: gl.getAttribLocation(glProgram, 'aColor'),
			aNormal: gl.getAttribLocation(glProgram, 'aNormal'),
			aBarycentric: gl.getAttribLocation(glProgram, 'aBarycentric'),
			aStage: gl.getAttribLocation(glProgram, 'aStage'),
			
			uPVMatrix: gl.getUniformLocation(glProgram, 'uPVMatrix'),
			uInvMatrix: gl.getUniformLocation(glProgram, 'uInvMatrix'), 
			uColor: gl.getUniformLocation(glProgram, 'uColor'),
			uStrokeColor: gl.getUniformLocation(glProgram, 'uStrokeColor'),
			uLight: gl.getUniformLocation(glProgram, 'uLight'),
			uShrink: gl.getUniformLocation(glProgram, 'uShrink'),
			uEdgeThick: gl.getUniformLocation(glProgram, 'uEdgeThick'),
			uShowEdges: gl.getUniformLocation(glProgram, 'uShowEdges'),
			uShowLight: gl.getUniformLocation(glProgram, 'uShowLight'),
			uPointSize: gl.getUniformLocation(glProgram, 'uPointSize'),
			uShowPoints: gl.getUniformLocation(glProgram, 'uShowPoints'),
			uAlpha: gl.getUniformLocation(glProgram, 'uAlpha'),
			uIsUniformColor: gl.getUniformLocation(glProgram, 'uIsUniformColor')
		};
		gl.useProgram(this.shaderModel.program);
		
		gl.uniform1f(this.shaderModel.uEdgeThick, this.edgeThickness);
		gl.uniform1f(this.shaderModel.uPointSize, this.nodeSize);
		gl.uniform1f(this.shaderModel.uAlpha, this.alpha);
		gl.uniform1f(this.shaderModel.uShowPoints, this.showNodes);
		gl.uniform3fv(this.shaderModel.uLight, this.light);
	},
	drawScene:function() {
		this.computeFps();
		
		// Clear the canvas before we start drawing on it.
		gl.clearColor(0.133, 0.153, 0.196, 1.0); // Clear background
		gl.clearDepth(1.0); // Clear everything
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Set the viewport to match canvas
		gl.viewport(0, 0, canvas.width, canvas.height);

		// Update camera
		camera.update();
		if ( model.isLoaded == true ){
			// Render model
			gl.useProgram(this.shaderModel.program);
			
			if ( this.howShow == glRenderStyle.TRANSPARENT ){
				gl.depthFunc(gl.ALWAYS); // first pass to show all
				model.draw();
				gl.depthFunc(gl.LEQUAL); // second pass to show only front faces
				model.draw();
			} else {
				model.draw();
			}
			
			// Render mouse hover
			if (glCameraMove.state == glCameraMove.NONE){
				hover.draw();
				measure.draw();
			}
		}
		
		for(arrow of fmVectors.arrows){
			arrow.draw();
		}
		
		// Draw Axis
		gl.viewport(20, 20, 100, 100);
		cidAxis.draw();
		
		// Draw multiItem select square
		glText.drawSelect();
		// Draw text to canvas
		glText.drawText();
		
		animationID = requestAnimationFrame(this.drawScene.bind(this));
	},
	noMovementUpdate:function(){
		this.setSelectMatrixUniforms();
		this.drawSelectScene();
		glText.updateLocations();
	},
	drawSelectScene:function(){
		if ( model.isLoaded == true ){
			let cWidth = Math.round(gl.drawingBufferWidth / 2),
				cHeight = Math.round(gl.drawingBufferHeight / 2);

			//Get color indexes
			gl.useProgram(this.shaderSelect.program);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectFramebuffer);

			gl.viewport(0, 0, canvas.width, canvas.height);
			
			// Bind color texture
			gl.bindTexture(gl.TEXTURE_2D, this.selectTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

			// Bind depth texture
			gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, canvas.width, canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
			
			gl.clearColor(0, 0, 0, 0);
			gl.clearDepth(1.0); // Clear everything
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			// Set screen Size
			gl.uniform1f(this.shaderSelect.uWidth, cWidth);
			gl.uniform1f(this.shaderSelect.uHeight, cHeight);

			// Draw Mesh with Encoded Index Colour for Selection
			gl.disable(gl.BLEND);
			model.drawSelect();
			gl.enable(gl.BLEND);
			
			hover.pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
			gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, hover.pixels);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	},
	setMatrixUniforms:function() {
		gl.useProgram(this.shaderModel.program);
		gl.uniformMatrix4fv( this.shaderModel.uPVMatrix, false, camera.PV.elements );
		if ( this.howShow == glRenderStyle.SHADED ){ 
			gl.uniformMatrix3fv( this.shaderModel.uInvMatrix, false, camera.normMat.elements );
		}
		
		gl.useProgram(this.shaderAxis.program);
		gl.uniformMatrix4fv( this.shaderAxis.uPVMatrix, false, camera.PV.elements );
		gl.uniformMatrix4fv( this.shaderAxis.uRotMatrix, false, camera.viewCoord.elements );
		gl.uniformMatrix3fv( this.shaderAxis.uInvMatrix, false, camera.normMat.elements );
	},
	setSelectMatrixUniforms:function() {	
		gl.useProgram(this.shaderSelect.program);
		gl.uniformMatrix4fv( this.shaderSelect.uPVMatrix, false, camera.PV.elements );
		
		gl.useProgram(this.shaderHover.program);
		gl.uniformMatrix4fv( this.shaderHover.uPVMatrix, false, camera.PV.elements );
	},
	setRenderStyle:function(style){
		switch (style) {
			case 'Shaded':
				this.howShow = glRenderStyle.SHADED;
				this.alpha = 1.0;
				break;
			case 'Flat':
				this.howShow = glRenderStyle.FLAT;
				this.alpha = 1.0;
				break;
			case 'Transparent':
				this.howShow = glRenderStyle.TRANSPARENT;
				this.alpha = 0.5;
				break;
			case 'Wireframe':
				this.howShow = glRenderStyle.WIREFRAME;
				this.alpha = 0.0;
				break;
		}
	},
	toggleNodeShow:function(){
		this.showNodes = !this.showNodes;
		gl.useProgram(this.shaderModel.program);
		gl.uniform1f(this.shaderModel.uShowPoints, this.showNodes);
	},
	toggleEdgeShow:function(){
		this.showEdges = !this.showEdges;
	},
	toggleElmShrink:function(){
		this.shrink = !this.shrink;
		this.drawSelectScene();
		gl.useProgram(this.shaderModel.program);
		if ( this.shrink == true ){
			gl.uniform1f(this.shaderModel.uEdgeThick, this.edgeThickness*2);
		} else {
			gl.uniform1f(this.shaderModel.uEdgeThick, this.edgeThickness);
		}
	},
	createShader:function(type, source) {
		let shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}

		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	},
	createProgram:function(vsShaderSource, fsShaderSource, addTransform = false) {
		let vertexShader = this.createShader(gl.VERTEX_SHADER, vsShaderSource);
		let fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fsShaderSource);
		
		let glProgram = gl.createProgram();
		// Link the two shaders into a program
		gl.attachShader(glProgram, vertexShader);
		gl.attachShader(glProgram, fragmentShader);
		
		// Link transform feedback into a program
		if(addTransform == true){
			this.tf = gl.createTransformFeedback();
			gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf);
			gl.transformFeedbackVaryings(glProgram, ['gl_Position'], gl.SEPARATE_ATTRIBS);
		}
		gl.linkProgram(glProgram);
		
		if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
			alert('Could not initialise shaders');
		}
		
		return glProgram;
	},
	computeFps:function(){
		timeNow = new Date().getTime();
		fps++;

		if (timeNow - timeLast >= 1000) {
			//Write value in HTML
			//multiply with 1000.0 / (timeNow - timeLast) for accuracy
			document.getElementById("FPS").innerHTML = "FPS: " + Number(fps * 1000.0 / (timeNow - timeLast)).toPrecision( 5 );
			
			//reset
			timeLast = timeNow;
			fps = 0;
		}
	}
}

var timeNow=0;
var fps=0;
var timeLast=0;