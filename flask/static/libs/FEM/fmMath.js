//------------fmVec------------
var fmVec = {
	length:function(v){
		return Math.hypot(v[0], v[1], v[2]);
	},
	add:function(v, vv){
		return [v[0]+vv[0], v[1]+vv[1], v[2]+vv[2]];
	},
	sub:function(v, vv){
		return [v[0]-vv[0], v[1]-vv[1], v[2]-vv[2]];
	},
	norm:function(v){
		let invL = 1/Math.hypot(v[0], v[1], v[2]);
		return [v[0]*invL, v[1]*invL, v[2]*invL]; 
	},
	dot:function(v, vv){
		return v[0]*vv[0] + v[1]*vv[1] + v[2]*vv[2];
	},
	cross:function(v, vv){
		return [v[1]*vv[2] - v[2]*vv[1], v[2]*vv[0] - v[0]*vv[2], v[0]*vv[1] - v[1]*vv[0]];
	},
	avg:function(...args){
		let ans = [0, 0, 0];
		for(let i = 0; i < args.length; i ++){
			ans[0] += args[i][0];
			ans[1] += args[i][1];
			ans[2] += args[i][2];
		}
		
		ans[0] /= args.length;
		ans[1] /= args.length;
		ans[2] /= args.length;
		
		return ans;
	},
	scaleAndAdd:function(...args){
		let ans = [0, 0, 0];
		for(let i = 0; i < args.length; i += 2){
			ans[0] += args[i+1] * args[i][0];
			ans[1] += args[i+1] * args[i][1];
			ans[2] += args[i+1] * args[i][2];
		}
		return ans;
	}
};

//------------fmMat3------------
var fmMat3 = {
	multVec:function(m, v){
		return [
				m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
				m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
				m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]
			];
	}
};