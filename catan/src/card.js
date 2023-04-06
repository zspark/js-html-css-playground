import {ResourceType} from './catan-map.js';

const CardSuit = Object.freeze({
    HEART: 1,
    SPADE: 2,
    DIAMOND: 3,
    CLUB: 4,
});

const CardType = Object.freeze({
    RESOURCE: 1,
    DEVELOPMENT: 2,
});

class Card {
    constructor() {
        this._ID = "<get unique string or number>";
    }
    get ID() {return this._ID;}
}

class ResourceCard extends Card {
    constructor() {
        super();
        this._resourceType = -1;
    }
    get type() {return CardType.RESOURCE;}
    get resourceType() {return this._resourceType;}
}

class DevelopmentCard extends Card {
    constructor() {
        super();
    }
    get type() {return CardType.DEVELOPMENT;}
}

export class Hands {
    constructor() {
        this._cards = [];
    }

    get cardsCount() {return this._cards.length;}
    get resourceCardsCount() {return this._cards.length;}
    get developmentCardsCount() {return this._cards.length;}
    GetCardAt(idx) {
        if(idx < 0 || idx >= this.cardsCount) return null;
        return this._cards[idx];
    }

    RemoveCardAt(idx){
        if(idx < 0 || idx >= this.cardsCount) return null;
        return this._cards.splice(idx, 1);
    }

    SortByType(){
        // card type first ,then resource type;
    }

    AppendCard(card){
        this._cards.push(card);
    }

    GetResourceCount(type) {
        let _ret = 0;
        this._cards.forEach((_c) => {
            if(_c.type == CardType.RESOURCE) {
                if(_c.resourceType == type) {
                    ++_ret;
                }
            }
        });
        return _ret;
    }
}
