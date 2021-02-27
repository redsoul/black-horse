const each = require('lodash/each');
const configs = require('./src/configurations.js');
const BoardService = require('./src/services/board-service.js');
const NotationService = require('./src/services/notation-service.js');
const SearchService = require('./src/services/search-service.js');

module.exports = (() => {
	function extendMove(move) {
		const validMoves = BoardService.getPieceValidMoves(move.rowOrig, move.columnOrig);
		let isValid = false;
		const board = BoardService.getBoard();

		move.flag = null;
		each(validMoves, validMove => {
			if (validMove.rowDest === move.rowDest && validMove.columnDest === move.columnDest) {
				isValid = true;
				if (validMove.flag) {
					move.flag = validMove.flag;
				}

				if (validMove.promotedPiece) {
					move.promotedPiece = validMove.promotedPiece;
				}
			}
		});

		if (isValid) {
			move.piece = board.getPiece(move.rowOrig, move.columnOrig);
			move.pieceDest = board.getPiece(move.rowDest, move.columnDest);
			move.side = board.getPieceColour(move.piece);
			return move;
		} else {
			return false;
		}
	}

	function getBoard() {
		const board = BoardService.getBoard().toJSON();
		board.fenString = BoardService.convertToFEN();
		return board;
	}

	function makeMove(move) {
		const jsonObj = {};
		let moveFlags;
		let boardModel;
		let oppositeKingPosition;
		let pieceColor;
		const validMoves = BoardService.generateAllValidMoves(BoardService.getBoard().getSide());

		if (typeof move === 'string') {
			move = NotationService.parseMoveNotation(validMoves, move);
		}

		if (!move.piece) {
			move = extendMove(move);
		}

		if (move) {
			jsonObj.isCheckMate = false;
			jsonObj.algebraicNotation = null;
			boardModel = BoardService.getBoard();
			pieceOrig = boardModel.getPiece(move.rowOrig, move.columnOrig);
			pieceDest = boardModel.getPiece(move.rowDest, move.columnDest);
			pieceColor = boardModel.getPieceColour(move.rowOrig, move.columnOrig);
			moveFlags = BoardService.makeMove(move);

			if (moveFlags) {
				BoardService.switchSide();
				boardModel = BoardService.getBoard();
				jsonObj.board = getBoard();

				oppositeKingPosition = boardModel.getKingPosition(pieceColor ^ 1);
				moveFlags.isOppositeKingInCheck = BoardService.isPieceAttacked(oppositeKingPosition[0], oppositeKingPosition[1]);
				jsonObj.algebraicNotation = NotationService.standartAlgebraicNotation(validMoves, move);

				if (BoardService.isCheckMate(boardModel.getSide())) {
					jsonObj.isCheckMate = true;
					jsonObj.ckeckMateWinSide = boardModel.getSide();
				}
			}
		}
		return jsonObj;
	}

	function getPieceSide(row, column) {
		return BoardService.getBoard().getPieceColour(row, column);
	}

	function getPieceValidMoves() {
		let validMoves;
		if (arguments.length === 1 && typeof arguments[0] === 'string') {
			validMoves = BoardService.getPieceValidMoves(parseInt(arguments[0][1], 10), NotationService.files().indexOf(arguments[0][0]) + 1);
		} else {
			validMoves = BoardService.getPieceValidMoves(arguments[0], arguments[1]);
		}

		each(validMoves, move => {
			move.algebraicNotation = NotationService.standartAlgebraicNotation(validMoves, move);
		});

		return validMoves;
	}

	function searchNextMove(options) {
		const nextMove = SearchService.searchNextMove(options);
		const validMoves = BoardService.generateAllValidMoves(BoardService.getBoard().getSide());
		nextMove.algebraicNotation = NotationService.standartAlgebraicNotation(validMoves, nextMove);

		return nextMove;
	}

	return {
		initBoard: BoardService.initBoard.bind(BoardService),
		printBoard: BoardService.printBoard.bind(BoardService),
		parseFEN: BoardService.parseFEN.bind(BoardService),
		getBoard,
		getPieceValidMoves,
		isCheckMate: BoardService.isCheckMate.bind(BoardService),
		searchNextMove,
		move: makeMove,
		getPieceSide,
		configs,
	};
})();
