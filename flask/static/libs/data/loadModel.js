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

class $loadModel {
	constructor() {

	}
	load(bdfData) {
		let count;

		// Load nodes
		this.loadNodes(bdfData.GRID[0]);

		// Load 1D elements
		count = 0;
		count += bdfData.CROD[0].count || 0;
		count += bdfData.CBAR[0].count || 0;
		count += bdfData.CBEAM[0].count || 0;

		if (count) {
			glBars.ctrStage = new Float32Array(count);
			glBars.ctrStage.fill(1);
			glBars.stage = new Float32Array(count * 2);
			glBars.stage.fill(1);

			glBars.centroids = new Float32Array(count * 3);
			glBars.selCtrColors = new Float32Array(count * 4);

			glBars.coords = new Float32Array(count * 6);
			glBars.barycentric = new Float32Array(count * 6);
			glBars.colors = new Float32Array(count * 8);
			glBars.colors.appendNTimes([1, 1, 0, 1], count * 2, 0);
			glBars.selColors = new Float32Array(count * 8);

			if (bdfData.hasOwnProperty('CROD'))
				this.loadBarElms(bdfData.CROD[0], "CROD");
			if (bdfData.hasOwnProperty('CBAR'))
				this.loadBarElms(bdfData.CBAR[0], "CBAR");
			if (bdfData.hasOwnProperty('CBEAM'))
				this.loadBarElms(bdfData.CBEAM[0], "CBEAM");
		}

		// Load trias
		count = 0;
		count += bdfData.CTRIA3[0].count || 0;

		if (count) {
			glTrias.stage = new Float32Array(count * 3);
			glTrias.stage.fill(1);

			glTrias.coords = new Float32Array(count * 9);
			glTrias.barycentric = new Float32Array(count * 9);
			glTrias.normals = new Float32Array(count * 9);

			glTrias.colors = new Float32Array(count * 12);
			glTrias.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], count * 3, 0);
			glTrias.selColors = new Float32Array(count * 12);

