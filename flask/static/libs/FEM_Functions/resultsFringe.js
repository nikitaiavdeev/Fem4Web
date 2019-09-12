class $resultsFringe {
	constructor(){
		sideBar.currentObject = this;
		
		this.selectLC = sideBar.addTextBox(
			/*object*/		this.selectLC,
			/*caption*/		'Enter LC ID:',
			/*inpVal*/		'',
			/*inpType*/		'int',
			/*focus*/		true
		);

		this.selectElements = sideBar.addSelect(
			/*object*/		this.selectElements,
			/*caption*/		'Select Elements:',
			/*inpVal*/		'',
			/*selec type*/	selectFilter.ELEMENTS,
			/*focus*/		false
		);

		let row = sideBar.addRow();
		this.discreate = sideBar.addRadio(
			/*object*/		this.discreate,
			/*caption*/		'Discreate',
			/*groupName*/	'group1',
			/*isChecked*/	true,
			/*parent*/		row
		);
		this.conrinuos = sideBar.addRadio(
			/*object*/		this.conrinuos,
			/*caption*/		'Conrinuos',
			/*groupName*/	'group1',
			/*isChecked*/	false,
			/*parent*/		row
		);

		this.resultType = sideBar.addMultiOption(
			/*object*/		this.resultType,
			/*caption*/		'Select Fringe:',
			/*focus*/		false,
			/*callback*/	this.typeChanged
		);
		sideBar.addMultiOptionAdd('Shell Forces', this.resultType);
		sideBar.addMultiOptionAdd('Shear Panel Forces', this.resultType);
		sideBar.addMultiOptionAdd('Bar Elms Forces', this.resultType);
		sideBar.addMultiOptionAdd('Bar Elms Moments', this.resultType);


		this.resultQuantity = sideBar.addMultiOption(
			/*object*/		this.resultQuantity,
			/*caption*/		'Quantity:',
			/*focus*/		false,
			/*callback*/	''
		);
		sideBar.addMultiOptionAdd('X Component', this.resultQuantity);
		sideBar.addMultiOptionAdd('Y Component', this.resultQuantity);
		sideBar.addMultiOptionAdd('XY Component', this.resultQuantity);
		sideBar.addMultiOptionAdd('Max Principal', this.resultQuantity);
		sideBar.addMultiOptionAdd('Min Principal', this.resultQuantity);
		sideBar.addMultiOptionAdd('Max Shear', this.resultQuantity);

		row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
			/*object*/		this.applyBtn,
			/*caption*/		'Apply',
			/*parent*/		row,
			/*callback*/	this.apply
		);
		this.clearBtn = sideBar.addButton(
			/*object*/		this.clearBtn,
			/*caption*/		'Clear All',
			/*parent*/		row,
			/*callback*/	this.clearAll
		);
	}
	getColor(val, maxRes, minRes) {
		let r = (val - minRes) / (maxRes - minRes) * 2 - 1;

		for (let i = 0; i < fringeBar.colors.length; i++) {
			if (r <= -1 + 2 * (i + 1) / (fringeBar.colors.length))
				return fringeBar.colors[i];
		}

	}
	//CallBacks
	typeChanged(e) {
		let self = resultsFringe;
		self.resultQuantity.innerHTML = '';

		switch (e.target.value) {
			case 'Shell Forces':
				sideBar.addMultiOptionAdd('X Component', self.resultQuantity);
				sideBar.addMultiOptionAdd('Y Component', self.resultQuantity);
				sideBar.addMultiOptionAdd('XY Component', self.resultQuantity);
				sideBar.addMultiOptionAdd('Max Principal', self.resultQuantity);
				sideBar.addMultiOptionAdd('Min Principal', self.resultQuantity);
				sideBar.addMultiOptionAdd('Max Shear', self.resultQuantity);
				break;
			case 'Shear Panel Forces':
				sideBar.addMultiOptionAdd('XY Component', self.resultQuantity);
				break;
			case 'Bar Elms Forces':
				sideBar.addMultiOptionAdd('Axial', self.resultQuantity);
				sideBar.addMultiOptionAdd('V1 Shear', self.resultQuantity);
				sideBar.addMultiOptionAdd('V2 Shear', self.resultQuantity);
				break;
			case 'Bar Elms Moments':
				sideBar.addMultiOptionAdd('X Component', self.resultQuantity);
				sideBar.addMultiOptionAdd('Y Component', self.resultQuantity);
				sideBar.addMultiOptionAdd('Z Component', self.resultQuantity);
				break;
		}
	}
	apply(e) {
		let self = resultsFringe,
			off = 0,
			resOff = 0,
			el = new fmList(),
			val, values = [],
			maxRes, minRes,
			xhr = new XMLHttpRequest(); // new HttpRequest instance 

		el.readList(self.selectElements.value);

		switch (self.resultType.value) {
			case 'Shell Forces':
				for (let i = 0; i < el.elmArr.length; i++)
					if (el.elmArr[i].type != "CQUAD" && el.elmArr[i].type != "CTRIA") {
						el.elmArr.splice(i, 1);
						i--;
					}
				break;
			case 'Shear Panel Forces':
				for (const elm of el.elmArr)
					if (elm.type != "CSHEAR")
						delete elm;
				break;
			case 'Bar Elms Forces':
				for (const elm of el.elmArr)
					if (elm.type != "CROD" || elm.type != "CBAR" || elm.type != "CBEAM")
						delete elm;
				break;
			case 'Bar Elms Moments':
				for (const elm of el.elmArr)
					if (elm.type != "CBAR" || elm.type != "CBEAM")
						delete elm;
				break;
		}

		el.fromArr(false);

		xhr.open('POST', '/forces', true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		xhr.send(JSON.stringify({
			'LC': self.selectLC.value,
			'elms': el.elmList
		}));

		loaderShow();

		xhr.onreadystatechange = function () {
			loaderFade();
			if (xhr.readyState === 4 && xhr.status === 200) {
				let rf = JSON.parse(xhr.responseText).force;

				for (let i = 0; i < rf.length / 3; i++) {
					off = i * 3;
					switch (self.resultQuantity.value) {
						case 'X Component':
							val = rf[off];
							break;
						case 'Y Component':
							val = rf[off + 1];
							break;
						case 'XY Component':
							val = rf[off + 2];
							break;
						case 'Max Principal':
							val = (rf[off] + rf[off + 1]) / 2 + Math.sqrt((rf[off] - rf[off + 1]) ** 2 / 4 + rf[off + 2] ** 2);
							break;
						case 'Min Principal':
							val = (rf[off] + rf[off + 1]) / 2 - Math.sqrt((rf[off] - rf[off + 1]) ** 2 / 4 + rf[off + 2] ** 2);
							break;
						case 'Max Shear':
							val = Math.sqrt((rf[off] - rf[off + 1]) ** 2 / 4 + rf[off + 2] ** 2);
							break;
					}
					values.push(val);
					if (i == 0 || val > maxRes)
						maxRes = val;
					if (i == 0 || val < minRes)
						minRes = val;
				}

				fringeBar.setFringe(maxRes, minRes);

				for (const elm of el.elmArr) {
					val = self.getColor(values[resOff], maxRes, minRes);
					resOff++;
					if (elm.type == 'CQUAD') {
						off = elm.glID * 24;
						glQuads.colors.appendNTimes(val, 6, off);
					} else if (elm.type == 'CTRIA') {
						off = elm.glID * 12;
						glTrias.colors.appendNTimes(val, 3, off);
					}
				}

				model.updateColors();
			}
		};
	}
	clearAll (e) {
		fringeBar.clear();
		glBars.colors.appendNTimes([1, 1, 0, 1], glBars.count * 2, 0);
		glTrias.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], glTrias.count * 3, 0);
		glQuads.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], glQuads.count * 6, 0);
		model.updateColors();
	}
}

const resultsFringe = new $resultsFringe();