const MvvLvaService = require('./mvv-lva-service');
const cloneDeep = require('lodash/cloneDeep');
const isUndefined = require('lodash/isUndefined');
const orderBy = require('lodash/orderBy');
const each = require('lodash/each');
const configs = require('../configurations');

class MoveService {
	constructor() {
		this.history = [];
		this.boardModel = null;
		this.generatedMoves = {};
		this.generatedMovesUses = 0;

		this.MvvLvaService = MvvLvaService;
		this.MvvLvaService.init();

		this.knightAvailableMoves = [
			[-2, 1],
			[-2, -1],
			[2, 1],
			[2, -1],
			[-1, 2],
			[1, 2],
			[-1, -2],
			[1, -2],
		];
		this.kingAvailableMoves = [
			[1, 0],
			[0, 1],
			[1, -1],
			[-1, 0],
			[0, -1],
			[1, 1],
			[-1, -1],
			[-1, 1],
		];
		this.bishopDirections = [
			[1, 1],
			[-1, 1],
			[1, -1],
			[-1, -1],
		];
		this.rookDirections = [
			[1, 0],
			[-1, 0],
			[0, -1],
			[0, 1],
		];

		this.whitePromotionPieces = [configs.pieces.wQ, configs.pieces.wN, configs.pieces.wB, configs.pieces.wR];
		this.blackPromotionPieces = [configs.pieces.bQ, configs.pieces.bN, configs.pieces.bB, configs.pieces.bR];
	}

	_checkPawnPromotion(row, move, colour) {
		let moveCopy;
		const moves = [];

		if (colour === configs.colors.white && row === 7) {
			move[2] = configs.flags.promotion;
			each(this.whitePromotionPieces, whitePromotionPiece => {
				moveCopy = cloneDeep(move);
				moveCopy[3] = whitePromotionPiece;
				moves.push(moveCopy);
			});
		} else if (colour === configs.colors.black && row === 2) {
			move[2] = configs.flags.promotion;
			each(this.blackPromotionPieces, blackPromotionPiece => {
				moveCopy = cloneDeep(move);
				moveCopy[3] = blackPromotionPiece;
				moves.push(moveCopy);
			});
		} else {
			moves.push(move);
		}

		return moves;
	}

