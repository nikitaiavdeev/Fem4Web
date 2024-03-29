const fmAllowableElms = {
    'CROD': fmCROD,
    'CBEAM': fmCBEAM,
    'CBAR': fmCBAR,

    'CTRIA3': fmCTRIA3,
    'CQUAD4': fmCQUAD4
};

class $importBdf {
    constructor(inpFiles) {
        let reader = new FileReader();
        loaderShow();

        // Clear Model
        model = new $glMesh();

        reader.onloadend = this.readBdf;

        this.filesCount = inpFiles.length;
        this.filesReaded = 0;

        for (const inpFile of inpFiles) {
            reader.readAsBinaryString(inpFile);
        }
    }
    readBdf(e) {
        let fr = e.target,
            self = importBdf,
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
                    if (!nextline.hasOwnProperty('dontSkip')) break;
                    card.push(...nextline);
                }

                if (card.length == 0) continue;

                if (!card[0].includes('$')) {
                    if (card[0] in fmAllowableElms) {
                        new fmAllowableElms[card[0]](card);
                    } else if (card[0] == 'GRID') {
                        new fmNodes(card);
                    }
                }
            }
        }

        self.filesReaded++;
        if (self.filesReaded == self.filesCount) {
            self.finishImport();
        }
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
        glQuads.selColors = new Float32Array(glQuads.count* 24);
        glQuads.coords = new Float32Array(glQuads.count * 18);
        glQuads.barycentric = new Float32Array(glQuads.count * 18);
        glQuads.normals = new Float32Array(glQuads.count * 18);
        glQuads.colors = new Float32Array(glQuads.count * 24);
        glQuads.stage.fill(1);
        glQuads.colors.appendNTimes([0.17, 0.45, 0.7, 1.0], glQuads.count * 6, 0);

        for (const [key, elm] of Object.entries(fmElemsDict)) {
            elm.load2GL();
        }

        model.init();
        loaderFade();
    }
    parseBdfStr(str) {
        // Parse exponential numbers
        if (str.search(/[\d\.][+\-]/) > -1) {
            str = str[0] + str.substr(1).replace('+', 'e+');
            str = str[0] + str.substr(1).replace('-', 'e-');
        }
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