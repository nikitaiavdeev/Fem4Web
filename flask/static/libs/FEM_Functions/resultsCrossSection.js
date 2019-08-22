resultsCrossSection = function (){
	this.init();
	sideBar.currentObject = this;
}

resultsCrossSection.prototype = {
	init:function(){
		let row;
		
		this.selectLC = sideBar.addTextBox(
				/*object*/		this.selectLC,
				/*caption*/		'Enter LC ID:', 
				/*inpVal*/		'10002',
				/*inpType*/		'int',
				/*focus*/		true
			);
			
		this.selectElements = sideBar.addSelect(
				/*object*/		this.selectElements,
				/*caption*/ 	'Select Elements:', 
				/*inpVal*/		'Element 1720105 1890701 1890707',
				/*selec type*/ 	selectFilter.ELEMENTS,
				/*focus*/ 		false
			);
			
		this.selectNodes = sideBar.addSelect(
				/*object*/		this.selectNodes,
				/*caption*/ 	'Select Nodes:',
				/*inpVal*/		'Node 900201 900222',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
		
		row = sideBar.addRow();
		this.GPM = sideBar.addCheckBox(
				/*object*/		this.GPM,
				/*caption*/		'Include Grid Point Moments', 
				/*isChecked*/	model.hasMoments,
				/*parent*/		row );
		
		if (!model.hasMoments){
			this.GPM.parentElement.setAttribute('disabled', '');
			this.GPM.setAttribute('disabled', '');
		}
		
		this.selectOrigin = sideBar.addSelect(
				/*object*/		this.selectOrigin,
				/*caption*/ 	'Select Origin:', 
				/*inpVal*/		'Node 900201',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
		
		this.selectIVector = sideBar.addSelect(
				/*object*/		this.selectIVector,
				/*caption*/ 	'Select i Axis:', 
				/*inpVal*/		'Node 900200',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
			
		this.selectJVector = sideBar.addSelect(
				/*object*/		this.selectJVector,
				/*caption*/ 	'Select i-j Plane:',
				/*inpVal*/		'Node 900222',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);
		
		this.offset = sideBar.addTextBox(
				/*object*/		this.offset,
				/*caption*/		'Y c.g. Offset:', 
				/*inpVal*/		'0.0',
				/*inpType*/		'float',
				/*focus*/		false
			);
		
		row = sideBar.addRow();
		this.components = sideBar.addRadio(
				/*object*/		this.components,
				/*caption*/		'Components', 
				/*groupName*/	'group1',
				/*isChecked*/	true,
				/*parent*/		row );
		this.resultant = sideBar.addRadio(
				/*object*/		this.resultant,
				/*caption*/		'Resultant', 
				/*groupName*/	'group1',
				/*isChecked*/	false,
				/*parent*/		row );
		
		row = sideBar.addRow();
		this.fx = sideBar.addCheckBox(
				/*object*/		this.fx,
				/*caption*/		'Fx', 
				/*isChecked*/	true,
				/*parent*/		row );
		this.fy = sideBar.addCheckBox(
				/*object*/		this.fy,
				/*caption*/		'Fy', 
				/*isChecked*/	true,
				/*parent*/		row );
		this.fz = sideBar.addCheckBox(
				/*object*/		this.fz,
				/*caption*/		'Fz', 
				/*isChecked*/	true,
				/*parent*/		row );
		
		row = sideBar.addRow();
		this.mx = sideBar.addCheckBox(
				/*object*/		this.mx,
				/*caption*/		'Mx', 
				/*isChecked*/	true,
				/*parent*/		row );
		this.my = sideBar.addCheckBox(
				/*object*/		this.my,
				/*caption*/		'My', 
				/*isChecked*/	true,
				/*parent*/		row );
		this.mz = sideBar.addCheckBox(
				/*object*/		this.mz,
				/*caption*/		'Mz', 
				/*isChecked*/	true,
				/*parent*/		row );
		
		row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
				/*object*/		this.applyBtn,
				/*caption*/ 'Apply',
				/*parent*/ row, 
				/*callback*/ this.apply
			);
		this.clearBtn = sideBar.addButton(
				/*object*/		this.clearBtn,
				/*caption*/ 'Clear All',
				/*parent*/ row, 
				/*callback*/this.clearAll
			);
	},
	//CallBacks
	apply:function(e){
		let self = resultsCrossSection,
			nl = new fmList,
			el = new fmList,
			mom = self.GPM.checked ? 6 : 3;
			xhr = new XMLHttpRequest();   // new HttpRequest instance 
		
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
			
			if(xhr.readyState === 4 && xhr.status === 200) {
				let	nc,	fSum = [0, 0, 0], mSum = [0, 0, 0],
					originNodeList = new fmList,
					iVectorNodeList = new fmList,
					jVectorNodeList = new fmList,
					rf = JSON.parse(xhr.responseText).GPFB;
				
				originNodeList.readList(self.selectOrigin.value);
				iVectorNodeList.readList(self.selectIVector.value);
				jVectorNodeList.readList(self.selectJVector.value);	
				
				let o = originNodeList.nodeArr[0].getCoords(),
					iN = iVectorNodeList.nodeArr[0].getCoords(),
					jN = jVectorNodeList.nodeArr[0].getCoords(),
					cid = new fmCID;
				
				cid.createFrom3Points(o, iN, jN);
				let arm = new Array(nl.nodeArr.length);
				
				for( let i = 0; i < arm.length; i++ ) {
					nc = nl.nodeArr[i].getCoords();
					arm[i] = [nc[0] - o[0], nc[1] - o[1], nc[2] - o[2]];
				}
				
				for( let i = 0; i < arm.length; i++  ){
					fSum[0] -= rf[i*mom + 0];
					fSum[1] -= rf[i*mom + 1];
					fSum[2] -= rf[i*mom + 2];
					
					if(self.GPM.checked){
						mSum[0] -= rf[i*mom + 3];
						mSum[1] -= rf[i*mom + 4];
						mSum[2] -= rf[i*mom + 5];
					}
					
					mSum[0] += arm[i][2] * rf[i*mom+1] - arm[i][1] * rf[i*mom+2];
					mSum[1] += arm[i][0] * rf[i*mom+2] - arm[i][2] * rf[i*mom+0];
					mSum[2] += arm[i][1] * rf[i*mom+0] - arm[i][0] * rf[i*mom+1];
				}
				
				fSum = cid.multVector(fSum);
				mSum = cid.multVector(mSum);
				
				let arrow, sgn, vec;
				
				if(self.fx.checked){
					fmVectors.addVector(o, cid.getXAxis(), fSum[0], [1, 0, 0]);
				}
				
				if(self.fy.checked){
					fmVectors.addVector(o, cid.getYAxis(), fSum[1], [0, 1, 0]);
				}
				
				if(self.fz.checked){
					fmVectors.addVector(o, cid.getZAxis(), fSum[2], [0, 0, 1]);
				}
				
				if(self.mx.checked){
					fmVectors.addVector(o, cid.getXAxis(), mSum[0], [1, 0, 1], true);
				}
				
				if(self.my.checked){
					fmVectors.addVector(o, cid.getYAxis(), mSum[1], [1, 1, 0], true);
				}
				
				if(self.mz.checked){
					fmVectors.addVector(o, cid.getZAxis(), mSum[2], [0, 1, 1], true);
				}
				
				glText.updateLocations();
			}
		};	
	},
	clearAll:function(e){
		fmVectors.arrows = [];
		glText.vectorText = [];
		glText.updateLocations();
	}
}

var resultsCrossSection = new resultsCrossSection();