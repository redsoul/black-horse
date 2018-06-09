const cloneDeep = require('lodash/cloneDeep');
const each = require('lodash/each');
const size = require('lodash/size');

module.exports = class ListModel {

    constructor(initObj){
        this.list = initObj || {};
    }

    remove(key) {
        delete this.list[key];
    }

    insert(key, value) {
        this.list[key] = value;
    }

    search(key) {
        return this.list[key];
    }

    clone() {
        return new ListModel(cloneDeep(this.list));
    }

    count() {
        return size(this.list);
    }

    traverse(callback) {
        return each(this.list, (value, key) => {
            callback(key, value);
        });
    }

    keys() {
        const listKeys = [];
        each(this.list, (value, key) => {
            listKeys.push(parseInt(key, 10));
        });

        return listKeys.sort();
    }
};