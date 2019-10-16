class $resultsCrossSection {
	constructor(oldMe = this) {
		let row, hasGPM = false;

		if (model)
			hasGPM = model.hasMoments;

		this.selectLC = sideBar.addTextBox(
			oldMe.selectLC, /*object*/
			'Enter LC ID:', /*caption*/
			'', /*inpVal*/
			'int', /*inpType*/
			true /*focus*/
		);

		this.selectElements = sideBar.addSelect(
			oldMe.selectElements, /*object*/
			'Select Elements:', /*caption*/
			'', /*inpVal*/
			selectFilter.ELEMENTS, /*selec type*/
			false /*focus*/
		);

		this.selectNodes = sideBar.addSelect(
			oldMe.selectNodes, /*object*/
			'Select Nodes:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			false /*focus*/
		);

		row = sideBar.addRow();
		this.GPM = sideBar.addCheckBox(
			oldMe.GPM, /*object*/
			'Include Grid Point Moments', /*caption*/
			hasGPM, /*isChecked*/
			row); /*parent*/

		if (!hasGPM) {
			this.GPM.parentElement.setAttribute('disabled', '');
			this.GPM.setAttribute('disabled', '');
		}

		this.selectOrigin = sideBar.addSelect(
			oldMe.selectOrigin, /*object*/
			'Select Origin:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			false /*focus*/
		);

		this.selectIVector = sideBar.addSelect(
			oldMe.selectIVector, /*object*/
			'Select i Axis:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			false /*focus*/
		);

		this.selectJVector = sideBar.addSelect(
			oldMe.selectJVector, /*object*/
			'Select i-j Plane:', /*caption*/
			'', /*inpVal*/
			selectFilter.NODES, /*selec type*/
			false /*focus*/
		);

		this.offset = sideBar.addTextBox(
			oldMe.offset, /*object*/
			'Y c.g. Offset:', /*caption*/
			'0.0', /*inpVal*/
			'float', /*inpType*/
			false /*focus*/
		);

		row = sideBar.addRow();
		this.components = sideBar.addRadio(
			oldMe.components, /*object*/
			'Components', /*caption*/
			'group1', /*groupName*/
			true, /*isChecked*/
			row /*parent*/
		);
		this.resultant = sideBar.addRadio(
			oldMe.resultant, /*object*/
			'Resultant', /*caption*/
			'group1', /*groupName*/
			false, /*isChecked*/
			row /*parent*/
		);

		row = sideBar.addRow();
		this.fx = sideBar.addCheckBox(
			oldMe.fx, /*object*/
			'Fx', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);
		this.fy = sideBar.addCheckBox(
			oldMe.fy, /*object*/
			'Fy', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);
		this.fz = sideBar.addCheckBox(
			oldMe.fz, /*object*/
			'Fz', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);

		row = sideBar.addRow();
		this.mx = sideBar.addCheckBox(
			oldMe.mx, /*object*/
			'Mx', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);
		this.my = sideBar.addCheckBox(
			oldMe.my, /*object*/
			'My', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);
		this.mz = sideBar.addCheckBox(
			oldMe.mz, /*object*/
			'Mz', /*caption*/
			true, /*isChecked*/
			row /*parent*/
		);

		row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
			oldMe.applyBtn, /*object*/
			'Apply', /*caption*/
			row, /*parent*/
			this.apply /*callback*/
		);
		this.clearBtn = sideBar.addButton(
			oldMe.clearBtn, /*object*/
			'Clear All', /*caption*/
			row, /*parent*/
			this.clearAll /*callback*/
		);
	}
	//CallBacks
	apply(e) {
		let self = resultsCrossSection,
			nl = new fmList(),
			el = new fmList(),
			mom = self.GPM.checked ? 6 : 3;
		xhr = new XMLHttpRequest(); // new HttpRequest instance 

		fmVectors.arrows = [];
		nl.readList(self.selectNodes.value);
		el.readList(self.selectElements.value);

		xhr.open('POST', '/crossSection', true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		xhr.send(JSON.stringify({
			'LC': self.selectLC.value,
			'elms': el.elmList,
			'nodes': nl.nodeList,
			'addMoments': self.GPM.checked
		}));

		loaderShow();

		xhr.onreadystatechange = function () {
			loaderFade();

			if (xhr.readyState === 4 && xhr.status === 200) {
				let nc, fSum = [0, 0, 0],
					mSum = [0, 0, 0],
					originNodeList = new fmList(),
					iVectorNodeList = new fmList(),
					jVectorNodeList = new fmList(),
					rf = JSON.parse(xhr.responseText).GPFB;

				originNodeList.readList(self.selectOrigin.value);
				iVectorNodeList.readList(self.selectIVector.value);
				jVectorNodeList.readList(self.selectJVector.value);

				let o = originNodeList.nodeArr[0].coords(),
					iN = iVectorNodeList.nodeArr[0].coords(),
					jN = jVectorNodeList.nodeArr[0].coords(),
					cid = new fmCID();

				cid.createFrom3Points(o, iN, jN);
				let arm = new Array(nl.nodeArr.length);

				for (let i = 0; i < arm.length; i++) {
					nc = nl.nodeArr[i].coords();
					arm[i] = [nc[0] - o[0], nc[1] - o[1], nc[2] - o[2]];
				}

				for (let i = 0; i < arm.length; i++) {
					fSum[0] -= rf[i * mom + 0];
					fSum[1] -= rf[i * mom + 1];
					fSum[2] -= rf[i * mom + 2];

					if (self.GPM.checked) {
						mSum[0] -= rf[i * mom + 3];
						mSum[1] -= rf[i * mom + 4];
						mSum[2] -= rf[i * mom + 5];
					}

					mSum[0] += arm[i][2] * rf[i * mom + 1] - arm[i][1] * rf[i * mom + 2];
					mSum[1] += arm[i][0] * rf[i * mom + 2] - arm[i][2] * rf[i * mom + 0];
					mSum[2] += arm[i][1] * rf[i * mom + 0] - arm[i][0] * rf[i * mom + 1];
				}

				fSum = cid.multVector(fSum);
				mSum = cid.multVector(mSum);

				let arrow, sgn, vec;

				if (self.fx.checked) {
					fmVectors.addVector(o, cid.getXAxis(), fSum[0], [1, 0, 0]);
				}

				if (self.fy.checked) {
					fmVectors.addVector(o, cid.getYAxis(), fSum[1], [0, 1, 0]);
				}

				if (self.fz.checked) {
					fmVectors.addVector(o, cid.getZAxis(), fSum[2], [0, 0, 1]);
				}

				if (self.mx.checked) {
					fmVectors.addVector(o, cid.getXAxis(), mSum[0], [1, 0, 1], true);
				}

				if (self.my.checked) {
					fmVectors.addVector(o, cid.getYAxis(), mSum[1], [1, 1, 0], true);
				}

				if (self.mz.checked) {
					fmVectors.addVector(o, cid.getZAxis(), mSum[2], [0, 1, 1], true);
				}

				glText.updateLocations();
			}
		};
	}
	clearAll(e) {
		fmVectors.arrows = [];
		glText.vectorText = [];
		glText.updateLocations();
	}
}

var resultsCrossSection = new $resultsCrossSection();