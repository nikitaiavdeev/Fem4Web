measureRadius = function (){
	this.init();
	sideBar.currentObject = this;
}

measureRadius.prototype = {
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
		
		this.selectNode3 = sideBar.addSelect(
				/*object*/		this.selectNode3,
				/*caption*/ 	'Select 3rd Node:',
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
		let	self = measureRadius,
			nodeList1 = new fmList,
			nodeList2 = new fmList,
			nodeList3 = new fmList;
			
		nodeList1.readList(self.selectNode1.value);
		nodeList2.readList(self.selectNode2.value);
		nodeList3.readList(self.selectNode3.value);
		
		let p1 = nodeList1.nodeArr[0].getCoords(),
			p2 = nodeList2.nodeArr[0].getCoords(),
			p3 = nodeList3.nodeArr[0].getCoords(),
			v1 = fmVec.sub(p1, p2),
			v2 = fmVec.sub(p2, p3),
			v3 = fmVec.sub(p3, p1),
			l1 = fmVec.length(v1), l2 = fmVec.length(v2), l3 = fmVec.length(v3),
			l12 = l1*l1, l22 = l2*l2, l32 = l3*l3,
			c1 = l22*(l12 + l32 - l22)/((l1 + l3)**2 - l22)/(l22 - (l1 - l3)**2),
			c2 = l32*(l22 + l12 - l32)/((l2 + l1)**2 - l32)/(l32 - (l2 - l1)**2),
			c3 = l12*(l22 + l32 - l12)/((l2 + l3)**2 - l12)/(l12 - (l2 - l3)**2),
			centr = fmVec.scaleAndAdd(p1, c1, p2, c2, p3, c3),
			r = fmVec.length( fmVec.sub(centr, p1) );
			axis = fmVec.norm( fmVec.cross(v2, v3) );
		
		measure.addPoint(p1);
		measure.addPoint(p2);
		measure.addPoint(p3);
		
		v1 = fmVec.sub(p1, centr);
		v2 = fmVec.sub(p2, centr);
		v3 = fmVec.sub(p3, centr);
		
		let angle13 = Math.acos(fmVec.dot(v1, v3)/fmVec.length(v1)/fmVec.length(v3)),
			angle21 = Math.acos(fmVec.dot(v2, v1)/fmVec.length(v2)/fmVec.length(v1)),
			angle23 = Math.acos(fmVec.dot(v2, v3)/fmVec.length(v2)/fmVec.length(v3));
		
		if( Math.abs(angle13 - angle21 - angle23) > 0.01 )
			angle13 = 2 * Math.PI - angle13;
		
		let n = Math.ceil( angle13 / 0.1 ),
			da = angle13 / 2 / n, //delata angle
			c = Math.cos(da), s = Math.sin(da),
			rot = [ 
					[c + (1-c)*axis[0]**2, (1-c)*axis[0]*axis[1] - s*axis[2], (1-c)*axis[0]*axis[2] + s*axis[1]],
					[(1-c)*axis[0]*axis[1] + s*axis[2], c + (1-c)*axis[1]**2, (1-c)*axis[1]*axis[2] - s*axis[0]],
					[(1-c)*axis[0]*axis[2] - s*axis[1], (1-c)*axis[1]*axis[2] + s*axis[0], c + (1-c)*axis[2]**2]
				];
		
		for( i = 0; i < 2 * n; i++ ){
			v1 = fmMat3.multVec(rot, v1);
			p2 = fmVec.add(v1, centr);
			measure.addLine(p1, p2);
			
			if(i == n-1){
				measure.addLine(centr, p2);
				glText.measureCoords.push( ...fmVec.avg(centr, p2) );
				glText.measureText.push(r.toFixed(2));
			}
			
			p1 = p2;
		}
		
		glText.updateLocations();
	},
	clearAll:function(e){
		glText.measureCoords = [];
		glText.measureText = [];
		glText.updateLocations();
		
		measure.lineCoords = [];
		measure.pointCoords = [];
	}
};

var measureRadius = new measureRadius();