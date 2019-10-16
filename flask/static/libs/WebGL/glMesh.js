const BARYCENTRIC = {
	NODE: new Float32Array([1, 1, 1]),
	BAR: new Float32Array([
		1, 0, 1,
		0, 1, 1,
	]),
	TRIA: new Float32Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1,
	]),
	QUAD: new Float32Array([
		1, 0, 1,
		0, 0, 1,
		0, 1, 0,

		0, 1, 0,
		1, 0, 1,
		0, 0, 1,
	]),
};

//Arrays
glNodes = {
	count: null,

	vao: null,
	selectVAO: null,
	coordBuffer: null,
	colorBuffer: null,
	selectCoordBuffer: null,
	stageBuffer: null,
	selectStageBuffer: null,

	coords: null,
	colors: null,
	selColors: null,
	stage: null,
};
glBars = {
	count: null,

	vao: null,
	selectVAO: null,
	selectCentrVAO: null,
	coordBuffer: null,
	colorBuffer: null,
	selectCoordBuffer: null,
	selectCtrCoordBuffer: null,
	stageBuffer: null,
	selectStageBuffer: null,
	selectCtrStageBuffer: null,

	coords: null,
	centroids: null,
	colors: null,
	barycentric: null,

	selColors: null,
	selCtrColors: null,
	stage: null,
	ctrStage: null,
};
glTrias = {
	count: null,

	vao: null,
	selectVAO: null,
	coordBuffer: null,
	colorBuffer: null,
	selectCoordBuffer: null,
	stageBuffer: null,
	selectStageBuffer: null,

	coords: null,
	colors: null,
	barycentric: null,
	normals: null,

	selColors: null,
	stage: null,
};
glQuads = {
	count: null,

	vao: null,
	selectVAO: null,
	coordBuffer: null,
	colorBuffer: null,
	selectCoordBuffer: null,
	stageBuffer: null,
	selectStageBuffer: null,

	coords: null,
	colors: null,
	barycentric: null,
	normals: null,

	selColors: null,
	stage: null,
};

class $glMesh {
	constructor() {
		//Is model has GPF moments
		this.hasMoments = false;

		// The Max Point of this Mesh
		this.maxPoint = new glVec3();
		this.minPoint = new glVec3();

		//Center
		this.center = null;
		this.maxR = null;

		// Clear Global Vars
		fmNodesDict = {};
		fmElemsDict = {};
		fmCIDDict = {};
		fmPropDict = {};
		fmMatDict = {};
		glNodes.count = 0;
		glBars.count = 0;
		glTrias.count = 0;
		glQuads.count = 0;
	}
	init(){
		// Determine model boundaries
		this.findMaxMin();

		// Init Buffers
		this.initBuffers(glNodes);
		this.initBuffers(glBars);
		this.initBuffers(glTrias);
		this.initBuffers(glQuads);

		// Init Selection Buffers
		this.initSelectBuffers(glNodes);
		this.initSelectBuffers(glBars);
		this.initSelectCentrBuffers(glBars);
		this.initSelectBuffers(glTrias);
		this.initSelectBuffers(glQuads);

		camera.fitZoom();
		render.drawSelectScene();
	}
	findMaxMin() {
		// Find Max/Min coords
		for (let i = 0; i < glNodes.count * 3; i++) {
			if (glNodes.coords[i] > this.maxPoint.xyz[i % 3] || i < 3)
				this.maxPoint.xyz[i % 3] = glNodes.coords[i];

			if (glNodes.coords[i] < this.minPoint.xyz[i % 3] || i < 3)
				this.minPoint.xyz[i % 3] = glNodes.coords[i];

		}

		this.center = glVec3.scaleAndAdd(this.maxPoint, 0.5, this.minPoint, 0.5);

		this.maxR = glVec3.scaleAndAdd(this.maxPoint, 0.5, this.minPoint, -0.5).length;
	}
	initBuffers(inpObj) {
		let bufferBarycentric, bufferNormals;

		//Create and bind vertex array object (attribute state)
		inpObj.vao = gl.createVertexArray();
		gl.bindVertexArray(inpObj.vao);

		//Bind coordinates
		inpObj.coordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.coordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.coords, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderModel.aPosition);
		gl.vertexAttribPointer(render.shaderModel.aPosition, 3, gl.FLOAT, false, 0, 0);

