const PieceService = require('./piece-service.js');
const EvaluationModel = require('../models/evaluation-model.js');
const configs = require('../configurations');
const round = require('lodash/round');
const size = require('lodash/size');

class EvaluationService {
	constructor() {
		this.evaluationModel = new EvaluationModel();
		this.evaluatedScores = {};
		this.pieceService = PieceService;
	}

	_pawnsScore(board, side) {
		let score = 0;
		const pawnList = board.getPawnList(side);
		const playSide = side === configs.colors.white ? 1 : -1;
		let row;
		let column;

		pawnList.traverse((key, value) => {
			row = value.row;
			column = value.column;

			//isolated or backward pawns
			if (
				!pawnList.search(row - playSide + '' + (column - playSide)) &&
				!pawnList.search(row - playSide + '' + (column + playSide)) &&
				((row > 2 && side === configs.colors.white) || (row < 7 && side === configs.colors.black))
			) {
				//                        if (!board.isPieceSecure(row, column)) {
				score -= this.evaluationModel.isolatedPawnPenalty();
				//                        }
			}

			//doubled pawns
			if (pawnList.search(row - playSide + '' + column)) {
				score -= this.evaluationModel.doubledPawnPenalty();
			}
		});

		return score;
	}

	_castlingScore(board, side) {
		let score = 0;
		let pawnStage;
		let castlingPenalty;
		let castlingStage;
		let castleFlags = board.getCastleFlags();

		if (!castleFlags[side].kingSide || !castleFlags[side].queenSide) {
			pawnStage = this.pieceService.pawnStage(board);
			castlingPenalty = this.evaluationModel.castlingPenalty();
			castlingStage = round(
				(pawnStage * (this.evaluationModel.castlingEndGamePenalty() - castlingPenalty) + castlingPenalty) / castlingPenalty,
				2
			);

			if (!castleFlags[side].kingSide) {
				score -= castlingStage * castlingPenalty;
			}

			if (!castleFlags[side].queenSide) {
				score -= castlingStage * castlingPenalty;
			}
		}

		return round(score);
	}

	_calculateMaterialScore(board) {
		const colorsScore = [];
		let pieceKeys;
		let indexR;
		let piece;
		let piecesLength;

		colorsScore[configs.colors.white] = 0;
		colorsScore[configs.colors.black] = 0;
		pieceKeys = Object.keys(configs.pieces);
		for (indexR = 2, piecesLength = pieceKeys.length; indexR < piecesLength; indexR += 1) {
			piece = configs.pieces[pieceKeys[indexR]];
			colorsScore[board.getPieceColour(piece)] += round(
				board.getPiecesCounter(piece) * this.pieceService.getStartingPieceValue(piece) * this.pieceService.pieceStage(piece, board)
			);
		}

		return colorsScore;
	}

	_evaluateBoard(boardModel, currentMove) {
		let piece;
		let row;
		let column;
		let colorsScore;
		let score = 0;
		let pieceColour;
		let signal;
		const traverseCallback = (key, value) => {
			row = value.row;
			column = value.column;
			piece = boardModel.getPiece(row, column);

			pieceColour = boardModel.getPieceColour(piece);
			signal = pieceColour === configs.colors.white ? 1 : -1;

			score += this.evaluatePiece(boardModel, piece, row, column, colorsScore) * signal;
		};

		colorsScore = this._calculateMaterialScore(boardModel);

		score += colorsScore[configs.colors.white] - colorsScore[configs.colors.black];

		boardModel.getPieceList(configs.colors.white).traverse(traverseCallback);
		boardModel.getPieceList(configs.colors.black).traverse(traverseCallback);

		if (boardModel.getPiecesCounter(configs.pieces.wB) >= 2) {
			score += this.evaluationModel.bishopPairBonus();
		}

		if (boardModel.getPiecesCounter(configs.pieces.bB) >= 2) {
			score -= this.evaluationModel.bishopPairBonus();
		}

		score += this._pawnsScore(boardModel, configs.colors.white) - this._pawnsScore(boardModel, configs.colors.black);

		score += this._castlingScore(boardModel, configs.colors.white) - this._castlingScore(boardModel, configs.colors.black);

		if (
			currentMove &&
			(currentMove.flag === configs.flags.blackKingCastle ||
				currentMove.flag === configs.flags.blackQueenCastle ||
				currentMove.flag === configs.flags.whiteKingCastle ||
				currentMove.flag === configs.flags.whiteQueenCastle)
		) {
			piece = boardModel.getPiece(currentMove.rowDest, currentMove.columnDest);
			pieceColour = boardModel.getPieceColour(piece);
			signal = pieceColour === configs.colors.white ? 1 : -1;

			score += this.evaluationModel.castlingBonus() * signal;
		}

		return score;
	}

