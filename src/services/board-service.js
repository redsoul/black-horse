const PieceService = require('./piece-service.js');
const MoveService = require('./move-service.js');
const HashService = require('./hash-service.js');
const NotationService = require('./notation-service.js');
const BoardModel = require('../models/board-model-8x8.js');
const configs = require('../configurations');
const each = require('lodash/each');

class BoardService {
    constructor() {
        this.PieceService = PieceService;
        this.MoveService = MoveService;
        this.initBoard();
    }

    initBoard() {
        this.boardModel = new BoardModel();
        HashService.initHashKeys();
        this.parseFEN(configs.fen.startingString);
        this.MoveService.init();
    }

    updateBoardHash(hash) {
        if (!hash) {
            this.boardModel.setHash(HashService.generateBoardHash(this.boardModel));
        }
        else {
            this.boardModel.setHash(hash);
        }
    }

    getBoard() {
        return this.boardModel;
    }

    /*
     http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation

     //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
     */
    parseFEN(fen) {
        let fenCnt;
        let piece = configs.pieces.empty;
        let column = 1;
        let row = 8;
        let count;
        let index;
        let currentPiece;
        let castleFlags;
        let fenLength;

        this.boardModel.resetBoard();

        for (fenCnt = 0, fenLength = fen.length; fenCnt < fenLength; fenCnt += 1) {
            count = 1;

            //check is a piece
            if (configs.fen.validPieces.indexOf(fen[fenCnt]) !== -1) {
                piece = configs.fen.piecesConversion[fen[fenCnt]];
            }
            //check if is a number
            else if (parseInt(fen[fenCnt]) >= 1 && parseInt(fen[fenCnt]) <= 8) {
                count = parseInt(fen[fenCnt]);
                piece = configs.pieces.empty;
            }
            //check if a row ending
            else if (fen[fenCnt] === '/') {
                row--;
                column = 1;
                continue;
            }
            //check if a empty space
            else if (fen[fenCnt] === ' ') {
                fenCnt += 1;
                break;
            }

            //add pieces to board
            for (index = 0; index < count; index += 1) {
                //save the kings positions for check validations
                if (piece === configs.pieces.wK) {
                    this.boardModel.setKingPosition(configs.colors.white, [row, column]);
                } else if (piece === configs.pieces.bK) {
                    this.boardModel.setKingPosition(configs.colors.black, [row, column]);
                }

                this.boardModel.setPieceByRowColumn(row, column, piece);
                currentPiece = this.boardModel.getPieceByRowColumn(row, column);

                if (piece !== configs.pieces.empty) {
                    this.boardModel.incrementPieceCounter(piece);
                    this._updateMaterial(currentPiece, true);
                    this._addToPieceList(currentPiece, row, column);

                    if (piece === configs.pieces.wP || piece === configs.pieces.bP) {
                        this._updatePawnList(currentPiece, row, column);
                    }
                }

                column += 1;
            }
        }

        //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

        //set the play side (black or white)
        this.boardModel.setSide((fen[fenCnt] === 'w') ? configs.colors.white : configs.colors.black);
        fenCnt += 2;

        //set the castling configuration
        castleFlags = this.boardModel.getCastleFlags();
        for (index = 0; index < 4; index += 1) {
            if (fen[fenCnt] === ' ') {
                break;
            }
            switch (fen[fenCnt]) {
                case 'K':
                    castleFlags[configs.colors.white].kingSide = true;
                    break;
                case 'Q':
                    castleFlags[configs.colors.white].queenSide = true;
                    break;
                case 'k':
                    castleFlags[configs.colors.black].kingSide = true;
                    break;
                case 'q':
                    castleFlags[configs.colors.black].queenSide = true;
                    break;
                default:
                    break;
            }
            fenCnt += 1;
        }
        fenCnt += 1;

        //en passant
        if (fen[fenCnt] !== '-') {
            this.boardModel.setEnPassantPosition(parseInt(fen[fenCnt + 1]) + 1, configs.columnChar.indexOf(fen[fenCnt]) + 1);
            fenCnt += 3;
        } else {
            fenCnt += 2;
        }

        this.updateBoardHash();

        if (!isNaN(parseInt(fen[fenCnt + 1], 10))) {
            this.boardModel.setFiftyMoveCounter(parseInt(fen[fenCnt] + fen[fenCnt + 1], 10));
            fenCnt += 3;
        } else {
            this.boardModel.setFiftyMoveCounter(parseInt(fen[fenCnt], 10));
            fenCnt += 2;
        }

        if (!isNaN(parseInt(fen[fenCnt + 1], 10))) {
            this.boardModel.setFullMoveCounter(parseInt(fen[fenCnt] + fen[fenCnt + 1], 10));
        } else {
            this.boardModel.setFullMoveCounter(parseInt(fen[fenCnt], 10));
        }
    }

