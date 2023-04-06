export const FacilityType = Object.freeze({
    ROAD: 1,
    TOWN: 2,
});

class Facility {
    constructor() {
        this._ID = "<get unique string or number>";
        this._level = 1;
    }
    get ID() {return this._ID;}
    get level() {return this._level;}
    Upgrade() {};
}

export class Town extends Facility{
    constructor(){
        super();
    }
    Upgrade() {
        ++this._level;
    };
}

export class Road extends Facility{
    constructor(){
        super();
    }
}

export class FacilityManager{
    constructor() {
        this._arrRoad = [];
        this._arrTown = [];
    }
}
