'use strict';

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
        each(validMoves, (validMove) => {
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
            move.piece = board.getPieceByRowColumn(move.rowOrig, move.columnOrig);
            move.pieceDest = board.getPieceByRowColumn(move.rowDest, move.columnDest);
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
        let pieceOrig;
        let pieceDest;
        let pieceColor;

        if (!move.piece) {
            move = extendMove(move);
        }

        if (move) {
            jsonObj.isCheckMate = false;
            jsonObj.lastMove = null;
            jsonObj.algebraicNotation = null;
            boardModel = BoardService.getBoard();
            pieceOrig = boardModel.getPieceByRowColumn(move.rowOrig, move.columnOrig);
            pieceDest = boardModel.getPieceByRowColumn(move.rowDest, move.columnDest);
            pieceColor = boardModel.getPieceColour(move.rowOrig, move.columnOrig);
            moveFlags = BoardService.makeMove(move);

            if (moveFlags) {
                BoardService.switchSide();
                boardModel = BoardService.getBoard();
                jsonObj.board = getBoard();

                oppositeKingPosition = boardModel.getKingPosition(pieceColor ^ 1);
                moveFlags.isOppositeKingInCheck = BoardService.isPieceAttacked(oppositeKingPosition[0], oppositeKingPosition[1]);
                jsonObj.algebraicNotation = NotationService.algebraicNotation(pieceOrig, pieceDest, move, moveFlags);

                jsonObj.lastMove = move;
                if (BoardService.isCheckMate(boardModel.getSide() ^ 1)) {
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

    return {
        initBoard: BoardService.initBoard.bind(BoardService),
        printBoard: BoardService.printBoard.bind(BoardService),
        parseFEN: BoardService.parseFEN.bind(BoardService),
        getBoard: getBoard,
        getPieceValidMoves: BoardService.getPieceValidMoves.bind(BoardService),
        isCheckMate: BoardService.isCheckMate.bind(BoardService),
        searchNextMove: SearchService.searchNextMove.bind(SearchService),
        makeMove: makeMove,
        getPieceSide: getPieceSide,
        configs: configs
    };
})();
