import {ResourceType} from './catan-map.js';
import {FacilityType} from './facility.js';

function CreateMap(){}
function Roll(){}
function CreateMap(){}
function CreateMap(){}
function CreateMap(){}
function CreateMap(){}
function CreateMap(){}
function CreateMap(){}
function CreateMap(){}

function IsResourceEnoughToUpdateFacility(player, facility) {
    let _hc = player.handsCard;
    const _currentLevel = facility.level;

}

function UpdateFacility(player, facility) {
    let _hc = player.handsCard;
    const _fType = facility.type();
    switch(_fType){
        case FacilityType.ROAD:
            break;
        case FacilityType.TOWN:
            facility.Upgrad();
            break;
    }
}


/**
 * options.playersCount=3,
 * options.banditCount=1,
 * options.mapSize=[6,6],
 * options.
 */
class Game {
    constructor(options) {}
}