	isMaterialDraw(board) {
		//check if there is any Rook or Queen
		if (
			board.getPiecesCounter(configs.pieces.bQ) > 0 ||
			board.getPiecesCounter(configs.pieces.wQ) > 0 ||
			board.getPiecesCounter(configs.pieces.bR) > 0 ||
			board.getPiecesCounter(configs.pieces.wR) > 0
		) {
			return false;
		}

		//check if there is any Pawn
		if (board.getPiecesCounter(configs.pieces.wP) === 0 && board.getPiecesCounter(configs.pieces.bP) === 0) {
			//check if there is any Knight
			if (board.getPiecesCounter(configs.pieces.bN) === 0 && board.getPiecesCounter(configs.pieces.wN) === 0) {
				//check if there is any Bishop (King against King Draw)
				if (board.getPiecesCounter(configs.pieces.bB) === 0 && board.getPiecesCounter(configs.pieces.wB) === 0) {
					return true;
				}

				//check if there is only one Bishop (King + Bishop against King Draw)
				if (
					(board.getPiecesCounter(configs.pieces.bB) === 1 && board.getPiecesCounter(configs.pieces.wB) === 0) ||
					(board.getPiecesCounter(configs.pieces.wB) === 1 && board.getPiecesCounter(configs.pieces.bB) === 0)
				) {
					return true;
				}

				//TODO (King + Bishop against King + same color Bishop Draw)
			} else if (board.getPiecesCounter(configs.pieces.bB) === 0 && board.getPiecesCounter(configs.pieces.wB) === 0) {
				//check if there is only one Knight (King + Knight against King Draw)
				if (
					(board.getPiecesCounter(configs.pieces.bN) === 1 && board.getPiecesCounter(configs.pieces.wN) === 0) ||
					(board.getPiecesCounter(configs.pieces.bN) === 0 && board.getPiecesCounter(configs.pieces.wN) === 1)
				) {
					return true;
				}
			}
		}

		return false;
	}

	evaluatePiece(board, pieceOrig, rowDest, columnDest, colorsScore) {
		let score;
		let pieceColour;

		if (!colorsScore && (pieceOrig === configs.pieces.wK || pieceOrig === configs.pieces.bK)) {
			colorsScore = this._calculateMaterialScore(board);
		}

		pieceColour = board.getPieceColour(pieceOrig);
		if (pieceColour === configs.colors.black) {
			rowDest = 8 - rowDest;
			columnDest -= 1;
		} else {
			rowDest -= 1;
			columnDest -= 1;
		}

		switch (pieceOrig) {
			case configs.pieces.wP:
			case configs.pieces.bP:
				score = this.evaluationModel.pawnScore(rowDest, columnDest);
				break;

			case configs.pieces.wN:
			case configs.pieces.bN:
				score = this.evaluationModel.knightScore(rowDest, columnDest);
				break;

			case configs.pieces.wB:
			case configs.pieces.bB:
				score = this.evaluationModel.bishopScore(rowDest, columnDest);
				break;

			case configs.pieces.wR:
			case configs.pieces.bR:
				score = this.evaluationModel.rookScore(rowDest, columnDest);
				break;

			case configs.pieces.wQ:
			case configs.pieces.bQ:
				score = this.evaluationModel.queenScore(rowDest, columnDest);
				break;

			case configs.pieces.wK:
			case configs.pieces.bK:
				if (colorsScore[pieceColour] <= this.evaluationModel.endGameValue()) {
					score = this.evaluationModel.kingEndGameScore(rowDest, columnDest);
				} else {
					score = this.evaluationModel.kingScore(rowDest, columnDest);
				}
				break;
		}
		return score;
	}

	evaluateBoard(board, currentMove) {
		let score;
		const playSide = board.getSide() === configs.colors.white ? 1 : -1;

		score = this._evaluateBoard(board, currentMove);

		//fix the negative zero issue
		return score * playSide + 1 - 1;
	}

	getEvaluatedScoresCount() {
		return size(this.evaluatedScores);
	}
}

module.exports = new EvaluationService();
