class $loadModel {
	constructor() {

	}
	load(bdfData) {
		let count;

		// Clear Model
		model = new $glMesh();

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
				this.loadElm(bdfData.CROD[0], "CROD", 2);
			if (bdfData.hasOwnProperty('CBAR'))
				this.loadElm(bdfData.CBAR[0], "CBAR", 2);
			if (bdfData.hasOwnProperty('CBEAM'))
				this.loadElm(bdfData.CBEAM[0], "CBEAM", 2);
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

			this.loadElm(bdfData.CTRIA3[0], "CTRIA3", 3);
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
				this.loadElm(bdfData.CQUAD4[0], "CQUAD4", 4);
			if (bdfData.hasOwnProperty('CSHEAR'))
				this.loadElm(bdfData.CSHEAR[0], "CSHEAR", 4);
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

		// init model
		model.init();

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
		glNodes.colors.appendNTimes([0.9, 0, 0, 1], count, 0);

		glNodes.coords = new Float32Array(inpData.coords);

		for (let i = 0; i < count; i++) {
			tmpNode = new fmNode(ids[i], i, acid[i]);

			sColor = hover.createColor(tmpNode.id * 10 + 1);

			off = i * 4;
			glNodes.selColors.append(sColor, off);
		}

	}
	loadElm(inpData, inpType, nCount) {
		let count = inpData.count,
			ids = this.listToArray(inpData.ids),
			pids = inpData.pid == 'same' ? ids : this.listToArray(inpData.pid),
			ni = inpData.connectivity, //nodes IDs
			con = new Array(nCount),
			tmpElm;

		for (let i = 0; i < count; i++) {
			// Connectivity
			for (let j = 0; j < nCount; j++) {
				con[j] = fmNodesDict[ni[i * nCount + j]];
			}
			// Create Element
			tmpElm = new fmElm(ids[i], inpType, con, pids[i]);
		}
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