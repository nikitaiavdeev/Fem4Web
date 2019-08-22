// View Projection Type
//**************************************************

const glProjectionType = {
	PERSPECTIVE: 0,
	ORTHO: 1
};

var glCameraMove = {
	state : 0,
	set : function(inp_val){
		camera.needUpdate = true;

		if ( inp_val == this.NONE )
			render.noMovementUpdate();

		if (inp_val !== this.state){
			switch (this.state) {
				case this.SPIN:
					camera.rotZ = 0;
					camera.right.copy(camera.curQ.xAxis());
					camera.up.copy(camera.curQ.yAxis());
					camera.fwd.copy(camera.curQ.zAxis());
					break;
				case this.ROTATE:
					camera.rotX = 0;
					camera.rotY = 0;
					camera.updateDepth();
					camera.right.copy(camera.curQ.xAxis());
					camera.up.copy(camera.curQ.yAxis());
					camera.fwd.copy(camera.curQ.zAxis());
					break;
				case this.PAN:
					camera.panX = 0;
					camera.panY = 0;
					camera.updateDepth();
					break;
			}
		}

		if ( inp_val == this.NONE )
			camera.needUpdate = false;
		
		this.state = inp_val;
	},
	isWheelZoom : false,
	NONE : 0,
	ROTATE : 1,
	ZOOM : 2,
	PAN : 3,
	SPIN : 4,
};

function glCamera() {
	// View matrix
	this.view = $glMat4.create();

	// Projection Matrix
	this.projection = $glMat4.create();
	
	//Projection * View Matrix
	this.PV = $glMat4.create();
	
	//Inversed Transposed View Matrix for light
	this.normMat = $glMat3.create();

	this.nearPlane = -1000;
	this.farPlane = 1000;
	this.projectionType = glProjectionType.ORTHO;
	
	this.rotX = 0;
	this.rotY = 0;
	this.rotZ = 0;
	
	this.panX = 0;
	this.panY = 0;

	// The right vector
	this.right = new $glVec3(1, 0, 0);
	// The up vector
	this.up = new $glVec3(0, 1, 0);
	// The fwd vector
	this.fwd = new $glVec3(0, 0, 1);
	
	// Current Camera Stage
	this.curQ = $glQuat.create();
	this.curCenter = $glVec3.create();
	this.curZoom = 1;
	
	//Update status
	this.needUpdate = false;
	this.needUpdateProjection = true;
	
	//Animation
	this.isAnimate = false;
	this.animateF = 0;
	
	//Start Position
	this.initQ = $glQuat.create();
	this.initCenter = $glVec3.create();
	this.initZoom = 0;
	
	//Final Position
	this.animQ = $glQuat.create();
	this.animCenter = $glVec3.create();
	this.animZoom = 0;
	
	//Coords View
	this.viewSizeCoord = 18;
	this.viewCoord = $glMat4.create();
};

