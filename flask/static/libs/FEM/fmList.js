class fmList {
	constructor() {
		this.nodeList = '';
		this.elmList = '';

		this.nodeArr = [];
		this.elmArr = [];
	}
	fromArr(isNode = true) {
		let start = '',
			step, step1,
			arr, list = '';

		// Remove duplicates
		if (isNode) {
			arr = this.nodeArr.sort(fmList.compare);
		} else {
			arr = this.elmArr.sort(fmList.compare);
		}

		try {
			step1 = arr[1].id - arr[0].id;
		} catch (e) {
			step1 = null;
		}

		for (let i = 0; i < arr.length; i++) {
			step = step1;
			try {
				step1 = arr[i + 2].id - arr[i + 1].id;
			} catch (e) {
				step1 = null;
			}
			if (step != step1 || step == null) {
				if (start != '') {
					list += ' ' + start + ':' + arr[i + 1].id + ((step > 1) ? (':' + step) : '');
					start = '';
					i++;
					try {
						step1 = arr[i + 2].id - arr[i + 1].id;
					} catch (e) {
						step1 = null;
					}
				} else {
					list += ' ' + arr[i].id;
				}
			} else if (start == '') {
				start = arr[i].id;
			}
		}
		if (isNode) {
			this.nodeList = list;
		} else {
			this.elmList = list;
		}

		return list.trim();
	}
	readList(list) {
		this.nodeList = list.match(/(^|\W)(nodes|node|n)(^|\W)(\d| |:)+/i);
		this.nodeList = this.nodeList ? this.nodeList[0].replace(/(nodes|node|n)/i, '').trim() : '';
		this.nodeList = this.nodeList.replace('  ', ' ');
		this.nodeArr = [];
		this.listToArray(this.nodeList);

		this.elmList = list.match(/(^|\W)(elements|element|elm|e)($|\W)(\d| |:)+/i);
		this.elmList = this.elmList ? this.elmList[0].replace(/(elements|element|elm|e)/i, '').trim() : '';
		this.elmList = this.elmList.replace('  ', ' ');
		this.elmArr = [];
		this.listToArray(this.elmList, false);
	}
	listToArray(list, isNode = true) {
		let splitData = list.split(' '),
			b, start, end, step,
			tmpNode, tmpElm;

		for (const data of splitData) {
			b = data.split(':').map(Number);
			start = b[0];
			end = b[1] ? b[1] : b[0];
			step = b[2] ? b[2] : 1;

			for (let j = start; j <= end; j += step) {
				if (isNode) {
					tmpNode = fmNodesDict[j];
					if (tmpNode) {
						this.nodeArr.push(tmpNode);
					}
				} else {
					tmpElm = fmElemsDict[j];
					if (tmpElm) {
						this.elmArr.push(tmpElm);
					}
				}
			}
		}
	}
	static compare(a, b) {
		let comparison = 0;
		if (a.id > b.id) {
			comparison = 1;
		} else if (a.id < b.id) {
			comparison = -1;
		}
		return comparison;
	}
}