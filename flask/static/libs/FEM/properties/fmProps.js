var fmPropDict = {};

class fmProps{
    constructor(pid, mid){
        this.pid = pid;
        this.mid = this.checkMaterial(mid);

        fmPropDict[pid] = this;
    }
    checkMaterial(mid) {
        let mat = fmMatDict[mid];
        if (mat) {
            return mat;
        } else {
            return new fmMats(id);
        }
    }
}