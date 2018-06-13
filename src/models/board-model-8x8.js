const BaseBoardModel = require('./base-board-model.js');
const ListModel = require('./list-model.js');
const times  = require( 'lodash/times');
const cloneDeep  = require( 'lodash/cloneDeep');
const isUndefined  = require( 'lodash/isUndefined');
const configs  = require('../configurations');

module.exports = class BoardModel extends BaseBoardModel{

    constructor() {
        super();
        this.resetBoard();
    }

    resetBoard() {
        let indexW;
        let indexH;
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
        this.board = times(8, function () {
            return new Array(8);
        });

        //put all board squares as empty
        for (indexW = 0; indexW < 8; indexW++) {
            for (indexH = 0; indexH < 8; indexH++) {
                this.board[indexH][indexW] = configs.pieces.empty;
            }
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
        for (indexW = 0, arrayLength = piecesKeys.length; indexW < arrayLength; indexW++) {
            piece = configs.pieces[piecesKeys[indexW]];
            if (piece !== configs.pieces.empty && piece !== configs.pieces.offBoard) {
                this.piecesCounter[configs.pieces[piecesKeys[indexW]]] = 0;
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

    clone() {
        return {
            board: cloneDeep(this.board),
            castle: cloneDeep(this.castle),
            pieceMaterial: cloneDeep(this.pieceMaterial),
            pawnMaterial: cloneDeep(this.pawnMaterial),
            capturedPieces: cloneDeep(this.capturedPieces),
            kingPosition: cloneDeep(this.kingPosition),
            piecesCounter: cloneDeep(this.piecesCounter),
            hash: this.hash,
            side: this.side,
            enPassant: this.enPassant,
            fiftyMoveCounter: this.fiftyMoveCounter,
            fullmoveCounter: this.fullmoveCounter,
            pawnList: cloneDeep(this.pawnList),
            pieceList: cloneDeep(this.pieceList)
        };
    }

    rebuild(obj) {
        this.board = obj.board;
        this.castle = obj.castle;
        this.pieceMaterial = obj.pieceMaterial;
        this.pawnMaterial = obj.pawnMaterial;
        this.capturedPieces = obj.capturedPieces;
        this.kingPosition = obj.kingPosition;
        this.piecesCounter = obj.piecesCounter;
        this.hash = obj.hash;
        this.side = obj.side;
        this.enPassant = obj.enPassant;
        this.fiftyMoveCounter = obj.fiftyMoveCounter;
        this.fullmoveCounter = obj.fullmoveCounter;

        this.pawnList = [];
        this.pieceList = [];

        if (typeof obj.pawnList[0] === 'object' &&
            typeof obj.pawnList[1] === 'object' &&
            typeof obj.pieceList[0] === 'object' &&
            typeof obj.pieceList[1] === 'object'
        ) {
            this.pawnList[0] = obj.pawnList[0].clone();
            this.pawnList[1] = obj.pawnList[1].clone();
            this.pieceList[0] = obj.pieceList[0].clone();
            this.pieceList[1] = obj.pieceList[1].clone();
        } else {
            this.pawnList[configs.colors.black] = new ListModel();
            this.pawnList[configs.colors.white] = new ListModel();
            this.pieceList[configs.colors.black] = new ListModel();
            this.pieceList[configs.colors.white] = new ListModel();

            this.pawnList[configs.colors.black].rebuild(obj.pawnList[0]);
            this.pawnList[configs.colors.white].rebuild(obj.pawnList[1]);
            this.pieceList[configs.colors.black].rebuild(obj.pieceList[0]);
            this.pieceList[configs.colors.white].rebuild(obj.pieceList[1]);
        }
    }

    traverse(callback) {
        let indexW;
        let indexH;

        if (isUndefined(callback)) {
            callback = function (row, columm, piece) {
                console.log('(' + row + ', ' + columm + ') = ' + piece);
            };
        }

        for (indexW = 0; indexW < 8; indexW++) {
            for (indexH = 0; indexH < 8; indexH++) {
                callback(8 - indexH, indexW + 1, this.board[indexH][indexW]);
            }
        }
    }

    setPieceByRowColumn(row, column, piece) {
        if (row > 8 || column > 8 || row < 1 || column < 1) {
            return false;
        }
        this.board[8 - row][column - 1] = piece;
    }

    getPieceByRowColumn(row, column) {
        if (row > 8 || column > 8 || row < 1 || column < 1) {
            return configs.pieces.offBoard;
        }
        return this.board[8 - row][column - 1];
    }
};