    convertToFEN(board) {
        board = board || this.boardModel;
        return NotationService.convertToFEN(board);
    }

    getPieceMoves(row, column) {
        if (Array.isArray(row)) {
            return this.MoveService.getPieceMoves(this.boardModel, row[0], row[1]);
        }
        return this.MoveService.getPieceMoves(this.boardModel, row, column);
    }

    getPieceValidMoves(row, column) {
        const moves = this.getPieceMoves(row, column);
        const validMoves = [];
        let index;
        let move;
        let movesLength;

        for (index = 0, movesLength = moves.length; index < movesLength; index += 1) {
            move = moves[index];
            if (this.makeMove(move)) {
                validMoves.push(move);
                this.rollbackMove();
            }
        }

        return validMoves;
    }

    isPieceAttacked(row, column) {
        if (Array.isArray(row)) {
            return this.MoveService.isPieceAttacked(this.boardModel, row[0], row[1]);
        }
        return this.MoveService.isPieceAttacked(this.boardModel, row, column);
    }

    _updateMaterial(piece, up) {
        const side = this.boardModel.getPieceColour(piece);
        let value;
        let sign;

        up = (typeof up === 'undefined') ? true : up;
        sign = up ? 1 : -1;

        if (piece !== configs.pieces.empty) {
            value = this.PieceService.getStartingPieceValue(piece);
            this.boardModel.setPieceMaterial(side, this.boardModel.getPieceMaterial(side) + (value * sign));

            if (piece === configs.pieces.wP || piece === configs.pieces.bP) {
                this.boardModel.setPawnMaterial(side, this.boardModel.getPawnMaterial(side) + (value * sign));
            }
        }
    }

    _updatePawnList(piece, row, column, remove) {
        const side = this.boardModel.getPieceColour(piece);
        const pos = row + '' + column;
        let index;
        const pawnList = this.boardModel.getPawnList(side);

        remove = (typeof remove === 'undefined') ? false : remove;

        if (piece === configs.pieces.wP || piece === configs.pieces.bP) {
            index = pawnList.search(pos);
            if (!remove && !index) {
                pawnList.insert(pos, {row: row, column: column});
            } else if (remove && index) {
                pawnList.remove(pos);
            }
        }
    }

    _addToPieceList(piece, row, column) {
        const value = {row: row, column: column};
        this.boardModel.getPieceList(this.boardModel.getPieceColour(piece)).insert(row + '' + column, value);
    }

    _updatePieceList(pieceOrig, pieceDest, rowOrig, columnOrig, rowDest, columnDest) {
        const sideOrig = this.boardModel.getPieceColour(pieceOrig);
        const sideDest = this.boardModel.getPieceColour(pieceDest);
        const posOrig = rowOrig + '' + columnOrig;
        const posDest = rowDest + '' + columnDest;
        let pieceList;

        if (pieceDest !== configs.pieces.empty && sideDest !== -1 && sideOrig !== sideDest) {
            this.boardModel.getPieceList(sideDest).remove(posDest);
        }

        pieceList = this.boardModel.getPieceList(sideOrig);
        pieceList.remove(posOrig);
        pieceList.insert(posDest, {row: rowDest, column: columnDest});
    }

    _removeFromPieceList(row, column) {
        const piece = this.boardModel.getPieceByRowColumn(row, column);
        const side = this.boardModel.getPieceColour(row, column);
        if (piece !== configs.pieces.empty) {
            this.boardModel.getPieceList(side).remove(row + '' + column);
        }
    }

