Number.prototype.between = function(a, b) {
	return this >= a && this <= b;
};

Array.prototype.append = function(arr, start){
	for(let i = 0; i < arr.length; i++){
		this[start+i] = arr[i];
	}
};

Array.prototype.appendNTimes = function(arr, n, start){
	let len = arr.length;
	for(let i = 0; i < n; i++){
		let off = i*len;
		for(let j = 0; j < len; j++){
			this[start+off+j] = arr[j];
		}
	}
};

Array.prototype.insertArr = function(arr, start, nOff){
	for(let i = 0; i < nOff.length; i++){
		let off = i*3;
		for(let j = 0; j < 3; j++){
			this[start + off +j] = arr[nOff[i] + j];
		}
	}
};