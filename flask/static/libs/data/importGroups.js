importFiles = function (inpFiles) {
	let inpFile = inpFiles[0];
	let reader = new FileReader();

	loaderShow();
	reader.onloadend = function (e) {
		if (e.target.readyState == FileReader.DONE) {
			let groupName, lineData, curGroup,
				fileData = this.result.replace(/" [\/][\/] @(\r\n|\n)"/g, '');
			// Clear Group show and select			
			for (const elm of fmElems) {
				elm.groupShow = 0;
				elm.groupSelect = 0;
			}
			for (const node of fmNodes) {
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

			for (const node of fmNodes)
				node.setStage();
			for (const elm of fmElems)
				elm.setStage();
			model.updateStages();
			model.updateSelectStages();
		}
		loaderFade();
	};

	reader.readAsBinaryString(inpFile);

};