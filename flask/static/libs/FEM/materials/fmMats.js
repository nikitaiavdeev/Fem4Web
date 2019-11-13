var fmMatDict = {};

class fmMats{
    constructor(mid){
        fmMatDict[mid] = this;
    }
}

class fmMat1 extends fmMats {
	constructor(card) {
        super(card[1]);
        
		this.e = card[2]; //Elestic modul
		this.nu = card[3]; //Poisson ratio
	}
}