export const MapFeatureType = Object.freeze({
    ROUTE: 1,
    STRONGHOLD: 2,
    TERRAIN: 3,
});

export const ResourceType = Object.freeze({
    SAND: 0,
    WHEAT: 1,
    STONE: 2,
    BRICK: 3,
    WOOL: 4,
    WOOD: 5,
    GULF: 6,
});

class MapFeature {
    constructor() {
        this._ID = "<get unique string or number>";
        this._occupiedInfo = undefined;
    }
    get ID() {return this._ID;}
    get OccupiedInfo() {return this._occupiedInfo;}
}

class Stronghold extends MapFeature {
    constructor() {
        super();
    }
    get type() {return MapFeature.STRONGHOLD;}
}

class Route extends MapFeature {
    constructor() {
        super();
    }
    get type() {return MapFeature.ROUTE;}
}

class Terrain extends MapFeature {
    constructor(resourceType) {
        super();
        this._resourceType = resourceType;
    }
    get type() {return MapFeature.TERRAIN;}
    get resourceType() {return this._resourceType;}
}

class StaticMapData {
    constructor() {}
}

class DynamicMapData {
    constructor() {}
}

class CatanMap {
    constructor() {
        this._dynamicData = new DynamicMapData();
        this._staticData = new StaticMapData();
    }
}