    _castleMove(pieceOrig, rowOrigin, columnOrigin, rowDest, columnDest) {
        let rook;
        const flags = [];
        let castleFlags;

        flags[configs.colors.white] = {
            kingSide: false,
            queenSide: false
        };
        flags[configs.colors.black] = {
            kingSide: false,
            queenSide: false
        };

        castleFlags = this.boardModel.getCastleFlags();
        switch (pieceOrig) {
            case configs.pieces.wR:
                if (rowOrigin === 1 && columnOrigin === 1) {
                    castleFlags[configs.colors.white].queenSide = false;
                } else if (rowOrigin === 1 && columnOrigin === 8) {
                    castleFlags[configs.colors.white].kingSide = false;
                }
                break;
            case configs.pieces.bR:
                if (rowOrigin === 8 && columnOrigin === 1) {
                    castleFlags[configs.colors.black].queenSide = false;
                } else if (rowOrigin === 8 && columnOrigin === 8) {
                    castleFlags[configs.colors.black].kingSide = false;
                }
                break;
            case configs.pieces.wK:
                if (rowOrigin === 1 && columnOrigin === 5) {
                    //move the rook
                    if (castleFlags[configs.colors.white].kingSide && rowDest === 1 && columnDest === 7 &&
                        this.boardModel.getPieceByRowColumn(1, 8) === configs.pieces.wR) {
                        rook = this.boardModel.getPieceByRowColumn(1, 8);
                        this._hashPiece(rook, 1, 8);
                        this._hashPiece(rook, 1, 6);
                        this._updatePieceList(rook, this.boardModel.getPieceByRowColumn(1, 6), 1, 8, 1, 6);
                        this.boardModel.setPieceByRowColumn(1, 6, rook);
                        this.boardModel.setPieceByRowColumn(1, 8, configs.pieces.empty);
                        flags[configs.colors.white].kingSide = true;
                    } else if (castleFlags[configs.colors.white].queenSide && rowDest === 1 && columnDest === 3 &&
                        this.boardModel.getPieceByRowColumn(1, 1) === configs.pieces.wR) {
                        rook = this.boardModel.getPieceByRowColumn(1, 1);
                        this._hashPiece(rook, 1, 1);
                        this._hashPiece(rook, 1, 4);
                        this._updatePieceList(rook, this.boardModel.getPieceByRowColumn(1, 4), 1, 1, 1, 4);
                        this.boardModel.setPieceByRowColumn(1, 4, rook);
                        this.boardModel.setPieceByRowColumn(1, 1, configs.pieces.empty);
                        flags[configs.colors.white].queenSide = true;
                    }

                    castleFlags[configs.colors.white].queenSide = false;
                    castleFlags[configs.colors.white].kingSide = false;
                }

                break;
            case configs.pieces.bK:
                if (rowOrigin === 8 && columnOrigin === 5) {
                    //move the rook
                    if (castleFlags[configs.colors.black].kingSide && rowDest === 8 && columnDest === 7 &&
                        this.boardModel.getPieceByRowColumn(8, 8) === configs.pieces.bR) {
                        rook = this.boardModel.getPieceByRowColumn(8, 8);
                        this._hashPiece(rook, 8, 8);
                        this._hashPiece(rook, 8, 6);
                        this._updatePieceList(rook, this.boardModel.getPieceByRowColumn(8, 6), 8, 8, 8, 6);
                        this.boardModel.setPieceByRowColumn(8, 6, rook);
                        this.boardModel.setPieceByRowColumn(8, 8, configs.pieces.empty);
                        flags[configs.colors.black].kingSide = true;
                    } else if (castleFlags[configs.colors.black].queenSide && rowDest === 8 && columnDest === 3 &&
                        this.boardModel.getPieceByRowColumn(8, 1) === configs.pieces.bR) {
                        rook = this.boardModel.getPieceByRowColumn(8, 1);
                        this._hashPiece(rook, 8, 1);
                        this._hashPiece(rook, 8, 4);
                        this._updatePieceList(rook, this.boardModel.getPieceByRowColumn(8, 4), 8, 1, 8, 4);
                        this.boardModel.setPieceByRowColumn(8, 4, rook);
                        this.boardModel.setPieceByRowColumn(8, 1, configs.pieces.empty);
                        flags[configs.colors.black].queenSide = true;
                    }

                    castleFlags[configs.colors.black].queenSide = false;
                    castleFlags[configs.colors.black].kingSide = false;
                }

                break;
        }
        return flags;
    }

