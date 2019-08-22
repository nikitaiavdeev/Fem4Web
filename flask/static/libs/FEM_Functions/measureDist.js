measureDist = function (){
	this.init();
	sideBar.currentObject = this;
}

measureDist.prototype = {
	init:function(){
		this.selectNode1 = sideBar.addSelect(
				/*object*/		this.selectNode1,
				/*caption*/ 	'Select 1st Node:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		true
			);
		
		this.selectNode2 = sideBar.addSelect(
				/*object*/		this.selectNode2,
				/*caption*/ 	'Select 2nd Node:', 
				/*inpVal*/		'',
				/*selec type*/ 	selectFilter.NODES,
				/*focus*/ 		false
			);	
			
		let row = sideBar.addBtnRow();
		this.applyBtn = sideBar.addButton(
				/*object*/		this.applyBtn,
				/*caption*/ 	'Apply',
				/*parent*/ 		row, 
				/*callback*/ 	this.apply
			);
		this.clearBtn = sideBar.addButton(
				/*object*/		this.clearBtn,
				/*caption*/ 	'Clear All',
				/*parent*/ 		row, 
				/*callback*/	this.clearAll
			);
	},
	//CallBacks
	apply:function(e){
		let	self = measureDist,
			nodeList1 = new fmList,
			nodeList2 = new fmList;
			
		nodeList1.readList(self.selectNode1.value);
		nodeList2.readList(self.selectNode2.value);
		
		let p1 = nodeList1.nodeArr[0].getCoords(),
			p2 = nodeList2.nodeArr[0].getCoords(),
			centr = [(p1[0] + p2[0])/2, (p1[1] + p2[1])/2, (p1[2] + p2[2])/2],
			dist = Math.hypot(p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]);
		
		measure.addPoint(p1);
		measure.addPoint(p2);
		
		measure.addLine(p1, p2);
		glText.measureCoords.push(...centr);
		glText.measureText.push(dist.toFixed(2));

		glText.updateLocations();
	},
	clearAll:function(e){
		glText.measureCoords = [];
		glText.measureText = [];
		glText.updateLocations();
		
		measure.lineCoords = [];
		measure.pointCoords = [];
	}
}

var measureDist = new measureDist();