const BaseBoardModel = require('./base-board-model.js');
const ListModel = require('./list-model.js');
const isUndefined = require('lodash/isUndefined');
const configs = require('../configurations');

module.exports = class BoardModel extends BaseBoardModel {

    constructor() {
        super();
        this.resetBoard();
    }

    resetBoard() {
        let index;
        let piece;
        let piecesKeys;
        let arrayLength;

        /*
         64 board
         ...┌────────────────────────┐
         8  │ r  n  b  q  k  b  n  r │
         7  │ p  p  p  p  p  p  p  p │
         6  │ .  .  .  .  .  .  .  . │
         5  │ .  .  .  .  .  .  .  . │
         4  │ .  .  .  .  .  .  .  . │
         3  │ .  .  .  .  .  .  .  . │
         2  │ P  P  P  P  P  P  P  P │
         1  │ R  N  B  Q  K  B  N  R │
         ...└────────────────────────┘
         .....a  b  c  d  e  f  g  h
         */
        this.board = new Array(64);

        //put all board squares as empty
        for (index = 0; index < 64; index += 1) {
            this.board[index] = configs.pieces.empty;
        }

        //enPassant flag
        this.enPassant = false;
        this.fiftyMoveCounter = 0;
        this.fullmoveCounter = 0;

        //castle flags
        this.castle = [];
        this.castle[configs.colors.white] = {
            kingSide: false,
            queenSide: false
        };
        this.castle[configs.colors.black] = {
            kingSide: false,
            queenSide: false
        };

        this.side = configs.colors.white;

        this.kingPosition = [];

        //initiate the pieces counter with 0 for all the pieces
        this.piecesCounter = [];
        piecesKeys = Object.keys(configs.pieces);
        for (index = 0, arrayLength = piecesKeys.length; index < arrayLength; index++) {
            piece = configs.pieces[piecesKeys[index]];
            if (piece !== configs.pieces.empty && piece !== configs.pieces.offBoard) {
                this.piecesCounter[configs.pieces[piecesKeys[index]]] = 0;
            }
        }

        this.pieceMaterial = [];
        this.pieceMaterial[configs.colors.black] = 0;
        this.pieceMaterial[configs.colors.white] = 0;

        this.pawnMaterial = [];
        this.pawnMaterial[configs.colors.black] = 0;
        this.pawnMaterial[configs.colors.white] = 0;

        this.pawnList = [];
        this.pawnList[configs.colors.black] = new ListModel();
        this.pawnList[configs.colors.white] = new ListModel();

        this.pieceList = [];
        this.pieceList[configs.colors.black] = new ListModel();
        this.pieceList[configs.colors.white] = new ListModel();

        this.capturedPieces = [];
        this.capturedPieces[configs.colors.white] = [];
        this.capturedPieces[configs.colors.black] = [];
    }

    traverse(callback) {
        let row;
        let column;
        let index;

        if (isUndefined(callback)) {
            callback = function (row, columm, piece) {
                console.log('(' + row + ', ' + columm + ') = ' + piece);
            };
        }

        for (index = 0; index < 64; index++) {
            row = Math.floor(index / 8) + 1;
            column = index % 8 + 1;
            callback(row, column, this.board[index]);
        }
    }

    setPieceByRowColumn(row, column, piece) {
        row--;
        column--;
        if (row > 7 || column > 7 || row < 0 || column < 0) {
            return false;
        }
        this.board[row * 8 + column] = piece;
    }

    getPieceByRowColumn(row, column) {
        row--;
        column--;
        if (row > 7 || column > 7 || row < 0 || column < 0) {
            return configs.pieces.offBoard;
        }

        return this.board[row * 8 + column];
    }
};