    _hashCastle() {
        this.boardModel.setHash(HashService.hashCastle(this.boardModel.getHash(), this.boardModel.getCastleFlags()));
    }

    _hashEnPassant() {
        this.boardModel.setHash(HashService.hashEnPassant(this.boardModel.getHash(), this.boardModel.getEnPassantPosition()));
    }

    _hashPiece(piece, row, column) {
        this.boardModel.setHash(HashService.hashPiece(this.boardModel.getHash(), piece, row, column));
    }

    _hashSide() {
        this.boardModel.setHash(HashService.hashSide(this.boardModel.getHash(), this.boardModel.getSide()));
    }

    makeMove(move) {
        let pieceOrig;
        let pieceDest;
        let pieceSide;
        let kingPosition;
        let enPassantPiece;
        let enPassantPosition;
        const flagsObj = {
            enPassant: false,
            castle: false
        };

        if (!move || !move.rowOrig || !move.columnOrig || !move.rowDest || !move.columnDest) {
            return false;
        }

        pieceOrig = move.piece;
        pieceDest = move.pieceDest;
        pieceSide = move.side;

        if (pieceOrig === configs.pieces.empty ||
            pieceOrig === configs.pieces.offBoard ||
            this.boardModel.getPieceColour(move.rowDest, move.columnDest) === pieceSide) {
            return false;
        }

        //add move to history
        this.MoveService.addToHistory(this.boardModel, move);

        this._updatePieceList(pieceOrig, pieceDest, move.rowOrig, move.columnOrig, move.rowDest, move.columnDest);

        //add en passant pawn to capture list
        enPassantPosition = this.boardModel.getEnPassantPosition();
        if (move.flag === configs.flags.enPassant && enPassantPosition) {
            enPassantPiece = this.boardModel.getPieceByRowColumn(enPassantPosition[0], enPassantPosition[1]);
            this.boardModel.decrementPieceCounter(enPassantPiece);
            this.boardModel.addLostPiece(enPassantPosition[0], enPassantPosition[1]);
            this._updateMaterial(enPassantPiece, false);
            this._updatePawnList(enPassantPiece, enPassantPosition[0], enPassantPosition[1], true);

            this._hashPiece(enPassantPiece, enPassantPosition[0], enPassantPosition[1]);
            this._removeFromPieceList(enPassantPosition[0], enPassantPosition[1]);

            this.boardModel.setPieceByRowColumn(enPassantPosition[0], enPassantPosition[1], configs.pieces.empty);

            flagsObj.enPassant = true;
        }

        //add piece to captured list
        if (pieceDest !== configs.pieces.empty) {
            this.boardModel.decrementPieceCounter(pieceDest);
            this.boardModel.addLostPiece(pieceDest);

            this._updateMaterial(pieceDest, false);
            this._updatePawnList(pieceDest, move.rowDest, move.columnDest, true);

            //remove the captured piece from the hash
            this._hashPiece(pieceDest, move.rowDest, move.columnDest);
        }

        //remove the en passant flag
        this._hashEnPassant();

        //detect en passant move
        if ((pieceOrig === configs.pieces.bP && move.rowDest === 5 && move.rowOrig === 7) ||
            (pieceOrig === configs.pieces.wP && move.rowDest === 4 && move.rowOrig === 2)) {
            this.boardModel.setEnPassantPosition(move.rowDest, move.columnDest);
        }
        else {
            this.boardModel.setEnPassantPosition();
        }

        //add the en passant flag
        this._hashEnPassant();

        //remove the castle flags from the hash
        this._hashCastle();

        //set the castle flags
        flagsObj.castle = this._castleMove(pieceOrig, move.rowOrig, move.columnOrig, move.rowDest, move.columnDest);

        //add the castle flags
        this._hashCastle();

        //remove the piece at the origin location from the hash
        this._hashPiece(pieceOrig, move.rowOrig, move.columnOrig);

        //pawns promotions
        if (move.flag === configs.flags.promotion) {
            this._updatePawnList(pieceOrig, move.rowOrig, move.columnOrig, true);
            this._updateMaterial(pieceOrig, false);
            this._updateMaterial(move.promotedPiece, true);

            this.boardModel.setPieceByRowColumn(move.rowOrig, move.columnOrig, configs.pieces.empty);
            this.boardModel.setPieceByRowColumn(move.rowDest, move.columnDest, move.promotedPiece);

            //update the hash
            this._hashPiece(move.promotedPiece, move.rowDest, move.columnDest);
            flagsObj.promotion = true;
        } else {
            //move the piece on the board
            this.boardModel.setPieceByRowColumn(move.rowDest, move.columnDest, pieceOrig);
            this.boardModel.setPieceByRowColumn(move.rowOrig, move.columnOrig, configs.pieces.empty);

            //remove the piece at the destiny location from the hash
            this._hashPiece(pieceOrig, move.rowDest, move.columnDest);
        }

        //update the king position
        kingPosition = this.boardModel.getKingPosition(pieceSide);
        if (kingPosition[0] === move.rowOrig && kingPosition[1] === move.columnOrig) {
            kingPosition = [move.rowDest, move.columnDest];
            this.boardModel.setKingPosition(pieceSide, kingPosition);
        }

        this.boardModel.incrementFullMoveCounter();

        //check if the move is valid
        if (this.isPieceAttacked(kingPosition[0], kingPosition[1])) {
            this.rollbackMove();
            return false;
        }

        return flagsObj;
    }

