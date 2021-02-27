const configs = require('../configurations');
const pad = require('lodash/pad');
const each = require('lodash/each');
const LoggerService = require('./logger-service.js');

module.exports = class NotationService {
	static files() {
		return Object.freeze(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
	}

	static convertToFEN(board) {
		let indexR;
		let indexC;
		let piece;
		let emptyCount;
		let fenStr = '';
		let board64;
		let castleFlags;
		let enPassantPosition;
		let arrayLength;
		let array2Length;

		board64 = board.get64Board();
		for (indexR = 0, arrayLength = board64.length; indexR < arrayLength; indexR += 1) {
			emptyCount = 0;
			for (indexC = 0, array2Length = board64[indexR].length; indexC < array2Length; indexC += 1) {
				piece = board64[indexR][indexC];
				if (piece === configs.pieces.empty) {
					emptyCount += 1;
				} else {
					if (emptyCount !== 0) {
						fenStr += emptyCount;
					}
					emptyCount = 0;
					fenStr += configs.fen.invertedPiecesConversion[piece];
				}
			}

			if (emptyCount !== 0) {
				fenStr += emptyCount;
			}

			if (indexR === 7) {
				fenStr += ' ';
			} else {
				fenStr += '/';
			}
		}

		fenStr += configs.fen.validSideChars[board.getSide()] + ' ';

		castleFlags = board.getCastleFlags();
		if (castleFlags[configs.colors.white].kingSide === true) {
			fenStr += 'K';
		}
		if (castleFlags[configs.colors.white].queenSide === true) {
			fenStr += 'Q';
		}
		if (castleFlags[configs.colors.black].kingSide === true) {
			fenStr += 'k';
		}
		if (castleFlags[configs.colors.black].queenSide === true) {
			fenStr += 'q';
		}
		if (
			castleFlags[configs.colors.white].kingSide === false &&
			castleFlags[configs.colors.white].queenSide === false &&
			castleFlags[configs.colors.black].kingSide === false &&
			castleFlags[configs.colors.black].queenSide === false
		) {
			fenStr += '- ';
		} else {
			fenStr += ' ';
		}

		enPassantPosition = board.getEnPassantPosition();
		if (enPassantPosition === false) {
			fenStr += '- ';
		} else {
			fenStr += configs.columnChar[enPassantPosition[1] - 1] + enPassantPosition[0] + ' ';
		}

		fenStr += board.getFiftyMoveCounter() + ' ';
		fenStr += board.getFullMoveCounter();

		return fenStr;
	}

	static printBoard(board) {
		let column;
		let row;
		let piece;
		let line;

		LoggerService.log('\nGame Board:\n');
		for (row = 0; row <= 7; row += 1) {
			line = configs.rowChar[7 - row] + '  ';
			for (column = 0; column <= 7; column += 1) {
				piece = board[row][column];
				line += ' ' + configs.pieceChar[piece] + ' ';
			}
			LoggerService.log(line);
		}

		LoggerService.log('');
		line = '   ';
		for (column = 1; column <= 8; column += 1) {
			line += ' ' + configs.columnChar[column - 1] + ' ';
		}
		LoggerService.log(line);
	}

	static algebraic(row, column) {
		return NotationService.files()[column - 1] + row;
	}

	//check for ambiguous moves
	static disambiguator(validMoves, move) {
		let ambiguities = 0;
		let sameRank = 0;
		let sameFile = 0;
		each(validMoves, validMove => {
			if (
				move.piece === validMove.piece &&
				move.rowOrig === validMove.rowOrig &&
				move.columnOrig === validMove.columnOrig &&
				move.rowDest === validMove.rowDest &&
				move.columnDest === validMove.columnDest
			) {
				return;
			}

			/* if a move of the same piece type ends on the same to square, we'll
			 * need to add a disambiguator to the algebraic notation
			 */
			if (
				move.piece === validMove.piece &&
				(move.rowOrig !== validMove.rowOrig || move.columnOrig !== validMove.columnOrig) &&
				move.rowDest === validMove.rowDest &&
				move.columnDest === validMove.columnDest
			) {
				ambiguities++;

				if (move.rowOrig === validMove.rowOrig) {
					sameRank++;
				}

				if (move.columnOrig === validMove.columnOrig) {
					sameFile++;
				}
			}
		});

		if (ambiguities > 0) {
			/* if there exists a similar moving piece on the same rank and file as
			 * the move in question, use the square as the disambiguator
			 */
			const algebraicMove = NotationService.algebraic(move.rowOrig, move.columnOrig);
			if (sameRank > 0 && sameFile > 0) {
				return algebraicMove;
			} else if (sameFile > 0) {
				// if the moving piece rests on the same file, use the rank symbol as the disambiguator
				return algebraicMove.charAt(1);
			} else {
				/* else use the file symbol */
				return algebraicMove.charAt(0);
			}
		}

		return '';
	}

	static standartAlgebraicNotation(validMoves, move) {
		if (!move) {
			return;
		}

		if (move.flag === configs.flags.whiteKingCastle || move.flag === configs.flags.blackKingCastle) {
			return '0-0';
		}

		if (move.flag === configs.flags.whiteQueenCastle || move.flag === configs.flags.blackQueenCastle) {
			return '0-0-0';
		}

		const disambiguation = NotationService.disambiguator(validMoves, move);
		let san = '';

		if (move.piece !== configs.pieces.bP && move.piece !== configs.pieces.wP) {
			san += configs.fen.invertedPiecesConversion[move.piece] + disambiguation;
		}

		if (move.pieceDest !== configs.pieces.empty || move.flag === configs.flags.enPassant) {
			if (move.piece === configs.pieces.bP || move.piece === configs.pieces.wP) {
				san += NotationService.algebraic(move.rowOrig, move.columnOrig).charAt(0);
			}
			san += 'x';
		}

		san += NotationService.algebraic(move.rowDest, move.columnDest);

		if (move.promotedPiece) {
			san += '=' + configs.fen.invertedPiecesConversion[move.promotedPiece];
		}

		if (move.flag === configs.flags.enPassant) {
			san += ' e.p.';
		}

		return san;
	}

	static parseMoveNotation(validMoves, notationMove) {
		const cleanedMove = notationMove.replace(/=/, '').replace(/[+#]?[?!]*$/, '');

		let targetMove = null;
		each(validMoves, function (move) {
			if (cleanedMove === NotationService.standartAlgebraicNotation(validMoves, move)) {
				targetMove = move;
				return false;
			}
		});

		if (!targetMove) {
			throw Error('Invalid Move!');
		}

		return targetMove;
	}

	static printMoveArray(moves) {
		let movesLength;
		let index;

		LoggerService.log(pad('Orig', 12) + pad('Dest', 12) + pad('Score', 8) + pad('Flag', 8));
		LoggerService.log(pad('', 32, '-'));
		for (index = 0, movesLength = moves.length; index < movesLength; index += 1) {
			NotationService.printMove(moves[index]);
		}
		LoggerService.log(pad('', 32, '-'));
	}

	static printMove(move) {
		LoggerService.log(
			pad(move.rowOrig + ', ' + move.columnOrig, 12) + pad(move.rowDest + ', ' + move.columnDest, 12) + pad(move.score, 8) + pad(move.flag, 8)
		);
	}
};
