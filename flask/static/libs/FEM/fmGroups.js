fmGroupsDict = {};

fmGroup = function(name){
	this.name = name;
	this.list = new fmList;
}

fmGroup.prototype = {
	addShow:function(){
		for(elm of this.list.elmArr){
			elm.groupShow++;
		}
		for(node of this.list.nodeArr){
			node.groupShow++;
		}
	},
	toggleSelection:function(s, multiple = false){
		for(elm of this.list.elmArr){
			if (s) {
				elm.groupSelect ++;
			} else {
				elm.groupSelect --;
			}
			
			if ( elm.groupShow ){
				elm.setStage();
			}
		}
		
		for(node of this.list.nodeArr){
			if (s) {
				node.groupSelect ++;
			} else {
				node.groupSelect --;
			}
			
			if( node.groupShow ){
				node.setStage();
			}
		}
		
		if(!multiple){
			model.updateStages();
		}
	},
	toggleVisibility:function(v, s, multiple = false){
		for(elm of this.list.elmArr){
			if (v) {
				elm.groupShow ++;
				//if(s){elm.groupSelect ++;}
			} else {
				elm.groupShow --;
				//if(s){elm.groupSelect --;}
			}
			if( !elm.groupShow || elm.groupShow == 1 ){
				elm.setStage();
			}
		}
		
		for(node of this.list.nodeArr){
			if (v) {
				node.groupShow ++;
				if(s){node.groupSelect ++;}
			} else {
				node.groupShow --;
				if(s){node.groupSelect --;}
			}
			if( !node.groupShow || node.groupShow == 1 ){
				node.setStage();
			}
		}
		
		if(!multiple){
			model.updateStages();
			model.updateSelectStages();
		}
	}
}
