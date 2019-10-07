var fmNodesDict = {};
var fmElemsDict = {};
var fmCIDDict = {};
var fmPropDict = {};
var fmMatDict = {};

class fmNode {
	constructor(id, glID, acid) {
		this.id = id; // Patran ID
		this.glID = glID; // Internal ID
		this.acid = acid; // analysis CID ID
		this.conElm = []; // connected elements
		this.groupShow = 1;
		this.groupSelect = 0;
		this.show = true;
		this.select = 0;
	}
	get coords() {
		let off = this.glID * 3;
		return new glVec3(glNodes.coords[off], glNodes.coords[off + 1], glNodes.coords[off + 2]);
	}
	setStage() {
		let show;
		if (this.groupShow && this.show) {
			if (this.groupSelect || this.select) {
				show = 0.6;
			} else {
				show = 0.9;
			}
		} else {
			show = 0;
		}
		glNodes.stage[this.glID] = show;
	}
}

class fmElm {
	constructor(id, glID, t, c, p) {
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
	}
	get centroid() {
		let centr = new glVec3(),
			inv = 1 / this.nodeCount;
		for (let i = 0; i < this.nodeCount; i++) {
			centr.scaleAndAdd(this.con[i].coords, inv);
		}
		return centr;
	}
	get eCid() {
		let nc = this.connectivity,
			x, y, z;
		switch (this.nodeCount) {
			case 2:
				x = glVec3.sub(nc[1].coords, nc[0].coords).normalize();
				break;
			case 3:
				x = glVec3.sub(nc[1].coords, nc[0].coords).normalize();
				z = glVec3.getNormal(nc[0].coords, nc[1].coords, nc[2].coords);
				y = glVec3.cross(z, x);
				break;
			case 4:
				let v1 = glVec3.sub(nc[2].coords, nc[0].coords).normalize(),
					v2 = glVec3.sub(nc[3].coords, nc[1].coords).normalize();
				x = glVec3.sub(v1, v2).normalize();
				y = glVec3.add(v1, v2).normalize();
				z = glVec3.cross(x, y);
				break;
		}
		return [x, y, z];
	}
	get normal() {
		if (this.nodeCount == 3 || this.nodeCount == 4) {
			return this.eCid[2];
		}
	}
	get glCoords() {
		let coords, off;
		if (this.nodeCount == 4) {
			coords = new Array(18);
			off = [this.con[0].glID * 3, this.con[1].glID * 3, this.con[2].glID * 3,
				this.con[0].glID * 3, this.con[2].glID * 3, this.con[3].glID * 3
			];
			for (let i = 0; i < 6; i++) {
				coords[i * 3] = glNodes.coords[off[i]];
				coords[i * 3 + 1] = glNodes.coords[off[i] + 1];
				coords[i * 3 + 2] = glNodes.coords[off[i] + 2];
			}
		} else {
			coords = new Array(this.nodeCount * 3);
			for (let i = 0; i < this.nodeCount; i++) {
				off = this.con[i].glID * 3;
				coords[i * 3] = glNodes.coords[off];
				coords[i * 3 + 1] = glNodes.coords[off + 1];
				coords[i * 3 + 2] = glNodes.coords[off + 2];
			}
		}
		return coords;
	}
	setStage() {
		let off, show;
		if (this.groupShow && this.show) {
			if (this.groupSelect || this.select) {
				show = this.nodeCount == 2 ? 0.7 : 0.8;
			} else {
				show = 1;
			}
		} else {
			show = 0;
		}

		if (this.nodeCount == 2) {
			off = this.glID * 2;
			glBars.ctrStage[this.glID] = show; //selection centroids

			glBars.stage[off] = show;
			glBars.stage[off + 1] = show;
		} else if (this.nodeCount == 3) {
			off = this.glID * 3;
			glTrias.stage[off] = show;
			glTrias.stage[off + 1] = show;
			glTrias.stage[off + 2] = show;
		} else if (this.nodeCount == 4) {
			off = this.glID * 6;
			glQuads.stage[off] = show;
			glQuads.stage[off + 1] = show;
			glQuads.stage[off + 2] = show;
			glQuads.stage[off + 3] = show;
			glQuads.stage[off + 4] = show;
			glQuads.stage[off + 5] = show;
		}
	}

}

class fmCID {
	constructor(origin, mat, type) {
		this.origin = new glVec3(origin); //CID origin
		this.mat = new glMat33(mat); //transformation matris
		this.type = type; //CID type
	}
	get xAxis() {
		return new glVec3(this.mat[0][0], this.mat[0][1], this.mat[0][2]);
	}
	get yAxis() {
		return new glVec3(this.mat[1][0], this.mat[1][1], this.mat[1][2]);
	}
	get zAxis() {
		return new glVec3(this.mat[2][0], this.mat[2][1], this.mat[2][2]);
	}
	createFrom3Points(p1, p2, p3) {
		this.origin = p1;
		this.type = 'R';

		let u = glVec3.sub(p2, p1).normalize(),
			v = glVec3.sub(p3, p1).normalize(),
			w = glVec3.cross(u, v).normalize();

		v = glVec3.cross(w, u);

		this.mat.arr33 = [
			[u[0], u[1], u[2]],
			[v[0], v[1], v[2]],
			[w[0], w[1], w[2]]
		];
	}
	multVector(v) {
		return this.mat.multVector(v);
	}
	cylinderDispl(v, c) {
		let cv = glVec3.sub(c, this.origin),
			nv = new glVec3(this.mat[0][2], this.mat[1][2], this.mat[2][2]),
			rv = new glVec3(
				(1 - nv[0] ** 2) * cv[0] - nv[0] * nv[1] * cv[1] - nv[0] * nv[2] * cv[2],
				-nv[0] * nv[1] * cv[0] + (1 - nv[1] ** 2) * cv[1] - nv[1] * nv[2] * cv[2],
				-nv[0] * nv[2] * cv[0] - nv[1] * nv[2] * cv[1] + (1 - nv[2] ** 2) * cv[2]
			).normalize(),
			tv = glVec3.cross(nv, rv);

		return new glVec3(
			rv[0] * v[0] + tv[0] * v[1] + nv[0] * v[2],
			rv[1] * v[0] + tv[1] * v[1] + nv[1] * v[2],
			rv[2] * v[0] + tv[2] * v[1] + nv[2] * v[2]
		);
	}
}

class fmPRod {
	constructor(a, mid) {
		this.a = a; //Area
		this.mid = mid; //Material ID
	}
}

class fmPShell {
	constructor(t, mid) {
		this.t = t; //Thickness
		this.mid = mid; //Material ID
	}
}

class fmPShear {
	constructor(t, mid) {
		this.t = t; //Thickness
		this.mid = mid; //Material ID
	}
}

class fmMat1 {
	constructor(e, nu) {
		this.e = e; //Elestic modul
		this.nu = nu; //Poisson ratio
	}
}