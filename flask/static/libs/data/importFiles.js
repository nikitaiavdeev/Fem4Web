class $importFiles {
	constructor() {}
	importClick(option) {
		const input = document.getElementById('importFiles');
		switch (option) {
			case 'Groups .ses':
				input.setAttribute('accept', '.ses');
				input.onchange = function () {
					importFiles.importGroups(this.files);
				};
				input.click();
				break;
			case 'Model .bdf':
				const importBdf = new $importBdf();
				break;
		}
	}
	importGroups(inpFiles) {
		let inpFile = inpFiles[0];
		let reader = new FileReader();

		loaderShow();
		reader.onloadend = function (e) {
			const fr = e.target;
			if (fr.readyState == FileReader.DONE) {
				let groupName, lineData, curGroup,
					fileData = fr.result.replace(/" [\/][\/] @(\r\n|\n)"/g, '');
				// Clear Group show and select			
				for (const [key, node] of Object.entries(fmElemsDict)) {
					elm.groupShow = 0;
					elm.groupSelect = 0;
				}
				for (const [key, node] of Object.entries(fmNodesDict)) {
					node.groupShow = 0;
					node.groupSelect = 0;
				}

				fileData = fileData.split(/\r\n|\n/);
				for (let i = 0; i < fileData.length; i++) {
					if (fileData[i].indexOf('ga_group_create') > -1) {
						groupName = fileData[i].match(/".*?"/);
						if (groupName) {
							groupName = groupName[0].replace(/"/g, '');
						}
						tree.addGroup(new guiGroup(groupName));
						fmGroupsDict[groupName] = new fmGroup(groupName);
					} else if (fileData[i].indexOf('ga_group_entity_add') > -1) {
						lineData = fileData[i].match(/".*?"/g);
						if (lineData) {
							groupName = lineData[0].replace(/"/g, '');
							curGroup = fmGroupsDict[groupName];
							if (curGroup) {
								curGroup.list.readList(lineData[1]);
								curGroup.addShow();
							}
						}
					}
				}
				for (const [key, node] of Object.entries(fmNodesDict)) 
					node.setStage();
				for (const [key, elm] of Object.entries(fmElemsDict)) 
					elm.setStage();
				model.updateStages();
				model.updateSelectStages();
			}
			loaderFade();
		};

		reader.readAsBinaryString(inpFile);
	}
	parseBdfStr(str) {
		const f = parseFloat(str);
		if (isNaN(f))
			return str.trim();
		else
			return f;
	}
	readBdfLine(fileData, off) {
		let line = fileData[off],
			line_list = [];

		if (!line || line.includes('$'))
			return line_list;

		if (line.toUpperCase().includes('INCLUDE'))
			return !line.split();

		const s = line.includes('*') ? 16 : 8;

		//first word always 8
		const firstWord = line.substr(0, 8).replace('*', '').trim().toUpperCase();
		if (firstWord)
			line_list.push(firstWord);

		for (let i = 8; i < line.length; i += s) {
			line_list.push(this.parseBdfStr(line.substr(i, s)));
		}

		return line_list;
	}
	importBdf(inpFiles) {
		let reader = new FileReader();

		glNodes.coords = new Float32Array();

		reader.onloadend = (e) => {
			let fr = e.target,
				self = importFiles,
				i = 0,
				card, nextline;

			if (fr.readyState == FileReader.DONE) {
				let fileData = fr.result.split(/\r\n|\n/);

				nextline = self.readBdfLine(fileData, i++);
				while (i < fileData.length) {
					card = nextline;

					while (true) {
						nextline = self.readBdfLine(fileData, i++);
						if (nextline.length == 0) break;
						if (nextline[0] != "" && nextline[0] != "*") break;
						card.push(...nextline);
					}

					if (card.length == 0) continue;

					if (!card[0].includes('$')) {
						switch (card[0]) {
							case 'GRID':
								tmpNode = new fmNode(card[1], i, card[2]);
								fmNodesDict[tmpNode.id];
						}
					}
				}
			}
		};

		for (const inpFile of inpFiles) {
			reader.readAsBinaryString(inpFile);
		}
		loaderFade();
	}
}

const importFiles = new $importFiles();