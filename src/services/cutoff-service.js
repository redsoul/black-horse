const times = require('lodash/times');

class CutoffService {
	constructor() {
		this.betaMoves = [];
		this.alphaMoves = [];
		this.alphaMovesScore = 900000;
		this.betaMovesScore = 1000000;
	}

	_promoteCutOffMoves(moves, cutOffMoves, score) {
		for (let cutOffMove of cutOffMoves) {
			for (let move of moves) {
				if (
					move.rowOrig === cutOffMove.rowOrig &&
					move.columnOrig === cutOffMove.columnOrig &&
					move.rowDest === cutOffMove.rowDest &&
					move.columnDest === cutOffMove.columnDest
				) {
					move.score = score;
					break;
				}
			}
		}
	}

	_getBetaMoves(depth) {
		return this.betaMoves[depth] || [];
	}

	_getAlphaMoves(depth) {
		return this.alphaMoves[depth] || [];
	}

	reset(maxDepth) {
		times(maxDepth, index => {
			this.betaMoves[index] = [];
			this.alphaMoves[index] = [];
		});
	}

	storeBetaMove(move, depth) {
		this.betaMoves[depth].push(move);
	}

	storeAlphaMove(move, depth) {
		this.alphaMoves[depth].push(move);
	}

	promoteBetaMoves(moves, depth) {
		this._promoteCutOffMoves(moves, this._getBetaMoves(depth), this.betaMovesScore);
	}

	promoteAlphaMoves(moves, depth) {
		this._promoteCutOffMoves(moves, this._getAlphaMoves(depth), this.alphaMovesScore);
	}

	getAlphaMovesScore() {
		return this.alphaMovesScore;
	}

	getBetaMovesScore() {
		return this.betaMovesScore;
	}
}

module.exports = new CutoffService();
