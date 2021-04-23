const cloneDeep = require('lodash/cloneDeep');

module.exports = class MapModel {
	constructor(initMap) {
		this.list = initMap || new Map();
	}

	remove(key) {
		this.list.delete(key);
	}

	insert(key, value) {
		this.list.set(key, value);
	}

	search(key) {
		return this.list.get(key);
	}

	clone() {
		return new MapModel(cloneDeep(this.list));
	}

	count() {
		return this.list.size;
	}

	traverse(callback) {
		return this.list.forEach((value, key) => {
			callback(key, value);
		});
	}

	keys() {
		const listKeys = [];
		this.list.forEach((value, key) => {
			listKeys.push(parseInt(key, 10));
		});

		return listKeys.sort();
	}
};
