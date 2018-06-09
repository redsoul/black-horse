const times = require('lodash/times');
const each = require('lodash/each');

class CutoffService {
    constructor() {
        this.betaMoves = [];
        this.alphaMoves = [];
        this.alphaMovesScore = 900000;
        this.betaMovesScore = 1000000;
    }

    _promoteCutOffMoves(moves, cutOffMoves, score) {
        each(cutOffMoves, function (cutOffMove) {
            each(moves, function (move) {
                if (move.rowOrig === cutOffMove.rowOrig &&
                    move.columnOrig === cutOffMove.columnOrig &&
                    move.rowDest === cutOffMove.rowDest &&
                    move.columnDest === cutOffMove.columnDest) {
                    move.score = score;
                    return false;
                }
            });
        });
    }

    _getBetaMoves(depth) {
        return this.betaMoves[depth] || [];
    }

    _getAlphaMoves(depth) {
        return this.alphaMoves[depth] || null;
    }

    reset(maxDepth) {
        times(maxDepth, (index) => {
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