			this.loadTriaElms(bdfData.CTRIA3[0], "CTRIA");
		}

		// Load quads
		count = 0;
		count += bdfData.CQUAD4[0].count || 0;
		count += bdfData.CSHEAR[0].count || 0;

		if (count) {
			glQuads.stage = new Float32Array(count * 6);
			glQuads.stage.fill(1);

			glQuads.coords = new Float32Array(count * 18);
			glQuads.barycentric = new Float32Array(count * 18);
			glQuads.normals = new Float32Array(count * 18);

			glQuads.colors = new Float32Array(count * 24);
			glQuads.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], count * 6, 0);

			glQuads.selColors = new Float32Array(count * 24);

			if (bdfData.hasOwnProperty('CQUAD4'))
				this.loadQuadElms(bdfData.CQUAD4[0], "CQUAD");
			if (bdfData.hasOwnProperty('CSHEAR'))
				this.loadQuadElms(bdfData.CSHEAR[0], "CSHEAR");
		}

		// Load CIDs
		if (bdfData.hasOwnProperty('CORDR'))
			this.loadCID(bdfData.CORDR[0], 'R');
		if (bdfData.hasOwnProperty('CORDC'))
			this.loadCID(bdfData.CORDC[0], 'C');

		// Load Props
		if (bdfData.hasOwnProperty('PROD'))
			this.loadProp(bdfData.PROD[0], 'PROD');
		if (bdfData.hasOwnProperty('PSHELL'))
			this.loadProp(bdfData.PSHELL[0], 'PSHELL');
		if (bdfData.hasOwnProperty('PSHEAR'))
			this.loadProp(bdfData.PSHEAR[0], 'PSHEAR');

		// Load Mats
		if (bdfData.hasOwnProperty('MAT1'))
			this.loadMat(bdfData.MAT1[0], 'MAT1');

		model = new $glMesh();

		// Check if results have moments
		model.hasMoments = bdfData.dbMoments;
	}
	loadNodes(inpData) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			acid = this.matListToArray(inpData.acid),
			tmpNode, sColor, off;

		glNodes.count = count;

		glNodes.stage = new Float32Array(count);
		glNodes.stage.fill(0.9);

		glNodes.selColors = new Float32Array(count * 4);
		glNodes.colors = new Float32Array(count * 4);

		glNodes.coords = new Float32Array(inpData.coords);

		for (let i = 0; i < count; i++) {
			tmpNode = new fmNode(ids[i], i, acid[i]);
			fmNodes.push(tmpNode);
			fmNodesDict[ids[i]] = tmpNode;

			sColor = hover.createColor(i * 10 + 1);

			off = i * 4;
			glNodes.selColors.append(sColor, off);
			glNodes.colors.append([0.9, 0, 0, 1], off);
		}

	}
	loadBarElms(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			pids = inpData.pid == 'same' ? ids : this.listToArray(inpData.pid),
			ni = inpData.connectivity,
			nOff, off,
			nc = glNodes.coords,
			tmpElm, sColor;

		for (let i = 0; i < count; i++) {
			tmpElm = new fmElm(ids[i], glBars.count + i, inpType, [ni[i * 2], ni[i * 2 + 1]], pids[i]);
			fmElems.push(tmpElm);
			fmElemsDict[ids[i]] = tmpElm;

			fmNodes[tmpElm.con[0]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[1]].conElm.push(tmpElm);

			nOff = [tmpElm.con[0] * 3, tmpElm.con[1] * 3];

			off = (glBars.count + i) * 3;
			glBars.centroids[off] = (nc[nOff[0]] + nc[nOff[1]]) / 2;
			glBars.centroids[off + 1] = (nc[nOff[0] + 1] + nc[nOff[1] + 1]) / 2;
			glBars.centroids[off + 2] = (nc[nOff[0] + 2] + nc[nOff[1] + 2]) / 2;

			off *= 2; //(glBars.count+i)*6
			glBars.coords.insertArr(nc, off, nOff);
			glBars.barycentric.append(BARYCENTRIC.BAR, off);

			sColor = hover.createColor((fmElems.length - 1) * 10 + 2);

			off = (glBars.count + i) * 4;
			glBars.selCtrColors.append(sColor, off);

			off *= 2; //(glBars.count+i)*8
			glBars.selColors.appendNTimes(sColor, 2, off);
		}
		glBars.count += count;
	}
	loadTriaElms(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			pids = inpData.pid == 'same' ? ids : this.listToArray(inpData.pid),
			ni = inpData.connectivity,
			off, nOff,
			nc = glNodes.coords,
			norm, tmpElm, sColor;

		for (let i = 0; i < count; i++) {
			tmpElm = new fmElm(ids[i], glTrias.count + i, inpType, [ni[i * 3], ni[i * 3 + 1], ni[i * 3 + 2]], pids[i]);
			fmElems.push(tmpElm);
			fmElemsDict[ids[i]] = tmpElm;

			fmNodes[tmpElm.con[0]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[1]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[2]].conElm.push(tmpElm);

			nOff = [tmpElm.con[0] * 3, tmpElm.con[1] * 3, tmpElm.con[2] * 3];

			off = (glTrias.count + i) * 9;
			glTrias.coords.insertArr(nc, off, nOff);
			glTrias.barycentric.append(BARYCENTRIC.TRIA, off);
			norm = tmpElm.normal;
			glTrias.normals.appendNTimes(norm.xyz, 3, off);

			off = (glTrias.count + i) * 12;
			sColor = hover.createColor((fmElems.length - 1) * 10 + 3);
			glTrias.selColors.appendNTimes(sColor, 3, off);
		}
		glTrias.count += count;
	}
	loadQuadElms(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			pids = inpData.pid == 'same' ? ids : this.listToArray(inpData.pid),
			ni = inpData.connectivity,
			con, off, nOff,
			nc = glNodes.coords,
			norm, tmpElm, sColor;

		for (let i = 0; i < count; i++) {
			tmpElm = new fmElm(ids[i], glQuads.count + i, inpType, [ni[i * 4], ni[i * 4 + 1], ni[i * 4 + 2], ni[i * 4 + 3]], pids[i]);
			fmElems.push(tmpElm);
			fmElemsDict[ids[i]] = tmpElm;

			fmNodes[tmpElm.con[0]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[1]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[2]].conElm.push(tmpElm);
			fmNodes[tmpElm.con[3]].conElm.push(tmpElm);

			nOff = [tmpElm.con[0] * 3, tmpElm.con[1] * 3, tmpElm.con[2] * 3, tmpElm.con[3] * 3];

			off = (glQuads.count + i) * 18;
			glQuads.coords.insertArr(nc, off,
				[
					nOff[0], nOff[1], nOff[2], // 1st triangle
					nOff[0], nOff[2], nOff[3] // 2nd triangle
				] 
			);
			glQuads.barycentric.append(BARYCENTRIC.QUAD, off);

			norm = tmpElm.normal;

			glQuads.normals.append(
				[
					norm[2].xyz[0], norm[2].xyz[1], norm[2].xyz[2],
					norm[0].xyz[0], norm[0].xyz[1], norm[0].xyz[2],
					norm[2].xyz[0], norm[2].xyz[1], norm[2].xyz[2],

					norm[2].xyz[0], norm[2].xyz[1], norm[2].xyz[2],
					norm[2].xyz[0], norm[2].xyz[1], norm[2].xyz[2],
					norm[1].xyz[0], norm[1].xyz[1], norm[1].xyz[2],
				],
				off);

			off = (glQuads.count + i) * 24;
			sColor = hover.createColor((fmElems.length - 1) * 10 + 4);
			glQuads.selColors.appendNTimes(sColor, 6, off);
		}
		glQuads.count += count;
	}
	loadCID(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			offO, offM, tmpCID;
		for (let i = 0; i < count; i++) {
			offO = i * 3;
			offM = i * 9;
			tmpCID = new fmCID([inpData.origin[offO], inpData.origin[offO + 1], inpData.origin[offO + 2]],
				[
					[inpData.mat[offM], inpData.mat[offM + 3], inpData.mat[offM + 6]],
					[inpData.mat[offM + 1], inpData.mat[offM + 4], inpData.mat[offM + 7]],
					[inpData.mat[offM + 2], inpData.mat[offM + 5], inpData.mat[offM + 8]]
				], inpType);
			fmCIDDict[ids[i]] = tmpCID;
		}
	}
	loadProp(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			mids = this.matListToArray(inpData.mid),
			tmpProp;
		for (let i = 0; i < count; i++) {
			if (inpType == 'PROD')
				tmpProp = new fmPRod(inpData.area[i], mids[i]);
			else if (inpType == 'PSHELL')
				tmpProp = new fmPShell(inpData.t[i], mids[i]);
			else if (inpType == 'PSHEAR')
				tmpProp = new fmPShear(inpData.t[i], mids[i]);
			fmPropDict[ids[i]] = tmpProp;
		}
	}
	loadMat(inpData, inpType) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			tmpMat;
		for (let i = 0; i < count; i++) {
			if (inpType == 'MAT1')
				tmpMat = new fmMat1(inpData.e[i], inpData.nu[i]);
			fmMatDict[ids[i]] = tmpMat;
		}
	}
	listToArray(list) {
		let splitData = list.trim().split(' '),
			b, start, end, step, arr = [];

		for (const data of splitData) {
			b = data.split(':').map(Number);
			start = b[0];
			end = b[1] ? b[1] : b[0];
			step = b[2] ? b[2] : 1;

			for (let j = start; j <= end; j += step) {
				arr.push(j);
			}
		}
		return arr;
	}
	matListToArray(list) {
		let splitData = list.trim().split(' '),
			b, id, iter, arr = [];

		for (const data of splitData) {
			b = data.split('x').map(Number);
			id = b[0];
			iter = b[1] ? b[1] : 1;

			for (let j = 0; j < iter; j++) {
				arr.push(id);
			}
		}
		return arr;
	}
}

const loadModel = new $loadModel();