glCamera.prototype = {
	updateProjection:function () {
		if (this.projectionType == glProjectionType.PERSPECTIVE) {
			this.projection.createPerspective(0.5, canvas.width / canvas.height, 1, this.farPlane);
		} else {
			if( model.isLoaded == true ){
				let m = this.view.elements,
					c = model.center.elements,
					depthZ = -m[2]*c[0] - m[6]*c[1] - m[10]*c[2] - m[14];
				
				this.farPlane = depthZ + model.maxR*this.curZoom;
				this.nearPlane = depthZ - model.maxR*this.curZoom;
			}
			
			this.projection.createOrtho(-canvas.width/2, canvas.width/2, -canvas.height/2, canvas.height/2, this.nearPlane, this.farPlane);
		}
	},
	updateDepth:function(){
		// get center depth
		let off = Math.round(gl.drawingBufferHeight / 2) * gl.drawingBufferWidth * 4 + Math.round(gl.drawingBufferWidth / 2) * 4,
			depthColor = hover.pixels.slice(off, off + 4),
			d = hover.getID(depthColor) / hover.total_shift;

		if ( d <= 0 || d > 1 ){
			this.initCenter.copy(this.curCenter);	
			return;
		}
			
		if (this.projectionType == glProjectionType.PERSPECTIVE) {
		} else {
			let depthZ = d * this.farPlane + this.nearPlane*(1 - d);
			this.curCenter.scaleAndAdd(this.curQ.zAxis(), -depthZ/this.curZoom);
			this.view = $glMat4.createView(this.curZoom, this.curCenter, this.curQ);
			this.updateProjection();
			this.updateView();
		}
		this.initCenter.copy(this.curCenter);
	},
	updateView:function(){
		this.view = $glMat4.createView(this.curZoom, this.curCenter, this.curQ);
		if (this.projectionType == glProjectionType.PERSPECTIVE)
			this.view.elements[14] -= 700/this.curZoom; // camera position
		this.PV = $glMat4.multiply(this.projection, this.view);
		this.normMat.fromQuaternionNorm(this.curQ);
		this.viewCoord.fromQuaternionVC(this.curQ, this.viewSizeCoord);
		render.setMatrixUniforms();
	},
	update:function() {
		// Animation for View Change
		if ( this.isAnimate ){
			this.animate();
			
			this.updateView();
			if ( !this.isAnimate ){ // Animation finished
				this.needUpdate = false;
				render.noMovementUpdate();
			}
			return false;
		}

		if (this.needUpdateProjection == true){
			this.needUpdateProjection = false;
			this.updateProjection();
		}
		
		if ( this.needUpdate == true ){
			//Rotation
			if (glCameraMove.state == glCameraMove.ROTATE){
				this.curQ.from2AngleAxis(this.right, this.rotX, this.up, this.rotY);
				if (this.projectionType == glProjectionType.ORTHO)
					this.updateProjection();
			}

			//Spin
			if (glCameraMove.state == glCameraMove.SPIN){
				let qv = $glQuat.create().from3UnitVectors(this.right, this.up, this.fwd);
				this.curQ.fromAngleAxis(this.fwd, this.rotZ);
				this.curQ.multiply(qv);
			}

			//Pan
			if (glCameraMove.state == glCameraMove.PAN){
				this.curCenter = $glVec3.scaleAndAdd(this.initCenter, this.curQ.xAxis(), -this.panX);
				this.curCenter.scaleAndAdd(this.curQ.yAxis(), this.panY);
			}

			//Zoom
			if (glCameraMove.state == glCameraMove.ZOOM){
				if (this.projectionType == glProjectionType.ORTHO) 
					this.updateProjection();
			}
			
			this.updateView();

			// Handle wheel zoom
			if(glCameraMove.isWheelZoom){
				glCameraMove.isWheelZoom = false;
				glCameraMove.set(glCameraMove.NONE);
			}
		}
	},
	animate:function(){
		this.animateF += 0.05;
		if (this.animateF >= 1.0) {
			this.curQ.copy(this.animQ);
			this.curZoom = this.animZoom;
			if (this.projectionType == glProjectionType.ORTHO) this.updateProjection();
			this.curCenter.copy(this.animCenter);
			this.initCenter.copy(this.animCenter);
			
			this.right.copy(this.curQ.xAxis());
			this.up.copy(this.curQ.yAxis());
			this.fwd.copy(this.curQ.zAxis());
			
			this.isAnimate = false;
			this.animateF = 0;
			
			return false;
		}
		
		this.curQ = $glQuat.slerp(this.initQ, this.animQ, this.animateF);
		this.curZoom = (1 - this.animateF) * this.initZoom + this.animateF * this.animZoom;
		if (this.projectionType == glProjectionType.ORTHO) this.updateProjection();
		this.curCenter = $glVec3.lerp(this.initCenter, this.animCenter, this.animateF);
	},
	saveAnimateCameraStage:function(){
		this.rotX = 0;
		this.rotY = 0;
		this.rotZ = 0;
		this.panX = 0;
		this.panY = 0;
		
		this.initQ.copy(this.curQ);
		this.initCenter.copy(this.curCenter);
		this.initZoom = this.curZoom;
		
		this.animQ.copy(this.curQ);
		this.animCenter.copy(this.curCenter);
		this.animZoom = this.curZoom;
		
		this.animateF = 0;
		this.isAnimate = true;
	},
	//Ribbon Buttons
	setViewTo:function(direction) {
		switch (direction) {
			case 'Front':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, -$glMath.PiOver2]);
				break;
			case 'Back':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, $glMath.PiOver2]);
				break;
			case 'Left':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver2, 0, 0]);
				break;
			case 'Right':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([-$glMath.PiOver2, $glMath.PI, 0]);
				break;
			case 'Top':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([0, 0, 0]);
				break;
			case 'Bottom':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PI, 0, 0]);
				break;
			case 'ISO':
				this.saveAnimateCameraStage();
				this.animQ.fromEuler([$glMath.PiOver4, 0, -$glMath.PI/6]);
		}
	},
	fitZoom:function(){
		if ( !model.isLoaded ) return;

		let screenCoords = model.getScreenCoords(),
			maxX, minX, maxY, minY;

		for(node of fmNodes){
			if(node.groupShow && node.show){
				off = node.glID*4;
				if(screenCoords[off] > maxX || !maxX) maxX = screenCoords[off];
				if(screenCoords[off] < minX || !minX) minX = screenCoords[off];
				if(screenCoords[off+1] > maxY || !maxY) maxY = screenCoords[off+1];
				if(screenCoords[off+1] < minY || !minY) minY = screenCoords[off+1];
			}
		}
		
		let scale = Math.max((maxX-minX)/2, (maxY-minY)/2) * 1.1,
			xOff = (maxX + minX)*canvas.width/this.curZoom/4,
			yOff = (maxY + minY)*canvas.height/this.curZoom/4;

		this.saveAnimateCameraStage();
		this.animCenter = $glVec3.scaleAndAdd(this.curCenter, this.curQ.xAxis(), xOff);
		this.animCenter.scaleAndAdd(this.curQ.yAxis(), yOff);
		this.animZoom = this.curZoom / scale;
	},
	setPerspective:function(perspective){
		switch (perspective) {
			case 'Orthogonal':
				this.projectionType = glProjectionType.ORTHO;
				break;
			case 'Perspective':
				this.projectionType = glProjectionType.PERSPECTIVE;
				break;
		}
		this.updateProjection();
		this.updateView();
		render.noMovementUpdate();
	},
};