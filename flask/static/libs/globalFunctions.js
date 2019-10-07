Number.prototype.between = function (a, b) {
	return this >= a && this <= b;
};

Float32Array.prototype.append = function (arr, start) {
	for (let i = 0; i < arr.length; i++) {
		this[start + i] = arr[i];
	}
};

Float32Array.prototype.appendNTimes = function (arr, n, start) {
	let len = arr.length;
	for (let i = 0; i < n; i++) {
		let off = i * len;
		for (let j = 0; j < len; j++) {
			this[start + off + j] = arr[j];
		}
	}
};

Float32Array.prototype.concat = function (...arrays) {
	let totalLength = this.length;
	for (const arr of arrays) {
		totalLength += arr.length;
	}
	let result = new Float32Array(totalLength),
		offset = this.length;
	result.set(this, 0);
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
};

//Float32Array.prototype.insertArr = function (arr, start, nOff) {
//	for (let i = 0; i < nOff.length; i++) {
//		let off = i * 3;
//		for (let j = 0; j < 3; j++) {
//			this[start + off + j] = arr[nOff[i] + j];
//		}
//	}
//};

Float32Array.prototype.addElmCords = function (elm, start) {
	let off;
	if (elm.nodeCount == 4) {
		off = [elm.con[0].glID * 3, elm.con[1].glID * 3, elm.con[2].glID * 3,
			elm.con[0].glID * 3, elm.con[2].glID * 3, elm.con[3].glID * 3
		];
		for (let i = 0; i < 6; i++) {
			this[start] = glNodes.coords[off[i]];
			this[start + 1] = glNodes.coords[off[i] + 1];
			this[start + 2] = glNodes.coords[off[i] + 2];
			start += 3;
		}
	} else {
		for (let i = 0; i < elm.nodeCount; i++) {
			off = elm.con[i].glID * 3;
			this[start] = glNodes.coords[off];
			this[start + 1] = glNodes.coords[off + 1];
			this[start + 2] = glNodes.coords[off + 2];
			start += 3;
		}
	}
};

Float32Array.prototype.addBarCentroid = function (elm, start) {
	const off1 = elm.con[0].glID * 3,
		off2 = elm.con[1].glID * 3;
	this[start] = (glNodes.coords[off1] + glNodes.coords[off2]) * 0.5;
	this[start + 1] = (glNodes.coords[off1 + 1] + glNodes.coords[off2 + 1]) * 0.5;
	this[start + 2] = (glNodes.coords[off1 + 2] + glNodes.coords[off2 + 2]) * 0.5;
};

Float32Array.prototype.addElmNormals = function (elm, start) {
	const norm = glVec3.getNormal(elm.con[0].coords, elm.con[1].coords, elm.con[2].coords).xyz;
	if (elm.nodeCount == 4) {
		const norm1 = glVec3.getNormal(elm.con[0].coords, elm.con[2].coords, elm.con[3].coords).xyz,
			avg = glVec3.add(norm, norm1).normalize().xyz;

		this[start] = avg[0];
		this[start + 1] = avg[1];
		this[start + 2] = avg[2];
		this[start + 3] = norm[0];
		this[start + 4] = norm[1];
		this[start + 5] = norm[2];
		this[start + 6] = avg[0];
		this[start + 7] = avg[1];
		this[start + 8] = avg[2];

		this[start + 9] = avg[0];
		this[start + 10] = avg[1];
		this[start + 11] = avg[2];
		this[start + 12] = avg[0];
		this[start + 13] = avg[1];
		this[start + 14] = avg[2];
		this[start + 15] = norm1[0];
		this[start + 16] = norm1[1];
		this[start + 17] = norm1[2];
	} else {
		this[start] = norm[0];
		this[start + 1] = norm[1];
		this[start + 2] = norm[2];
		this[start + 3] = norm[0];
		this[start + 4] = norm[1];
		this[start + 5] = norm[2];
		this[start + 6] = norm[0];
		this[start + 7] = norm[1];
		this[start + 8] = norm[2];
	}
};