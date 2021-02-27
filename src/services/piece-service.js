const round = require('lodash/round');
const configs = require('../configurations');

const pawnValue = [100, 400];
const knightValue = [375, 275];
const bishopValue = [325, 325];
const rookValue = [450, 600];
const queenValue = [1000, 1000];
const kingValue = [50000, 50000];
const startingPieceVal = [
	0,
	pawnValue[0],
	bishopValue[0],
	knightValue[0],
	rookValue[0],
	queenValue[0],
	kingValue[0],
	pawnValue[0],
	bishopValue[0],
	knightValue[0],
	rookValue[0],
	queenValue[0],
	kingValue[0],
];

//                  empty,  wP,  wB,  wN,  wR,  wQ,    wK,  bP,  bN,  bB,  bR,  bQ,    bK

class PieceService {
	getStartingPieceValue(piece) {
		return startingPieceVal[piece];
	}

	getPieceValue(piece, board) {
		return Math.round(startingPieceVal[piece] * this.pieceStage(piece, board));
	}

	getStartingPawnMaterial() {
		return pawnValue[0] * 16;
	}

	getStartingMaterial() {
		return (
			this.getStartingPawnMaterial() +
			startingPieceVal[2] * 4 +
			startingPieceVal[3] * 4 +
			startingPieceVal[4] * 4 +
			startingPieceVal[5] * 2 +
			startingPieceVal[6] * 2
		);
	}

	/*Pawn stage according to material present; 0 -> 1 as game progresses.*/
	pawnStage(board) {
		return 1.0 - (board.getPawnMaterial(configs.colors.black) + board.getPawnMaterial(configs.colors.white)) / this.getStartingPawnMaterial();
	}

	/*Game stage according to material present; 0 -> 1 as game progresses.*/
	gameStage(board) {
		const totalKingValue = kingValue[0] * 2;
		return (
			1.0 -
			(board.getPieceMaterial(configs.colors.black) + board.getPieceMaterial(configs.colors.white) - totalKingValue) /
				(this.getStartingMaterial() - totalKingValue)
		);
	}

	pieceStage(piece, board) {
		switch (piece) {
			case configs.pieces.wP:
			case configs.pieces.bP:
				return round((this.pawnStage(board) * (pawnValue[1] - pawnValue[0]) + pawnValue[0]) / pawnValue[0], 2);

			case configs.pieces.wN:
			case configs.pieces.bN:
				return round((this.pawnStage(board) * (knightValue[1] - knightValue[0]) + knightValue[0]) / knightValue[0], 2);

			case configs.pieces.wR:
			case configs.pieces.bR:
				return round((this.pawnStage(board) * (rookValue[1] - rookValue[0]) + rookValue[0]) / rookValue[0], 2);

			default:
				return 1;
		}
	}
}

module.exports = new PieceService();
