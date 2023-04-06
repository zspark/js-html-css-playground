import {Road, Town, FacilityManager} from "./facility.js"
import Statistics from "./statistics.js"
import {Hands} from "./card.js"
import {MapFeatureType} from "./statistics.js"

class Participator{
    constructor() {
        this._ID = "<get unique string or number>";
    }
    get ID() {return this._ID;}
    MapFeatureCanBeOccupied(type) {
        return false;
    }
}

class Player extends Participator{
    constructor(){
        super();

        this._handsCard = new Hands();
        this._statistics = new Statistics();
        this._facility = new FacilityManager();
    };

    get handsCard() {return this._handsCard;}

    MapFeatureCanBeOccupied(type) {
        return type !== MapFeatureType.TERRAIN;
    }
}

class Bandit extends Participator{
    constructor(){
        super();
    };
    MapFeatureCanBeOccupied(type) {
        return type === MapFeatureType.TERRAIN;
    }
}

class God extends Participator{
    constructor(){};
}