		//Bind colors
		inpObj.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.colors, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderModel.aColor);
		gl.vertexAttribPointer(render.shaderModel.aColor, 4, gl.FLOAT, false, 0, 0);

		//Bind stages
		inpObj.stageBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.stageBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.stage, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderModel.aStage);
		gl.vertexAttribPointer(render.shaderModel.aStage, 1, gl.FLOAT, false, 0, 0);

		//Bind barycentric
		if (inpObj.hasOwnProperty('barycentric')) {
			bufferBarycentric = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferBarycentric);
			gl.bufferData(gl.ARRAY_BUFFER, inpObj.barycentric, gl.STATIC_DRAW);
			gl.enableVertexAttribArray(render.shaderModel.aBarycentric);
			gl.vertexAttribPointer(render.shaderModel.aBarycentric, 3, gl.FLOAT, false, 0, 0);
		}

		//Bind normals
		if (inpObj.hasOwnProperty('normals')) {
			bufferNormals = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferNormals);
			gl.enableVertexAttribArray(render.shaderModel.aNormal);
			gl.bufferData(gl.ARRAY_BUFFER, inpObj.normals, gl.STATIC_DRAW);
			gl.vertexAttribPointer(render.shaderModel.aNormal, 3, gl.FLOAT, false, 0, 0);
		}

		// Delete bufferes
		gl.bindVertexArray(null);
		if (bufferBarycentric) gl.deleteBuffer(bufferBarycentric);
		if (bufferNormals) {
			gl.deleteBuffer(bufferNormals);
			inpObj.normals = [];
		}
	}
	initSelectBuffers(inpObj) {
		let bufferBarycentric;

		//Create and bind vertex array object (attribute state)
		inpObj.selectVAO = gl.createVertexArray();
		gl.bindVertexArray(inpObj.selectVAO);

		//Set coords data
		inpObj.selectCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.selectCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.coords, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aPosition);
		gl.vertexAttribPointer(render.shaderSelect.aPosition, 3, gl.FLOAT, false, 0, 0);

		//Set selection colors data
		let bufferSelColors = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferSelColors);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.selColors, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aColor);
		gl.vertexAttribPointer(render.shaderSelect.aColor, 4, gl.FLOAT, false, 0, 0);

		//Set selection stage data
		inpObj.selectStageBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.selectStageBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.stage, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aStage);
		gl.vertexAttribPointer(render.shaderSelect.aStage, 1, gl.FLOAT, false, 0, 0);

		//Bind barycentric
		if (inpObj.hasOwnProperty('barycentric')) {
			bufferBarycentric = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferBarycentric);
			gl.bufferData(gl.ARRAY_BUFFER, inpObj.barycentric, gl.STATIC_DRAW);
			gl.enableVertexAttribArray(render.shaderSelect.aBarycentric);
			gl.vertexAttribPointer(render.shaderSelect.aBarycentric, 3, gl.FLOAT, false, 0, 0);
		}

		// Delete bufferes
		gl.bindVertexArray(null);
		if (bufferBarycentric) {
			gl.deleteBuffer(bufferBarycentric);
			inpObj.barycentric = [];
		}
		if (bufferSelColors) {
			gl.deleteBuffer(bufferSelColors);
			inpObj.selColors = [];
		}
	}
	initSelectCentrBuffers(inpObj) {
		inpObj.selectCentrVAO = gl.createVertexArray();
		gl.bindVertexArray(inpObj.selectCentrVAO);

		//Set coords data
		inpObj.selectCtrCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.selectCtrCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.centroids, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aPosition);
		gl.vertexAttribPointer(render.shaderSelect.aPosition, 3, gl.FLOAT, false, 0, 0);

		//Set selection colors data
		let bufferSelColors = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferSelColors);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.selCtrColors, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aColor);
		gl.vertexAttribPointer(render.shaderSelect.aColor, 4, gl.FLOAT, false, 0, 0);

		//Set stage buffer
		inpObj.selectCtrStageBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, inpObj.selectCtrStageBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, inpObj.ctrStage, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(render.shaderSelect.aStage);
		gl.vertexAttribPointer(render.shaderSelect.aStage, 1, gl.FLOAT, false, 0, 0);

		gl.bindVertexArray(null);
		if (bufferSelColors) {
			gl.deleteBuffer(bufferSelColors);
			inpObj.selCtrColors = [];
		}
	}
	draw() {
		if (render.howShow == glRenderStyle.SHADED) {
			gl.uniform1f(render.shaderModel.uShowLight, 1);
		}

		if (render.howShow == glRenderStyle.WIREFRAME) {
			gl.uniform4fv(render.shaderModel.uStrokeColor, [0.0, 0.0, 0.671, 1.0]); //Edge color
		} else {
			gl.uniform4fv(render.shaderModel.uStrokeColor, [0.0, 0.0, 0.671, render.alpha]); //Edge color
		}

		if (render.shrink) {
			gl.uniform1f(render.shaderModel.uShrink, render.shrinkLevel);
		} else {
			gl.uniform1f(render.shaderModel.uShrink, 0.0);
		}

		gl.uniform1f(render.shaderModel.uShowEdges, render.showEdges); // Elements with edges
		gl.uniform1f(render.shaderModel.uAlpha, render.alpha); // Element transperency

		if (glQuads.count) {
			gl.bindVertexArray(glQuads.vao);
			gl.drawArrays(gl.TRIANGLES, 0, glQuads.count * 6);
		}
		if (glTrias.count) {
			gl.bindVertexArray(glTrias.vao);
			gl.drawArrays(gl.TRIANGLES, 0, glTrias.count * 3);
		}

		//Elements without edges
		gl.uniform1f(render.shaderModel.uShowEdges, 0);
		gl.uniform1f(render.shaderModel.uShowLight, 0);
		if (render.howShow == glRenderStyle.WIREFRAME) {
			gl.uniform1f(render.shaderModel.uAlpha, 1.0);
		}

		if (glBars.count) {
			gl.bindVertexArray(glBars.vao);
			gl.drawArrays(gl.LINES, 0, glBars.count * 2);
		}

		if (render.shrink)
			gl.uniform1f(render.shaderModel.uShrink, 0.0);

		if (glNodes.count) {
			gl.bindVertexArray(glNodes.vao);
			gl.drawArrays(gl.POINTS, 0, glNodes.count);
		}

		gl.bindVertexArray(null);
	}
	drawSelect() {
		// Draw the mesh by binding the array buffer
		gl.disable(gl.BLEND);
		if (render.shrink == true) {
			gl.uniform1f(render.shaderSelect.uShrink, render.shrinkLevel);
		} else {
			gl.uniform1f(render.shaderSelect.uShrink, 0.0);
		}

		if (glQuads.count) {
			gl.bindVertexArray(glQuads.selectVAO);
			gl.drawArrays(gl.TRIANGLES, 0, glQuads.count * 6);
		}
		if (glTrias.count) {
			gl.bindVertexArray(glTrias.selectVAO);
			gl.drawArrays(gl.TRIANGLES, 0, glTrias.count * 3);
		}
		if (glBars.count) {
			gl.bindVertexArray(glBars.selectVAO);
			gl.drawArrays(gl.LINES, 0, glBars.count * 2);

			gl.uniform1f(render.shaderSelect.uShrink, 0.0);
			gl.bindVertexArray(glBars.selectCentrVAO);
			gl.drawArrays(gl.POINTS, 0, glBars.count);
		}
		if (glNodes.count) {
			gl.bindVertexArray(glNodes.selectVAO);
			gl.drawArrays(gl.POINTS, 0, glNodes.count);
		}
		gl.bindVertexArray(null);
	}
	getScreenCoords() {
		let screenCoords = new Float32Array(glNodes.count * 4);

		//Get nodes coords in screen
		gl.useProgram(render.shaderModel.program);

		let bufferCoordsTrans = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoordsTrans);
		gl.bufferData(gl.ARRAY_BUFFER, screenCoords, gl.STREAM_READ);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, render.tf);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferCoordsTrans);

		gl.enable(gl.RASTERIZER_DISCARD);
		gl.beginTransformFeedback(gl.POINTS);
		gl.bindVertexArray(glNodes.vao);
		gl.drawArrays(gl.POINTS, 0, glNodes.count);
		gl.endTransformFeedback();
		gl.disable(gl.RASTERIZER_DISCARD);

		gl.finish();
		gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, screenCoords);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

		gl.deleteBuffer(bufferCoordsTrans);

		return screenCoords;
	}
	updateCoords() {
		gl.useProgram(render.shaderModel.program);

		//Bind coords
		for (const obj of [glNodes, glBars, glTrias, glQuads]) {
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.coordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.coords, gl.STATIC_DRAW);
		}
	}
	updateColors() {
		gl.useProgram(render.shaderModel.program);

		//Bind colors
		for (const obj of [glNodes, glBars, glTrias, glQuads]) {
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.colors, gl.STATIC_DRAW);
		}
	}
	updateStages() {
		gl.useProgram(render.shaderModel.program);

		//Bind stages
		for (const obj of [glNodes, glBars, glTrias, glQuads]) {
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.stageBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.stage, gl.STATIC_DRAW);
		}
	}
	updateSelectCoords() {
		gl.useProgram(render.shaderSelect.program);

		//Bind select stages
		for (const obj of [glNodes, glBars, glTrias, glQuads]) {
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.selectCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.coords, gl.STATIC_DRAW);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, glBars.selectCtrCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, glBars.centroids, gl.STATIC_DRAW);

		render.noMovementUpdate();
	}
	updateSelectStages() {
		gl.useProgram(render.shaderSelect.program);

		//Bind select stages
		for (const obj of [glNodes, glBars, glTrias, glQuads]) {
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.selectStageBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.stage, gl.STATIC_DRAW);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, glBars.selectCtrStageBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, glBars.ctrStage, gl.STATIC_DRAW);

		render.noMovementUpdate();
	}
}