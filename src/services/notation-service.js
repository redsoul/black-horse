const configs = require('../configurations');
const pad = require('lodash/pad');

module.exports = class NotationService {
    
    static convertToFEN(board) {
        let indexR;
        let indexC;
        let piece;
        let side;
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
        if (castleFlags[configs.colors.white].kingSide === false &&
            castleFlags[configs.colors.white].queenSide === false &&
            castleFlags[configs.colors.black].kingSide === false &&
            castleFlags[configs.colors.black].queenSide === false) {
            fenStr += '- ';
        } else {
            fenStr += ' ';
        }

        enPassantPosition = board.getEnPassantPosition();
        if (enPassantPosition === false) {
            fenStr += '- ';
        } else {
            side = (enPassantPosition[0] > 4) ? -1 : 1;
            fenStr += configs.columnChar[enPassantPosition[1] - 1] + (enPassantPosition[0] - 1 * side) + ' ';
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

        console.log('\nGame Board:\n');
        for (row = 0; row <= 7; row += 1) {
            line = (configs.rowChar[7 - row] + '  ');
            for (column = 0; column <= 7; column += 1) {
                piece = board[row][column];
                line += (' ' + configs.pieceChar[piece] + ' ');
            }
            console.log(line);
        }

        console.log('');
        line = '   ';
        for (column = 1; column <= 8; column += 1) {
            line += (' ' + configs.columnChar[column - 1] + ' ');
        }
        console.log(line);
    }

    static algebraicNotation(pieceOrig, pieceDest, move, moveFlags) {
        let str = configs.columnChar[move.columnDest - 1] + move.rowDest;
        let kingCheck = moveFlags.isOppositeKingInCheck ? '+' : '';
        let promotedPiece;

        if (pieceOrig <= configs.pieces.empty || pieceOrig > configs.pieces.bK) {
            throw new Error('Invalid origin piece');
        }

        pieceOrig = configs.fen.invertedPiecesConversion[pieceOrig];
        if (pieceDest === configs.pieces.empty && !(moveFlags.promotion && move.promotedPiece) && !moveFlags.enPassant && !(moveFlags.castle && (moveFlags.castle[configs.colors.black].kingSide ||
            moveFlags.castle[configs.colors.white].kingSide ||
            moveFlags.castle[configs.colors.black].queenSide ||
            moveFlags.castle[configs.colors.white].queenSide))
        ) {
            return ((pieceOrig !== 'P' && pieceOrig !== 'p') ? pieceOrig.toUpperCase() : '') + str + kingCheck;
        }

        if (moveFlags.promotion && move.promotedPiece && (move.rowDest === 1 || move.rowDest === 8)) {
            promotedPiece = configs.fen.invertedPiecesConversion[move.promotedPiece];
            return str + '=' + promotedPiece.toUpperCase() + kingCheck;
        }

        str = ((pieceOrig !== 'P' && pieceOrig !== 'p') ? pieceOrig.toUpperCase() : 'e') + 'x' + str;

        if (moveFlags.enPassant) {
            return str + '(ep)' + kingCheck;
        }

        if (moveFlags.castle && (moveFlags.castle[configs.colors.black].kingSide || moveFlags.castle[configs.colors.white].kingSide)) {
            return '0-0' + kingCheck;
        }

        if (moveFlags.castle && (moveFlags.castle[configs.colors.black].queenSide || moveFlags.castle[configs.colors.white].queenSide)) {
            return '0-0-0' + kingCheck;
        }

        return str + kingCheck;
    }

    static printMoveArray(moves) {
        let movesLength;
        let index;

        console.log(
            pad('Orig', 12) +
            pad('Dest', 12) +
            pad('Score', 8) +
            pad('Flag', 8)
        );
        console.log(pad('', 32, '-'));
        for (index = 0, movesLength = moves.length; index < movesLength; index += 1) {
            NotationService.printMove(moves[index]);
        }
        console.log(pad('', 32, '-'));
    }

    static printMove(move) {
        console.log(
            pad(move.rowOrig + ', ' + move.columnOrig, 12) +
            pad(move.rowDest + ', ' + move.columnDest, 12) +
            pad(move.score, 8) + pad(move.flag, 8)
        );
    }
}