	_pawnMoves(row, column) {
		let moves = [];
		const piece = this.boardModel.getPieceByRowColumn(row, column);
		const color = this.boardModel.getPieceColour(piece);
		const side = color === configs.colors.white ? 1 : -1;
		let enPassantPosition;

		//attack right
		if (
			this.boardModel.getPieceByRowColumn(row + side, column + 1) !== configs.pieces.empty &&
			this.boardModel.getPieceByRowColumn(row + side, column + 1) !== configs.pieces.offBoard &&
			color !== this.boardModel.getPieceColour(row + side, column + 1)
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + side, column + 1], color));
		}

		//attack left
		if (
			this.boardModel.getPieceByRowColumn(row + side, column - 1) !== configs.pieces.empty &&
			this.boardModel.getPieceByRowColumn(row + side, column - 1) !== configs.pieces.offBoard &&
			color !== this.boardModel.getPieceColour(row + side, column - 1)
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + side, column - 1], color));
		}

		//move 1 square
		if (
			this.boardModel.getPieceByRowColumn(row + side, column) === configs.pieces.empty &&
			this.boardModel.getPieceByRowColumn(row + side, column) !== configs.pieces.offBoard
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + side, column], color));
		}

		//move 2 squares
		if (
			this.boardModel.getPieceByRowColumn(row + side, column) === configs.pieces.empty &&
			this.boardModel.getPieceByRowColumn(row + 2 * side, column) === configs.pieces.empty &&
			this.boardModel.getPieceByRowColumn(row + side, column) !== configs.pieces.offBoard &&
			this.boardModel.getPieceByRowColumn(row + 2 * side, column) !== configs.pieces.offBoard &&
			this.boardModel.getPieceByRowColumn(row - 2 * side, column) === configs.pieces.offBoard
		) {
			moves.push([row + 2 * side, column]);
		}

		//en passant move
		enPassantPosition = this.boardModel.getEnPassantPosition();
		if (enPassantPosition) {
			if (row + side === enPassantPosition[0] && column - 1 === enPassantPosition[1]) {
				moves.push([row + side, column - 1, configs.flags.enPassant]);
			} else if (row + side === enPassantPosition[0] && column + 1 === enPassantPosition[1]) {
				moves.push([row + side, column + 1, configs.flags.enPassant]);
			}
		}

		return moves;
	}

	_knightMoves(row, column) {
		const moves = [];
		let piece;
		const colour = this.boardModel.getPieceColour(row, column);

		for (let knightAvailableMove of this.knightAvailableMoves) {
			piece = this.boardModel.getPieceByRowColumn(row + knightAvailableMove[0], column + knightAvailableMove[1]);
			if (
				piece !== configs.pieces.offBoard &&
				(colour !== this.boardModel.getPieceColour(row + knightAvailableMove[0], column + knightAvailableMove[1]) ||
					piece === configs.pieces.empty)
			) {
				moves.push([row + knightAvailableMove[0], column + knightAvailableMove[1]]);
			}
		}

		return moves;
	}

	_bishopMoves(row, column) {
		const moves = [];
		const colour = this.boardModel.getPieceColour(row, column);
		let piece;
		let indexR;
		let indexC;

		for (let bishopDirection of this.bishopDirections) {
			for (
				indexR = row + bishopDirection[0], indexC = column + bishopDirection[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += bishopDirection[0], indexC += bishopDirection[1]
			) {
				piece = this.boardModel.getPieceByRowColumn(indexR, indexC);
				if (
					piece !== configs.pieces.offBoard &&
					(colour !== this.boardModel.getPieceColour(indexR, indexC) || piece === configs.pieces.empty)
				) {
					moves.push([indexR, indexC]);
				}
				if (piece === configs.pieces.offBoard || piece !== configs.pieces.empty) {
					break;
				}
			}
		}

		return moves;
	}

	_rookMoves(row, column) {
		const moves = [];
		const colour = this.boardModel.getPieceColour(row, column);
		let piece;
		let indexR;
		let indexC;

		for (let rookDirection of this.rookDirections) {
			for (
				indexR = row + rookDirection[0], indexC = column + rookDirection[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += rookDirection[0], indexC += rookDirection[1]
			) {
				piece = this.boardModel.getPieceByRowColumn(indexR, indexC);
				if (
					piece !== configs.pieces.offBoard &&
					(colour !== this.boardModel.getPieceColour(indexR, indexC) || piece === configs.pieces.empty)
				) {
					moves.push([indexR, indexC]);
				}
				if (piece === configs.pieces.offBoard || piece !== configs.pieces.empty) {
					break;
				}
			}
		}

		return moves;
	}

	_kingMoves(row, column) {
		const moves = [];
		let piece;
		let flag;
		const color = this.boardModel.getPieceColour(row, column);
		let castleFlags;

		for (let kingAvailableMove of this.kingAvailableMoves) {
			piece = this.boardModel.getPieceByRowColumn(row + kingAvailableMove[0], column + kingAvailableMove[1]);
			if (
				piece !== configs.pieces.offBoard &&
				(color !== this.boardModel.getPieceColour(row + kingAvailableMove[0], column + kingAvailableMove[1]) ||
					piece === configs.pieces.empty)
			) {
				moves.push([row + kingAvailableMove[0], column + kingAvailableMove[1]]);
			}
		}

		//castle moves
		castleFlags = this.boardModel.getCastleFlags()[color];
		if (castleFlags.kingSide) {
			if (
				!this._isSquareAttacked(row, column) &&
				this.boardModel.getPieceByRowColumn(row, column + 1) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column + 1, color) &&
				this.boardModel.getPieceByRowColumn(row, column + 2) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column + 2, color) &&
				((this.boardModel.getPieceByRowColumn(row, column + 3) === configs.pieces.wR && color === configs.colors.white) ||
					(this.boardModel.getPieceByRowColumn(row, column + 3) === configs.pieces.bR && color === configs.colors.black))
			) {
				flag = color === configs.colors.white ? configs.flags.whiteKingCastle : configs.flags.blackKingCastle;
				moves.push([row, column + 2, flag]);
			}
		}

		if (castleFlags.queenSide) {
			if (
				this.boardModel.getPieceByRowColumn(row, column - 1) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 1, color) &&
				this.boardModel.getPieceByRowColumn(row, column - 2) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 2, color) &&
				this.boardModel.getPieceByRowColumn(row, column - 3) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 3, color) &&
				((this.boardModel.getPieceByRowColumn(row, column - 4) === configs.pieces.wR && color === configs.colors.white) ||
					(this.boardModel.getPieceByRowColumn(row, column - 4) === configs.pieces.bR && color === configs.colors.black))
			) {
				flag = color === configs.colors.white ? configs.flags.whiteQueenCastle : configs.flags.blackQueenCastle;
				moves.push([row, column - 2, flag]);
			}
		}
		return moves;
	}

	_getPieceMoves(row, column) {
		const piece = this.boardModel.getPieceByRowColumn(row, column);
		let pieceMoves = [];
		const moves = [];
		let flag;
		let move;

		switch (piece) {
			case configs.pieces.wP:
			case configs.pieces.bP:
				pieceMoves = this._pawnMoves(row, column);
				break;
			case configs.pieces.wN:
			case configs.pieces.bN:
				pieceMoves = this._knightMoves(row, column);
				break;
			case configs.pieces.wB:
			case configs.pieces.bB:
				pieceMoves = this._bishopMoves(row, column);
				break;
			case configs.pieces.wR:
			case configs.pieces.bR:
				pieceMoves = this._rookMoves(row, column);
				break;
			case configs.pieces.wQ:
			case configs.pieces.bQ:
				pieceMoves = this._rookMoves(row, column).concat(this._bishopMoves(row, column));
				break;
			case configs.pieces.wK:
			case configs.pieces.bK:
				pieceMoves = this._kingMoves(row, column);
				break;
		}

		for (let pieceMove of pieceMoves) {
			flag = typeof pieceMove[2] !== 'undefined' ? pieceMove[2] : null;
			move = {
				piece: piece,
				pieceDest: this.boardModel.getPieceByRowColumn(pieceMove[0], pieceMove[1]),
				side: this.boardModel.getPieceColour(piece),
				rowOrig: row,
				columnOrig: column,
				rowDest: pieceMove[0],
				columnDest: pieceMove[1],
				flag: flag,
				promotedPiece: flag === configs.flags.promotion ? pieceMove[3] : null,
				//hash key (to be calculated later)
				hash: this.boardModel.getHash(),
			};
			move.score = this.MvvLvaService.getScore(this.boardModel, move);
			moves.push(move);
		}

		return moves;
	}

	_isSquareAttacked(row, column, squareSide) {
		let piece = this.boardModel.getPieceByRowColumn(row, column);
		let side;
		let colour;
		let indexR;
		let indexC;

		if (piece === configs.pieces.offBoard) {
			return false;
		}

		if (piece !== configs.pieces.empty) {
			side = 1;
			colour = configs.colors.white;
			if (this.boardModel.getPieceColour(row, column) === configs.colors.black) {
				side = -1;
				colour = configs.colors.black;
			}
		} else {
			if (!isUndefined(squareSide)) {
				side = squareSide === configs.colors.white ? 1 : -1;
				colour = squareSide;
			} else {
				return false;
			}
		}

		//pawn attack right
		piece = this.boardModel.getPieceByRowColumn(row + side, column + 1);
		if ((piece === configs.pieces.wP || piece === configs.pieces.bP) && colour !== this.boardModel.getPieceColour(row + side, column + 1)) {
			return true;
		}

		//pawn attack left
		piece = this.boardModel.getPieceByRowColumn(row + side, column - 1);
		if ((piece === configs.pieces.wP || piece === configs.pieces.bP) && colour !== this.boardModel.getPieceColour(row + side, column - 1)) {
			return true;
		}

		//knight attack moves
		for (let move of this.knightAvailableMoves) {
			piece = this.boardModel.getPieceByRowColumn(row + move[0], column + move[1]);
			if (
				(piece === configs.pieces.wN || piece === configs.pieces.bN) &&
				colour !== this.boardModel.getPieceColour(row + move[0], column + move[1])
			) {
				return true;
			}
		}

		//bishop and queen attack moves
		for (let move of this.bishopDirections) {
			for (
				indexR = row + move[0], indexC = column + move[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += move[0], indexC += move[1]
			) {
				piece = this.boardModel.getPieceByRowColumn(indexR, indexC);
				if (
					(piece === configs.pieces.wB || piece === configs.pieces.bB || piece === configs.pieces.wQ || piece === configs.pieces.bQ) &&
					colour !== this.boardModel.getPieceColour(indexR, indexC)
				) {
					return true;
				}
				if (piece === configs.pieces.offBoard || piece !== configs.pieces.empty) {
					break;
				}
			}
		}

		//rook and queen attack moves
		for (let move of this.rookDirections) {
			for (
				indexR = row + move[0], indexC = column + move[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += move[0], indexC += move[1]
			) {
				piece = this.boardModel.getPieceByRowColumn(indexR, indexC);
				if (
					(piece === configs.pieces.wR || piece === configs.pieces.bR || piece === configs.pieces.wQ || piece === configs.pieces.bQ) &&
					colour !== this.boardModel.getPieceColour(indexR, indexC)
				) {
					return true;
				}
				if (piece === configs.pieces.offBoard || piece !== configs.pieces.empty) {
					break;
				}
			}
		}

		//king attack moves
		for (let move of this.kingAvailableMoves) {
			piece = this.boardModel.getPieceByRowColumn(row + move[0], column + move[1]);
			if (
				(piece === configs.pieces.wK || piece === configs.pieces.bK) &&
				colour !== this.boardModel.getPieceColour(row + move[0], column + move[1])
			) {
				return true;
			}
		}

		return false;
	}

	_generateAllMoves(side) {
		const pieceList = this.boardModel.getPieceList(side);
		let pieceMoves;
		let moves = [];

		pieceList.traverse((key, value) => {
			pieceMoves = this._getPieceMoves(value.row, value.column);
			if (pieceMoves.length > 0) {
				moves = moves.concat(pieceMoves);
			}
		});

		return orderBy(moves, 'score', 'desc');
	}

	/********************
     PUBLIC METHODS
     ********************/

	init() {
		this.history = [];
		this.boardModel = null;
		this.generatedMoves = {};
		this.generatedMovesUses = 0;
		this.MvvLvaService.init();
	}

	reset() {
		this.generatedMoves = {};
		this.generatedMovesUses = 0;
	}

	getPieceMoves(board, row, column) {
		this.boardModel = board;
		return this._getPieceMoves(row, column);
	}

	isPieceAttacked(board, row, column) {
		this.boardModel = board;
		if (this.boardModel.isEmpty(row, column)) {
			return false;
		}

		return this._isSquareAttacked(row, column);
	}

	isSquareAttacked(board, row, column, side) {
		this.boardModel = board;
		return this._isSquareAttacked(row, column, side);
	}

	isPieceSecure(board, row, column) {
		const boardCopy = cloneDeep(board);
		const piece = board.getPieceByRowColumn(row, column);
		if (piece === configs.pieces.empty) {
			return false;
		}

		boardCopy.setPieceByRowColumn(row, column, this.getOppositePiece(piece));

		return this.isPieceAttacked(boardCopy, row, column);
	}

	getOppositePiece(piece) {
		const color = this.boardModel.getPieceColour(piece);
		if (color === configs.colors.white) {
			return piece + 6;
		}
		return piece - 6;
	}

	generateAllMoves(board, side) {
		this.boardModel = board;
		return this._generateAllMoves(side);
	}

	generateAllCaptureMoves(board, side) {
		const moves = this.generateAllMoves(board, side);
		const captureMoves = [];

		for (let move of moves) {
			if (this.boardModel.isEmpty(move.rowDest, move.columnDest)) {
				continue;
			}

			captureMoves.push(move);
		}

		return captureMoves;
	}

	addToHistory(board, move) {
		this.history.push({
			board: board.clone(),
			move: move,
		});
	}

	convertToString(move) {
		if (!move) {
			return 'Invalid Move';
		}
		return configs.columnChar[move.columnOrig - 1] + move.rowOrig + configs.columnChar[move.columnDest - 1] + move.rowDest;
	}

	pickNextMove(movesArr, currentIndex) {
		let bestScore = 0;
		let bestIndex = currentIndex;
		let arrLength;
		let index;
		let temp;

		for (index = currentIndex, arrLength = movesArr.length; index < arrLength; index += 1) {
			if (movesArr[index].score > bestScore) {
				bestScore = movesArr[index].score;
				bestIndex = index;
			}
		}

		//if (bestIndex !== currentIndex) {
		temp = movesArr[currentIndex];
		movesArr[currentIndex] = movesArr[bestIndex];
		movesArr[bestIndex] = temp;
		//}

		return movesArr[currentIndex];
	}

	setBoardModel(board) {
		this.boardModel = board;
	}

	rollback() {
		return this.history.pop();
	}

	getLastMove() {
		return this.history[this.history.length - 1];
	}

	getCompleteHistory() {
		return this.history;
	}
}

module.exports = new MoveService();
