var fmNodes = [];
var fmNodesDict = {};
var fmElems = [];
var fmElemsDict = {};
var fmCIDDict = {};
var fmPropDict = {};
var fmMatDict = {};

fmNode = function( id, glID, acid ){
	this.id = id; // Patran ID
	this.glID = glID; // Internal ID
	this.acid = acid; // analysis CID ID
	this.conElm = []; // connected elements
	this.groupShow = 1;
	this.groupSelect = 0;
	this.show = true;
	this.select = 0;
};

fmNode.prototype = {
	getCoords:function(){
		let off = this.glID * 3;
		return [glNodes.coords[off], glNodes.coords[off+1], glNodes.coords[off+2]];
	},
	setStage:function(){
		let show;
		if(this.groupShow && this.show){
			if(this.groupSelect || this.select){
				show = 0.6;
			} else {
				show = 0.9;
			}
		} else {
			show = 0;
		}
		glNodes.stage[this.glID] = show;
	}
};

fmElm = function( id, glID, t, c, p){
	this.id = id; // Patran ID
	this.glID = glID; // Internal ID
	this.type = t;
	this.con = c;
	this.nodeCount = c.length;
	this.pid = p;
	
	this.groupShow = 1;
	this.groupSelect = 0;
	this.show = true;
	this.select = 0;
};

fmElm.prototype = {
	getCentroid:function(){
		let centr = [0, 0, 0], off;
		for(let i = 0; i < this.nodeCount; i++){
			off = this.con[i] * 3;
			centr[0] += glNodes.coords[off];
			centr[1] += glNodes.coords[off+1];
			centr[2] += glNodes.coords[off+2];
		}
		centr[0] /= this.nodeCount;
		centr[1] /= this.nodeCount;
		centr[2] /= this.nodeCount;

		return centr;
	},
	setStage:function(){
		let off, show;
		if(this.groupShow && this.show){
			if(this.groupSelect || this.select){
				show = this.nodeCount == 2 ? 0.7 : 0.8;
			} else {
				show = 1;
			}
		} else {
			show = 0;
		}
		
		if ( this.nodeCount == 2 ){
			off = this.glID*2;
			glBars.ctrStage[this.glID] = show; //selection centroids
			
			glBars.stage[off  ] = show;
			glBars.stage[off+1] = show;
		} else if ( this.nodeCount == 3 ){
			off = this.glID*3;
			glTrias.stage[off  ] = show;
			glTrias.stage[off+1] = show;
			glTrias.stage[off+2] = show;
		} else if ( this.nodeCount == 4 ){
			off = this.glID*6;
			glQuads.stage[off  ] = show;
			glQuads.stage[off+1] = show;
			glQuads.stage[off+2] = show;
			glQuads.stage[off+3] = show;
			glQuads.stage[off+4] = show;
			glQuads.stage[off+5] = show;
		}
	},
	getNormal:function(){
		if(this.nodeCount == 3 || this.nodeCount == 4){
			let nc = glNodes.coords,
				i = this.con[0] * 3, j = this.con[1] * 3, k = this.con[2] * 3,
				v = [nc[j]-nc[i], nc[j+1]-nc[i+1], nc[j+2]-nc[i+2]],
				vv = [nc[k]-nc[i], nc[k+1]-nc[i+1], nc[k+2]-nc[i+2]];
				norm = [v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]],
				normAbs = 1 / Math.hypot(norm[0], norm[1], norm[2]);
				
				norm = [norm[0]*normAbs, norm[1]*normAbs, norm[2]*normAbs];
				
			if(this.nodeCount == 3){
				return norm;
			} else {
				j = k;
				k = this.con[3] * 3;
				v = [nc[j]-nc[i], nc[j+1]-nc[i+1], nc[j+2]-nc[i+2]];
				vv = [nc[k]-nc[i], nc[k+1]-nc[i+1], nc[k+2]-nc[i+2]];
				let norm1 = [v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]],
					normAbs1 = 1 / Math.hypot(norm1[0], norm1[1], norm1[2]);
				
				norm1 = [norm1[0]*normAbs1, norm1[1]*normAbs1, norm1[2]*normAbs1];
				
				let avg = [norm[0]+norm1[0], norm[1]+norm1[1], norm[2]+norm1[2]],
					avgAbs = 1 / Math.hypot(avg[0], avg[1], avg[2]);
				avg = [avg[0]*avgAbs, avg[1]*avgAbs, avg[2]*avgAbs];
				
				return 	[norm, norm1, avg];
			}
		}
	},
};

fmCID = function( origin, mat, type ){
	this.origin = origin; //CID origin
	this.mat = mat; //transformation matris
	this.type = type; //CID type
};

fmCID.prototype = {
	getXAxis:function(){
		return [this.mat[0][0], this.mat[0][1], this.mat[0][2]];
	},
	getYAxis:function(){
		return [this.mat[1][0], this.mat[1][1], this.mat[1][2]];
	},
	getZAxis:function(){
		return [this.mat[2][0], this.mat[2][1], this.mat[2][2]];
	},
	createFrom3Points:function(p1, p2, p3){
		this.origin = p1;
		this.type = 'R';
		
		let u = fmVec.norm( [ p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2] ] ),
			v = fmVec.norm( [ p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2] ] ),
			w = fmVec.norm(fmVec.cross( u, v ));
			
		v = fmVec.cross( w, u );
		
		this.mat = [
				[u[0], u[1], u[2]],
				[v[0], v[1], v[2]],
				[w[0], w[1], w[2]]
			];
	},
	multVector:function(v){
		return [
				this.mat[0][0]*v[0] + this.mat[0][1]*v[1] + this.mat[0][2]*v[2],
				this.mat[1][0]*v[0] + this.mat[1][1]*v[1] + this.mat[1][2]*v[2],
				this.mat[2][0]*v[0] + this.mat[2][1]*v[1] + this.mat[2][2]*v[2]
			];
	},
	cylinderDispl:function(v, c){
		let cv = fmVec.sub(c, this.origin);
			nv = [this.mat[0][2], this.mat[1][2], this.mat[2][2]]
			rv = fmVec.norm([
					(1-nv[0]**2)*cv[0] - nv[0]*nv[1]*cv[1] - nv[0]*nv[2]*cv[2],
					-nv[0]*nv[1]*cv[0] + (1-nv[1]**2)*cv[1] - nv[1]*nv[2]*cv[2],
					-nv[0]*nv[2]*cv[0] - nv[1]*nv[2]*cv[1] + (1-nv[2]**2)*cv[2]
				]),
			tv = fmVec.cross(nv, rv);
				
		return [
				rv[0]*v[0] + tv[0]*v[1] + nv[0]*v[2],
				rv[1]*v[0] + tv[1]*v[1] + nv[1]*v[2],
				rv[2]*v[0] + tv[2]*v[1] + nv[2]*v[2]
			]
	}
};

fmPRod = function( a, mid){
	this.a = a; //Area
	this.mid = mid; //Material ID
};

fmPShell = function( t, mid){
	this.t = t; //Thickness
	this.mid = mid; //Material ID
};

fmPShear = function( t, mid){
	this.t = t; //Thickness
	this.mid = mid; //Material ID
};

fmMat1 = function( e, nu){
	this.e = e; //Elestic modul
	this.nu = nu; //Poisson ratio
};