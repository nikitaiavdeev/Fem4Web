function glArrow() {
	this.vao;
	
	this.SMOOTH = 12; //Number of nodes per cyrcle
	this.CR = 0.5; // Cylinder radius
	this.CL = 12; // Cylinder length
	this.HR = 1.5; // Arrow radius
	this.HL = 5; // Arrow length
	
	//gl parametrs
	this.count = null;
	this.origin = [];
	this.direction = [];
	this.color = [];
	this.size = 1;
	this.value = null;
	
	//Arrays
	this.coords = [];
	this.indices = [];
	this.normals = [];
};

glArrow.prototype = {
	addArrow:function(){
		let inc = Math.PI * 2.0 / this.SMOOTH, // Angle increment
			// Cone normal 
			ang = Math.atan(this.HR/this.HL), cN = Math.cos(ang), sN = Math.sin(ang),
			ip1,
			vz = this.direction;
			vx = fmVec.norm([vz[2], -vz[0], vz[1]]),
			vy = fmVec.norm(fmVec.cross(vz, vx));
		
		vx = fmVec.cross(vy, vz);
		this.count = this.SMOOTH*12;
		this.coords = Array(this.SMOOTH*15 + 3);
		this.normals = Array(this.SMOOTH*15 + 3);
		
		for( let i=0; i < this.SMOOTH; i++ ){
			if(i == this.SMOOTH-1){
				ip1 = 0;
			} else {
				ip1 = i + 1;
			}
			
			//----Coords----
			for( let j = 0; j < 3; j++){
				cor = Math.cos(i * inc)*vx[j] + Math.sin(i * inc)*vy[j]; // coordibate
				
				this.coords[i*3 + j] = this.CR * cor; //Bottom cylinder circle
				this.coords[i*3 + this.SMOOTH*3 + j] = this.CR * cor + vz[j] * this.CL; //Top cylinder circle
				this.coords[i*3 + this.SMOOTH*6 + j] = this.HR * cor + vz[j] * this.CL; //Bottom arrow circle for disc
				this.coords[i*3 + this.SMOOTH*9 + j] = this.HR * cor + vz[j] * this.CL; //Bottom arrow circle for cone				
				this.coords[i*3 + this.SMOOTH*12 + j] = vz[j] * (this.CL + this.HL);//Arrow top center vertex
			
				//----Normals----
				this.normals[i*3 + j] = cor; //Bottom cylinder circle 
				this.normals[i*3 + this.SMOOTH*3 + j] = cor; //Top cylinder circle
				this.normals[i*3 + this.SMOOTH*6 + j] = -vz[j]; //Bottom arrow circle for disc
				this.normals[i*3 + this.SMOOTH*9 + j] = cor * cN + vz[j] * sN; //Bottom arrow circle for cone
				this.normals[i*3 + this.SMOOTH*12 + j] = cor * cN + vz[j] * sN;
			}
			
			//----Indices----
			this.indices.push( 	i, ip1            , ip1+this.SMOOTH, //cylinder triangle 1
								i, ip1+this.SMOOTH, i  +this.SMOOTH, //cylinder triangle 2
								this.SMOOTH*5  , ip1+this.SMOOTH*2, i+this.SMOOTH*2, //arrow disc
								this.SMOOTH*4+i, i+this.SMOOTH*3, ip1+this.SMOOTH*3); //arrow cone
		}
		for( let j = 0; j < 3; j++){
			this.coords[this.SMOOTH*15 + j] = this.CL * vz[j]; //Cylinder top center vertex
			
			this.normals[this.SMOOTH*15 + j] = -vz[j]; //Cylinder top center vertex
		}
	},
	addMomArrow:function(){ //double arrow for moments
		let inc = Math.PI * 2.0 / this.SMOOTH, // Angle increment
			// Cone normal 
			ang = Math.atan(this.HR/this.HL), cN = Math.cos(ang), sN = Math.sin(ang),
			ip1,
			vz = this.direction;
			vx = fmVec.norm([vz[2], -vz[0], vz[1]]),
			vy = fmVec.norm(fmVec.cross(vz, vx));
		
		vx = fmVec.cross(vy, vz);
		this.count = this.SMOOTH*18;
		this.coords = Array(this.SMOOTH*27 + 3);
		this.normals = Array(this.SMOOTH*27 + 3);
		
		for( let i=0; i < this.SMOOTH; i++ ){
			if(i == this.SMOOTH-1){
				ip1 = 0;
			} else {
				ip1 = i + 1;
			}
			
			//----Coords----
			for( let j = 0; j < 3; j++){
				cor = Math.cos(i * inc)*vx[j] + Math.sin(i * inc)*vy[j]; // coordibate
				
				this.coords[i*3 + j] = this.CR * cor; //Bottom cylinder circle
				this.coords[i*3 + this.SMOOTH*3 + j] = this.CR * cor + vz[j] * (this.CL - this.HL); //Top cylinder circle
				
				this.coords[i*3 + this.SMOOTH*6 + j] = this.HR * cor + vz[j] * (this.CL - this.HL); //Bottom arrow circle for disc
				this.coords[i*3 + this.SMOOTH*9 + j] = this.HR * cor + vz[j] * (this.CL - this.HL); //Bottom arrow circle for cone				
				this.coords[i*3 + this.SMOOTH*12 + j] = vz[j] * this.CL;//Arrow top center vertex
				
				this.coords[i*3 + this.SMOOTH*15 + j] = this.HR * cor + vz[j] * this.CL; //Bottom arrow circle for disc
				this.coords[i*3 + this.SMOOTH*18 + j] = this.HR * cor + vz[j] * this.CL; //Bottom arrow circle for cone				
				this.coords[i*3 + this.SMOOTH*21 + j] = vz[j] * (this.CL + this.HL);//Arrow top center vertex
			
				//----Normals----
				this.normals[i*3 + j] = cor; //Bottom cylinder circle 
				this.normals[i*3 + this.SMOOTH*3 + j] = cor; //Top cylinder circle
				
				this.normals[i*3 + this.SMOOTH*6 + j] = -vz[j]; //Bottom arrow circle for disc
				this.normals[i*3 + this.SMOOTH*9 + j] = cor * cN + vz[j] * sN; //Bottom arrow circle for cone
				this.normals[i*3 + this.SMOOTH*12 + j] = cor * cN + vz[j] * sN;
				
				this.normals[i*3 + this.SMOOTH*15 + j] = -vz[j]; //Bottom arrow circle for disc
				this.normals[i*3 + this.SMOOTH*18 + j] = cor * cN + vz[j] * sN; //Bottom arrow circle for cone
				this.normals[i*3 + this.SMOOTH*21 + j] = cor * cN + vz[j] * sN;
			}
			
			//----Indices----
			this.indices.push( 	i, ip1            , ip1+this.SMOOTH, //cylinder triangle 1
								i, ip1+this.SMOOTH, i  +this.SMOOTH, //cylinder triangle 2
								
								this.SMOOTH*8  , ip1+this.SMOOTH*2, i+this.SMOOTH*2, //arrow disc
								this.SMOOTH*4+i, i+this.SMOOTH*3, ip1+this.SMOOTH*3, //arrow cone
								
								this.SMOOTH*9  , ip1+this.SMOOTH*5, i+this.SMOOTH*5, //arrow disc
								this.SMOOTH*7+i, i+this.SMOOTH*6, ip1+this.SMOOTH*6); //arrow cone
		}
		for( let j = 0; j < 3; j++){
			this.coords[this.SMOOTH*24 + j] = vz[j] * (this.CL - this.HL); //Cylinder top center vertex
			this.coords[this.SMOOTH*27 + j] = vz[j] * this.CL; //Cylinder top center vertex
			
			this.normals[this.SMOOTH*24 + j] = -vz[j]; //Cylinder top center vertex
			this.normals[this.SMOOTH*27 + j] = -vz[j]; //Cylinder top center vertex
		}
	},
	initBuffers:function(shader) {
		gl.useProgram(render.shaderAxis.program);
		
		let bufferCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coords), gl.STATIC_DRAW);
		
		let bufferNormals = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferNormals);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		
		//Create and bind vertex array object (attribute state)
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		
		//Bind coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
		gl.enableVertexAttribArray(render.shaderAxis.aPosition);
		gl.vertexAttribPointer(render.shaderAxis.aPosition, 3, gl.FLOAT, false, 0, 0);
		
		//Bind Normals
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferNormals);
		gl.enableVertexAttribArray(render.shaderAxis.aNormal);
		gl.vertexAttribPointer(render.shaderAxis.aNormal, 3, gl.FLOAT, false, 0, 0);
		
		// Create indices buffer
		let bufferIndices = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndices);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
		
		//Clear
		gl.bindVertexArray(null);
		gl.deleteBuffer(bufferCoords);
		gl.deleteBuffer(bufferNormals);
		gl.deleteBuffer(bufferIndices);
		this.coords = [];
		this.indices = [];
		this.normals = [];
	},
	draw:function() {
		gl.useProgram(render.shaderAxis.program);
		
		if( this.size == 1.0 ){
			gl.uniform1f(render.shaderAxis.uSize, this.size);			
		} else {
			gl.uniform1f(render.shaderAxis.uSize, camera.curZoom / 3);
		}
		gl.uniform4fv(render.shaderAxis.uOrigin, this.origin);
		gl.uniform3fv(render.shaderAxis.uColor, this.color);
		
		gl.bindVertexArray(this.vao);		
		gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_BYTE, 0);
		gl.bindVertexArray(null);
	}
};

function $cidAxis() {
	this.arrows = [];
};

$cidAxis.prototype = {
	// Initialises the Mesh
	init:function() {
		let xVec = new glArrow,
			yVec = new glArrow,
			zVec = new glArrow;
		
		xVec.origin = [0, 0, 0, 1];
		xVec.direction = [1, 0, 0];
		xVec.color = [1, 0, 0];
		xVec.addArrow();
		xVec.initBuffers();
		
		yVec.origin = [0, 0, 0, 1];
		yVec.direction = [0, 1, 0];
		yVec.color = [0, 1, 0];
		yVec.addArrow();
		yVec.initBuffers();
		
		zVec.origin = [0, 0, 0, 1];
		zVec.direction = [0, 0, 1];
		zVec.color = [0, 0.667, 1];
		zVec.addArrow();
		zVec.initBuffers();
		
		this.arrows = [xVec, yVec, zVec];
	},
	draw:function(){
		for (arrow of this.arrows)
			arrow.draw();
	}
};