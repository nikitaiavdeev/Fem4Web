resultsDispl = function (){
	this.glNodesCoords;
	this.glBarsCoords;
	this.glBarsCtrCoords;
	this.glTriasCoords;
	this.glQuadsCoords;
	this.lcID;
	this.resData = [];
	
	this.init();
	sideBar.currentObject = this;
}

resultsDispl.prototype = {
	init:function(){
		this.selectLC = sideBar.addTextBox(
				/*object*/		this.selectLC,
				/*caption*/		'Enter LC ID:', 
				/*inpVal*/		'',
				/*inpType*/		'int',
				/*focus*/		true
			);

		let row = sideBar.addRow();
		this.trueScale = sideBar.addRadio(
				/*object*/		this.trueScale,
				/*caption*/		'True Scale', 
				/*groupName*/	'group1',
				/*isChecked*/	true,
				/*parent*/		row );
		this.modelScale = sideBar.addRadio(
				/*object*/		this.modelScale,
				/*caption*/		'Model Scale', 
				/*groupName*/	'group1',
				/*isChecked*/	false,
				/*parent*/		row );
		
		this.SF = sideBar.addTextBox(
				/*object*/		this.SF,
				/*caption*/		'Scale Factor:', 
				/*inpVal*/		'1.0',
				/*inpType*/		'float',
				/*focus*/		false
			);
		
		row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
				/*object*/		this.applyBtn,
				/*caption*/ 	'Apply',
				/*parent*/ 		row,
				/*callback*/	this.apply
			);
		this.clearBtn = sideBar.addButton(
				/*object*/		this.clearBtn,
				/*caption*/ 	'Clear All',
				/*parent*/ 		row,
				/*callback*/	this.clearAll
			);
	},
	updateDispl:function(){
		let off, v, coord, dis, loc;
		let scale = parseFloat(this.SF.value);
		
		if(!this.glNodesCoords){
			this.glNodesCoords = [...glNodes.coords];
			this.glBarsCoords = [...glBars.coords];
			this.glBarsCtrCoords = [...glBars.centroids];
			this.glTriasCoords = [...glTrias.coords];
			this.glQuadsCoords = [...glQuads.coords];
		}

		for(let i = 0; i < glNodes.count; i++){
			off = i*3;
			dis = this.resData[i];
			loc = [this.glNodesCoords[off], this.glNodesCoords[off+1], this.glNodesCoords[off+2]]
			
			if(fmNodes[i].acid){
				coord = fmCIDDict[fmNodes[i].acid];
				if(coord.type == 'R')
					dis = coord.multVector(dis);
				else if(coord.type == 'C')
					dis = coord.cylinderDispl(dis, loc);
			}
			
			glNodes.coords[off] = loc[0] + dis[0] * scale;
			glNodes.coords[off+1] = loc[1] + dis[1] * scale;
			glNodes.coords[off+2] = loc[2] + dis[2] * scale;
		}

		let nc = glNodes.coords,
			elmOff = 0;

		for(let i = 0; i < glBars.count; i++){
			nOff = [fmElems[i].con[0]*3, fmElems[i].con[1]*3];		
			
			off = i*3;
			glBars.centroids[off]   = ( nc[nOff[0]  ] + nc[nOff[1]  ] )/2;
			glBars.centroids[off+1] = ( nc[nOff[0]+1] + nc[nOff[1]+1] )/2;
			glBars.centroids[off+2] = ( nc[nOff[0]+2] + nc[nOff[1]+2] )/2;
			
			off *= 2;
			glBars.coords.insertArr(nc, off, nOff);
		}

		elmOff += glBars.count;
		for(let i = 0; i < glTrias.count; i++){
			nOff = [fmElems[elmOff+i].con[0]*3, fmElems[elmOff+i].con[1]*3, fmElems[elmOff+i].con[2]*3];
			glTrias.coords.insertArr(nc, i*9, nOff);
		}

		elmOff += glTrias.count;
		for(let i = 0; i < glQuads.count; i++){
			nOff = [fmElems[elmOff+i].con[0]*3, fmElems[elmOff+i].con[1]*3, fmElems[elmOff+i].con[2]*3, fmElems[elmOff+i].con[3]*3];
			glQuads.coords.insertArr(nc, i*18, 
						[nOff[0], nOff[1], nOff[2], // 1st triangle
						 nOff[0], nOff[2], nOff[3]] // 2nd triangle
					);
		}

		model.updateCoords();
		model.updateSelectCoords();
	},
	//CallBacks
	apply:function(e){
		let	self = resultsDispl,
			xhr = new XMLHttpRequest();   // new HttpRequest instance 
		
		if ( self.lcID == self.selectLC.value){
			self.updateDispl();
			return;
		} else {
			self.lcID = self.selectLC.value;
		}
		
		xhr.open('POST', '/displacement', true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		xhr.send(JSON.stringify({ 
			'LC': self.lcID
			}));
		
		loaderShow();
		
		xhr.onreadystatechange = function () {
			loaderFade();
			
			if(xhr.readyState === 4 && xhr.status === 200) {
				self.resData = JSON.parse(xhr.responseText).displ;
				self.updateDispl();
			}
		}
	},
	clearAll:function(e){
		let	self = resultsDispl;
		if(self.glNodesCoords){
			glNodes.coords = [...self.glNodesCoords];
			glBars.coords = [...self.glBarsCoords];
			glBars.centroids = [...self.glBarsCtrCoords];
			glTrias.coords = [...self.glTriasCoords];
			glQuads.coords = [...self.glQuadsCoords];
			
			self.glNodesCoords = null;
			self.glBarsCoords = null;
			self.glBarsCtrCoords = null;
			self.glTriasCoords = null;
			self.glQuadsCoords = null;
			
			model.updateCoords();
			model.updateSelectCoords();
		}
	}	
}

var resultsDispl = new resultsDispl();