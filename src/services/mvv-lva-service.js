const EvaluationService = require('./evaluation-service.js');
const configs = require('../configurations');

class MvvLvaService {
	constructor() {
		//ordering moves scores
		this.mvvLvaValue = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
		this.mvvLvaScore = new Array(14 * 14);
	}

	/*
     MVV - Most Value Victim
     LVA - Least Value Attacker

     Attacker vs Victim
     P        x      Q      --> 500+6-(100/100)=506
     B        x      Q      --> 500+6-(300/100)=503
     K        x      Q      --> 500+6-(400/100)=502
     ...
     P        x      R      --> 400+6-(100/100)=406
     B        x      R      --> 400+6-(300/100)=403
     K        x      R      --> 400+6-(400/100)=402
     ...
     */
	init() {
		let attacker;
		let victim;

		for (attacker = configs.pieces.wP; attacker <= configs.pieces.bK; attacker += 1) {
			for (victim = configs.pieces.wP; victim <= configs.pieces.bK; victim += 1) {
				this.mvvLvaScore[victim * 14 + attacker] = this.mvvLvaValue[victim] + 6 - this.mvvLvaValue[attacker] / 100;
			}
		}
	}

	getScore(boardModel, move) {
		const pieceOrig = boardModel.getPiece(move.rowOrig, move.columnOrig);
		const pieceDest = move.flag === configs.flags.enPassant ? 1 : boardModel.getPiece(move.rowDest, move.columnDest);

		if (pieceDest !== configs.pieces.empty) {
			return this.mvvLvaScore[pieceDest * 14 + pieceOrig] + 1000000;
		}

		return (
			EvaluationService.evaluatePiece(boardModel, pieceOrig, move.rowDest, move.columnDest) -
			EvaluationService.evaluatePiece(boardModel, pieceOrig, move.rowOrig, move.columnOrig)
		);
	}
}

module.exports = new MvvLvaService();