    makeMoveXY(rowOrig, columnOrig, rowDest, columnDest) {
        const pieceMoves = this.getPieceMoves(rowOrig, columnOrig);
        let index;
        let move;
        let piecesLength;

        for (index = 0, piecesLength = pieceMoves.length; index < piecesLength; index += 1) {
            if (pieceMoves[index].rowDest === rowDest &&
                pieceMoves[index].columnDest === columnDest) {
                move = pieceMoves[index];
                break;
            }
        }

        return this.makeMove(move);
    }

    moveAndSwitch(rowOrig, columnOrig, rowDest, columnDest) {
        const flags = this.makeMoveXY(rowOrig, columnOrig, rowDest, columnDest);
        this.switchSide();
        return flags;
    }

    rollbackMove(cb) {
        const move = this.MoveService.rollback();
        cb = cb || function () {
        };

        if (move) {
            this.boardModel = new BoardModel();
            this.boardModel.rebuild(move.board);
            cb();
        }
    }

    getLastMove() {
        return this.MoveService.getLastMove();
    }

    isCheckMate(side) {
        const board = this.getBoard();
        const kingPosition = board.getKingPosition(side);
        let isKingInCheck = this.isPieceAttacked(kingPosition[0], kingPosition[1]);

        if (isKingInCheck === false) {
            return false;
        }

        const moves = this.generateAllMoves(side);
        let index;
        let move;
        let legalMoves = 0;
        for (index = moves.length - 1; index >= 0; index--) {
            move = moves[index];

            if (!this.makeMove(move)) {
                continue;
            }
            legalMoves += 1;

            isKingInCheck = this.isPieceAttacked(kingPosition[0], kingPosition[1]);
            this.rollbackMove();

            if (isKingInCheck === false) {
                return false;
            }
        }

        return legalMoves === 0;
    }

    switchSide() {
        this.boardModel.switchSide();
        this._hashSide();
    }

    generateAllMoves(side) {
        return this.MoveService.generateAllMoves(this.boardModel, side);
    }

    generateAllCaptureMoves(side) {
        return this.MoveService.generateAllCaptureMoves(this.boardModel, side);
    }

    generateAllValidMoves(side) {
        const moves = this.generateAllMoves(side);
        const validMoves = [];

        each(moves, (move) => {
            if (this.makeMove(move)) {
                validMoves.push(move);
                this.rollbackMove();
            }
        });

        return validMoves;
    }

    updateMoveScore(move, index, side) {
        this.MoveService.updateMoveScore(move.hash, side, index, move.score);
    }

    resetMoveService() {
        this.MoveService.reset();
    }

    printBoard(board) {
        board = board || this.boardModel.get64Board();
        NotationService.printBoard(board);
    }
}

module.exports = new BoardService();