Number.prototype.between = function (a, b) {
	return this >= a && this <= b;
};

Float32Array.prototype.append = function (arr, start) {
	for (let i = 0; i < arr.length; i++) {
		this[start + i] = arr[i];
	}
};

Float32Array.prototype.appendNTimes = function (arr, n, start) {
	let len = arr.length;
	for (let i = 0; i < n; i++) {
		let off = i * len;
		for (let j = 0; j < len; j++) {
			this[start + off + j] = arr[j];
		}
	}
};

Float32Array.prototype.concat = function (...arrays) {
	let totalLength = this.length;
	for (const arr of arrays) {
		totalLength += arr.length;
	}
	let result = new Float32Array(totalLength),
		offset = this.length;
	result.set(this, 0);
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
};

Float32Array.prototype.insertArr = function (arr, start, nOff) {
	for (let i = 0; i < nOff.length; i++) {
		let off = i * 3;
		for (let j = 0; j < 3; j++) {
			this[start + off + j] = arr[nOff[i] + j];
		}
	}
};