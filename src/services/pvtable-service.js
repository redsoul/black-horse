const find = require('lodash/find');
const pick = require('lodash/pick');

//Principal variation Service, https://chessprogramming.wikispaces.com/Principal+variation
class PvTableService {
	constructor() {
		this.pvEntries = 10000;
		this.pvTable = new Array(this.pvEntries);
		this.promotedScore = 2000000;

		this.reset();
	}

	reset() {
		for (let i = 0; i < this.pvTable.length; i++) {
			this.pvTable[i] = { move: null, hash: null };
		}
	}

	probeTable(hash) {
		let index;

		if (!hash) {
			return false;
		}

		index = hash % this.pvEntries;

		if (this.pvTable[index] && this.pvTable[index].hash === hash) {
			return this.pvTable[index].move;
		}

		return false;
	}

	storeMove(move) {
		let hash = move.hash;
		let index = hash % this.pvEntries;

		this.pvTable[index].hash = hash;
		this.pvTable[index].move = move;
	}

	promoteLastBestMove(moves, hash) {
		const pvMove = this.probeTable(hash);

		if (!pvMove) {
			return false;
		}

		const res = find(moves, pick(pvMove, ['rowOrig', 'columnOrig', 'rowDest', 'columnDest']));
		if (res) {
			res.score = this.promotedScore;
			return true;
		}

		return false;
	}

	getPromotedScore() {
		return this.promotedScore;
	}
}

module.exports = new PvTableService();
