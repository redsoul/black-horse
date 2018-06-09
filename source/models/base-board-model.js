const configs = require('../configurations');
const indexOf = require('lodash/indexOf');
const cloneDeep = require('lodash/cloneDeep');

module.exports = class BaseBoardModel {
    constructor() {

    }

    getPiecesCounter(piece) {
        if (piece in this.piecesCounter) {
            return this.piecesCounter[piece];
        }
        return 0;
    }

    decrementPieceCounter(piece) {
        if (piece in this.piecesCounter) {
            this.piecesCounter[piece]--;
        }
    }

    incrementPieceCounter(piece) {
        if (piece in this.piecesCounter) {
            this.piecesCounter[piece]++;
        }
    }

    getPieceMaterial(side) {
        return this.pieceMaterial[side];
    }

    setPieceMaterial(side, value) {
        this.pieceMaterial[side] = value;
    }

    getPawnMaterial(side) {
        return this.pawnMaterial[side];
    }

    setPawnMaterial(side, value) {
        this.pawnMaterial[side] = value;
    }

    getPawnList(side) {
        return this.pawnList[side];
    }

    getPieceList(side) {
        return this.pieceList[side];
    }

    isEmpty(row, column) {
        return this.getPieceByRowColumn(row, column) === configs.pieces.empty;
    }

    getKingPosition(side) {
        return this.kingPosition[side];
    }

    setKingPosition(side, pos) {
        this.kingPosition[side] = pos;
    }

    getSide() {
        return this.side;
    }

    setSide(_side) {
        this.side = _side;
    }

    switchSide() {
        this.side ^= 1;
    }

    getEnPassantPosition() {
        return this.enPassant;
    }

    setEnPassantPosition(row, column) {
        if (row && column) {
            this.enPassant = [row, column];
        } else {
            this.enPassant = false;
        }
    }

    getCastleFlags() {
        return this.castle;
    }

    getHash() {
        return this.hash;
    }

    setHash(_hash) {
        this.hash = _hash;
    }

    getPieceColour() {
        if (arguments.length === 1) {
            let piece = arguments[0];
            if (piece === configs.pieces.empty || piece === configs.pieces.offBoard) {
                return -1;
            }
            return (indexOf(configs.whitePieces, piece) >= 0) ? configs.colors.white : configs.colors.black;
        }
        return this.getPieceColour(this.getPieceByRowColumn(arguments[0], arguments[1]));
    }

    addLostPiece() {
        const piece = (arguments.length === 1) ? arguments[0] : this.getPieceByRowColumn(arguments[0], arguments[1]);

        this.capturedPieces[this.getPieceColour(piece)].push(piece);
    }

    getCapturedPieces() {
        return this.capturedPieces;
    }

    toJSON() {
        return JSON.parse(JSON.stringify(this.clone()));
    }

    toDb() {
        let obj = {};
        obj.capturedPieces = cloneDeep(this.capturedPieces);
        return obj;
    }

    getFiftyMoveCounter() {
        return this.fiftyMoveCounter;
    }

    setFiftyMoveCounter(_fiftyMoveCounter) {
        this.fiftyMoveCounter = _fiftyMoveCounter;
    }

    getFullMoveCounter() {
        return this.fullmoveCounter;
    }

    setFullMoveCounter(_fullmoveCounter) {
        this.fullmoveCounter = _fullmoveCounter;
    }

    incrementFullMoveCounter() {
        this.fullmoveCounter++;
    }
};