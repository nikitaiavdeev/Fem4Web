class $importBdf {
    constructor(inpFiles) {
        let reader = new FileReader();
        loaderShow();

        model = new $glMesh();

        reader.onloadend = this.readBdf;

        this.filesCount = inpFiles.length;
        this.filesReaded = 0;
        this.clearGlobals();

        for (const inpFile of inpFiles) {
            reader.readAsBinaryString(inpFile);
        }
    }
    readBdf(e) {
        let fr = e.target,
            self = importBdf,
            i = 0,
            sColor, tmpNode, tmpElm, con, card, nextline;

        if (fr.readyState == FileReader.DONE) {
            let fileData = fr.result.split(/\r\n|\n/);

            nextline = self.readBdfLine(fileData, i++);
            while (i < fileData.length) {
                card = nextline;

                while (true) {
                    nextline = self.readBdfLine(fileData, i++);
                    if (nextline.length == 0) break;
                    if (!nextline.hasOwnProperty('dontSkip')) break;
                    card.push(...nextline);
                }

                if (card.length == 0) continue;

                if (!card[0].includes('$')) {
                    switch (card[0]) {
                        case 'GRID':
                            tmpNode = fmNodesDict[card[1]];
                            if (!tmpNode) {
                                tmpNode = new fmNode(card[1], glNodes.count++, card[2]);
                            } else {
                                tmpNode.glID = glNodes.count++;
                                tmpNode.acid = card[2];
                            }

                            sColor = hover.createColor(tmpNode.id * 10 + 1);

                            glNodes.coords.push(card[3], card[4], card[5]);
                            glNodes.selColors.push(...sColor);
                            break;
                        case 'CROD':
                        case 'CBEAM':
                        case 'CBAR':
                            glBars.count++;
                            con = [self.checkNode(card[3]), self.checkNode(card[4])];
                            tmpElm = new fmElm(card[1], card[0], con, card[2], false);
                            break;
                        case 'CTRIA3':
                            glTrias.count++;
                            con = [self.checkNode(card[3]), self.checkNode(card[4]), self.checkNode(card[5])];
                            tmpElm = new fmElm(card[1], card[0], con, card[2], false);
                            break;
                        case 'CQUAD4':
                        case 'CSHEAR':
                            glQuads.count++;
                            con = [self.checkNode(card[3]), self.checkNode(card[4]), self.checkNode(card[5]), self.checkNode(card[6])];
                            tmpElm = new fmElm(card[1], card[0], con, card[2], false);
                            break;
                    }
                }
            }
        }

        self.filesReaded++;
        if (self.filesReaded == self.filesCount) {
            self.finishImport();
        }
    }
    checkNode(id) {
        let node = fmNodesDict[id];
        if (node) {
            return node;
        } else {
            return new fmNode(id, null, null);
        }
    }
    clearGlobals() {
        glNodes.count = 0;
        glNodes.coords = [];
        glNodes.colors = [];
        glNodes.selColors = [];
        glNodes.stage = [];

        glBars.count = 0;
        glTrias.count = 0;
        glQuads.count = 0;
    }
    finishImport() {
        glNodes.coords = new Float32Array(glNodes.coords);
        glNodes.selColors = new Float32Array(glNodes.selColors);
        glNodes.colors = new Float32Array(glNodes.count * 4);
        glNodes.stage = new Float32Array(glNodes.count);
        glNodes.stage.fill(0.9);
        glNodes.colors.appendNTimes([0.9, 0, 0, 1], glNodes.count, 0);

        glBars.ctrStage = new Float32Array(glBars.count);
        glBars.centroids = new Float32Array(glBars.count * 3);
        glBars.selCtrColors = new Float32Array(glBars.count * 4);
        glBars.coords = new Float32Array(glBars.count * 6);
        glBars.barycentric = new Float32Array(glBars.count * 6);
        glBars.selColors = new Float32Array(glBars.count * 8);
        glBars.stage = new Float32Array(glBars.count * 2);
        glBars.colors = new Float32Array(glBars.count * 8);
        glBars.ctrStage.fill(1);
        glBars.stage.fill(1);
        glBars.colors.appendNTimes([1, 1, 0, 1], glBars.count * 2, 0);

        glTrias.stage = new Float32Array(glTrias.count * 3);
        glTrias.colors = new Float32Array(glTrias.count * 12);
        glTrias.coords = new Float32Array(glTrias.count * 9);
        glTrias.barycentric = new Float32Array(glTrias.count * 9);
        glTrias.normals = new Float32Array(glTrias.count * 9);
        glTrias.selColors = new Float32Array(glTrias.count * 12);
        glTrias.stage.fill(1);
        glTrias.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], glTrias.count * 3, 0);

        glQuads.stage = new Float32Array(glQuads.count * 6);
        glQuads.selColors = new Float32Array(glQuads.count * 24);
        glQuads.coords = new Float32Array(glQuads.count * 18);
        glQuads.barycentric = new Float32Array(glQuads.count * 18);
        glQuads.normals = new Float32Array(glQuads.count * 18);
        glQuads.colors = new Float32Array(glQuads.count * 24);
        glQuads.stage.fill(1);
        glQuads.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], glQuads.count * 6, 0);

        glBars.count = 0;
        glTrias.count = 0;
        glQuads.count = 0;
        for (const [key, elm] of Object.entries(fmElemsDict)) {
            elm.load2GL();
        }

        model.init();
        loaderFade();
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

        //if (line.toUpperCase().includes('INCLUDE'))
        //    return !line.split();

        const s = line.includes('*') ? 16 : 8;

        //first word always 8
        const firstWord = line.substr(0, 8).replace('*', '').trim().toUpperCase();
        if (firstWord)
            line_list.push(firstWord);
        else
            line_list.dontSkip = true;

        for (let i = 8; i < line.length; i += s) {
            line_list.push(this.parseBdfStr(line.substr(i, s)));
        }

        return line_list;
    }
}

let importBdf = null;