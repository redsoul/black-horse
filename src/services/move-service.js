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

	_checkPawnPromotion(row, move, color) {
		let moveCopy;
		const moves = [];

		if (color === configs.colors.white && row === 7) {
			move[2] = configs.flags.promotion;
			each(this.whitePromotionPieces, whitePromotionPiece => {
				moveCopy = cloneDeep(move);
				moveCopy[3] = whitePromotionPiece;
				moves.push(moveCopy);
			});
		} else if (color === configs.colors.black && row === 2) {
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

	__pawnMoves(piece, color, row, column) {
		let moves = [];
		const dir = color === configs.colors.white ? 1 : -1;
		let enPassantPosition;

		//attack right
		if (
			this.boardModel.getPiece(row + dir, column + 1) !== configs.pieces.empty &&
			this.boardModel.getPiece(row + dir, column + 1) !== configs.pieces.offBoard &&
			color !== this.boardModel.getPieceColor(row + dir, column + 1)
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + dir, column + 1], color));
		}

		//attack left
		if (
			this.boardModel.getPiece(row + dir, column - 1) !== configs.pieces.empty &&
			this.boardModel.getPiece(row + dir, column - 1) !== configs.pieces.offBoard &&
			color !== this.boardModel.getPieceColor(row + dir, column - 1)
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + dir, column - 1], color));
		}

		//move 1 square
		if (
			this.boardModel.getPiece(row + dir, column) === configs.pieces.empty &&
			this.boardModel.getPiece(row + dir, column) !== configs.pieces.offBoard
		) {
			moves = moves.concat(this._checkPawnPromotion(row, [row + dir, column], color));
		}

		//move 2 squares
		if (
			this.boardModel.getPiece(row + dir, column) === configs.pieces.empty &&
			this.boardModel.getPiece(row + 2 * dir, column) === configs.pieces.empty &&
			this.boardModel.getPiece(row + dir, column) !== configs.pieces.offBoard &&
			this.boardModel.getPiece(row + 2 * dir, column) !== configs.pieces.offBoard &&
			this.boardModel.getPiece(row - 2 * dir, column) === configs.pieces.offBoard
		) {
			moves.push([row + 2 * dir, column]);
		}

		//en passant move
		enPassantPosition = this.boardModel.getEnPassantPosition();
		if (enPassantPosition) {
			if (row + dir === enPassantPosition[0] && column - 1 === enPassantPosition[1]) {
				moves.push([row + dir, column - 1, configs.flags.enPassant]);
			} else if (row + dir === enPassantPosition[0] && column + 1 === enPassantPosition[1]) {
				moves.push([row + dir, column + 1, configs.flags.enPassant]);
			}
		}

		return moves;
	}

	_pawnMoves(row, column) {
		const piece = this.boardModel.getPiece(row, column);
		const color = this.boardModel.getPieceColor(piece);

		return this.__pawnMoves(piece, color, row, column);
	}

	__knightMoves(color, row, column) {
		const moves = [];
		let piece;

		for (let knightAvailableMove of this.knightAvailableMoves) {
			piece = this.boardModel.getPiece(row + knightAvailableMove[0], column + knightAvailableMove[1]);
			if (
				piece !== configs.pieces.offBoard &&
				(color !== this.boardModel.getPieceColor(row + knightAvailableMove[0], column + knightAvailableMove[1]) ||
					piece === configs.pieces.empty)
			) {
				moves.push([row + knightAvailableMove[0], column + knightAvailableMove[1]]);
			}
		}

		return moves;
	}

	_knightMoves(row, column) {
		const color = this.boardModel.getPieceColor(row, column);
		return this.__knightMoves(color, row, column);
	}

	__bishopMoves(color, row, column) {
		const moves = [];
		let piece;
		let indexR;
		let indexC;

		for (let bishopDirection of this.bishopDirections) {
			for (
				indexR = row + bishopDirection[0], indexC = column + bishopDirection[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += bishopDirection[0], indexC += bishopDirection[1]
			) {
				piece = this.boardModel.getPiece(indexR, indexC);
				if (
					piece !== configs.pieces.offBoard &&
					(color !== this.boardModel.getPieceColor(indexR, indexC) || piece === configs.pieces.empty)
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

	_bishopMoves(row, column) {
		const color = this.boardModel.getPieceColor(row, column);
		return this.__bishopMoves(color, row, column);
	}

	__rookMoves(color, row, column) {
		const moves = [];
		let piece;
		let indexR;
		let indexC;

		for (let rookDirection of this.rookDirections) {
			for (
				indexR = row + rookDirection[0], indexC = column + rookDirection[1];
				indexR >= 8 || indexC >= 8 || indexR <= 8 || indexC <= 8;
				indexR += rookDirection[0], indexC += rookDirection[1]
			) {
				piece = this.boardModel.getPiece(indexR, indexC);
				if (
					piece !== configs.pieces.offBoard &&
					(color !== this.boardModel.getPieceColor(indexR, indexC) || piece === configs.pieces.empty)
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
		const color = this.boardModel.getPieceColor(row, column);
		return this.__rookMoves(color, row, column);
	}

	__kingMoves(color, row, column) {
		const moves = [];
		let piece;
		let flag;
		let castleFlags;

		for (let kingAvailableMove of this.kingAvailableMoves) {
			piece = this.boardModel.getPiece(row + kingAvailableMove[0], column + kingAvailableMove[1]);
			if (
				piece !== configs.pieces.offBoard &&
				(color !== this.boardModel.getPieceColor(row + kingAvailableMove[0], column + kingAvailableMove[1]) || piece === configs.pieces.empty)
			) {
				moves.push([row + kingAvailableMove[0], column + kingAvailableMove[1]]);
			}
		}

		//castle moves
		castleFlags = this.boardModel.getCastleFlags()[color];
		if (castleFlags.kingSide) {
			if (
				!this._isSquareAttacked(row, column) &&
				this.boardModel.getPiece(row, column + 1) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column + 1, color) &&
				this.boardModel.getPiece(row, column + 2) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column + 2, color) &&
				((this.boardModel.getPiece(row, column + 3) === configs.pieces.wR && color === configs.colors.white) ||
					(this.boardModel.getPiece(row, column + 3) === configs.pieces.bR && color === configs.colors.black))
			) {
				flag = color === configs.colors.white ? configs.flags.whiteKingCastle : configs.flags.blackKingCastle;
				moves.push([row, column + 2, flag]);
			}
		}

		if (castleFlags.queenSide) {
			if (
				this.boardModel.getPiece(row, column - 1) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 1, color) &&
				this.boardModel.getPiece(row, column - 2) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 2, color) &&
				this.boardModel.getPiece(row, column - 3) === configs.pieces.empty &&
				!this._isSquareAttacked(row, column - 3, color) &&
				((this.boardModel.getPiece(row, column - 4) === configs.pieces.wR && color === configs.colors.white) ||
					(this.boardModel.getPiece(row, column - 4) === configs.pieces.bR && color === configs.colors.black))
			) {
				flag = color === configs.colors.white ? configs.flags.whiteQueenCastle : configs.flags.blackQueenCastle;
				moves.push([row, column - 2, flag]);
			}
		}
		return moves;
	}

	_kingMoves(row, column) {
		const color = this.boardModel.getPieceColor(row, column);
		return this.__kingMoves(color, row, column);
	}

	__getPieceMoves(piece, color, row, column) {
		let pieceMoves = [];
		const moves = [];
		let flag;
		let move;

		switch (piece) {
			case configs.pieces.wP:
			case configs.pieces.bP:
				pieceMoves = this.__pawnMoves(piece, color, row, column);
				break;
			case configs.pieces.wN:
			case configs.pieces.bN:
				pieceMoves = this.__knightMoves(color, row, column);
				break;
			case configs.pieces.wB:
			case configs.pieces.bB:
				pieceMoves = this.__bishopMoves(color, row, column);
				break;
			case configs.pieces.wR:
			case configs.pieces.bR:
				pieceMoves = this.__rookMoves(color, row, column);
				break;
			case configs.pieces.wQ:
			case configs.pieces.bQ:
				pieceMoves = this.__rookMoves(color, row, column).concat(this.__bishopMoves(color, row, column));
				break;
			case configs.pieces.wK:
			case configs.pieces.bK:
				pieceMoves = this.__kingMoves(color, row, column);
				break;
		}

		for (let pieceMove of pieceMoves) {
			flag = typeof pieceMove[2] !== 'undefined' ? pieceMove[2] : null;
			move = {
				piece,
				pieceDest: this.boardModel.getPiece(pieceMove[0], pieceMove[1]),
				color,
				rowOrig: row,
				columnOrig: column,
				rowDest: pieceMove[0],
				columnDest: pieceMove[1],
				flag,
				promotedPiece: flag === configs.flags.promotion ? pieceMove[3] : null,
				//hash key (to be calculated later)
				hash: this.boardModel.getHash(),
			};
			move.score = this.MvvLvaService.getScore(this.boardModel, move);
			moves.push(move);
		}

		return moves;
	}

	_getPieceMoves(row, column) {
		const piece = this.boardModel.getPiece(row, column);
		const color = this.boardModel.getPieceColor(piece);

		return this.__getPieceMoves(piece, color, row, column);
	}

	_isSquareAttacked(row, column, squareColor = null) {
		let piece = this.boardModel.getPiece(row, column);
		let dir;
		let color;
		let indexR;
		let indexC;

		if (piece === configs.pieces.offBoard) {
			return false;
		}

		color = piece !== configs.pieces.empty ? this.boardModel.getPieceColor(row, column) : squareColor;
		if (color === null) {
			return false;
		}

		dir = color === configs.colors.white ? 1 : -1;

		//pawn attack right
		piece = this.boardModel.getPiece(row + dir, column + 1);
		if (this.boardModel.isPawn(piece) && color !== this.boardModel.getPieceColor(row + dir, column + 1)) {
			return true;
		}

		//pawn attack left
		piece = this.boardModel.getPiece(row + dir, column - 1);
		if (this.boardModel.isPawn(piece) && color !== this.boardModel.getPieceColor(row + dir, column - 1)) {
			return true;
		}

		//knight attack moves
		for (let move of this.knightAvailableMoves) {
			piece = this.boardModel.getPiece(row + move[0], column + move[1]);
			if (
				(piece === configs.pieces.wN || piece === configs.pieces.bN) &&
				color !== this.boardModel.getPieceColor(row + move[0], column + move[1])
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
				piece = this.boardModel.getPiece(indexR, indexC);
				if (
					(piece === configs.pieces.wB || piece === configs.pieces.bB || piece === configs.pieces.wQ || piece === configs.pieces.bQ) &&
					color !== this.boardModel.getPieceColor(indexR, indexC)
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
				piece = this.boardModel.getPiece(indexR, indexC);
				if (
					(piece === configs.pieces.wR || piece === configs.pieces.bR || piece === configs.pieces.wQ || piece === configs.pieces.bQ) &&
					color !== this.boardModel.getPieceColor(indexR, indexC)
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
			piece = this.boardModel.getPiece(row + move[0], column + move[1]);
			if (
				(piece === configs.pieces.wK || piece === configs.pieces.bK) &&
				color !== this.boardModel.getPieceColor(row + move[0], column + move[1])
			) {
				return true;
			}
		}

		return false;
	}

	_generateAllMoves(color) {
		const pieceList = this.boardModel.getPieceList(color);
		let moves = [];

		pieceList.traverse((key, value) => {
			const { row, column, piece } = value;
			moves = moves.concat(this.__getPieceMoves(piece, color, row, column));
		});

		return orderBy(moves, 'score', 'desc');
	}

	/********************
     PUBLIC METHODS
     ********************/

	init() {
		this.history = [];
		this.boardModel = null;
		this.MvvLvaService.init();
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

	isSquareAttacked(board, row, column, color) {
		this.boardModel = board;
		return this._isSquareAttacked(row, column, color);
	}

	generateAllMoves(board, color) {
		this.boardModel = board;
		return this._generateAllMoves(color);
	}

	generateAllCaptureMoves(board, color) {
		const moves = this.generateAllMoves(board, color);
		const captureMoves = [];

		for (let move of moves) {
			if (this.boardModel.isEmpty(move.rowDest, move.columnDest)) {
				continue;
			}

			captureMoves.push(move);
		}

		return orderBy(captureMoves, 'score', 'desc');
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

		if (bestIndex !== currentIndex) {
			temp = movesArr[currentIndex];
			movesArr[currentIndex] = movesArr[bestIndex];
			movesArr[bestIndex] = temp;
		}

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
