const isUndefined = require('lodash/isUndefined');
const configs = require('../configurations');

//Zobrist hashing implementation
class HashService {
    constructor(){
        this.squareNumber = 8;
        this.pieceKeys = new Array(12 * this.squareNumber * this.squareNumber);
        this.castleKeys = new Array(16);
        this.enPassantKeys = new Array(this.squareNumber * this.squareNumber);
        this.sideKeys = new Array(2);
        this.movementSideKeys = new Array(2);
    }

    static _rand32() {
        return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16)
            | (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1);
    }

    initHashKeys() {
        let index;

        for (index = 1; index <= 12 * this.squareNumber * this.squareNumber; index+=1) {
            this.pieceKeys[index] = HashService._rand32();
        }

        for (index = 0; index <= this.squareNumber * this.squareNumber; index+=1) {
            this.enPassantKeys[index] = HashService._rand32();
        }

        this.sideKeys[configs.colors.white] = HashService._rand32();
        this.sideKeys[configs.colors.black] = HashService._rand32();

        this.movementSideKeys[configs.colors.white] = HashService._rand32();
        this.movementSideKeys[configs.colors.black] = HashService._rand32();

        for (index = 0; index < 16; index+=1) {
            this.castleKeys[index] = HashService._rand32();
        }
    }

    hashPiece(origHash, piece, row, column) {
        origHash ^= this.pieceKeys[piece * row * column];

        return origHash;
    }

    hashCastle(origHash, castlePermissions) {
        let castlePerm = 0;
        if (castlePermissions[configs.colors.white].kingSide) {
            castlePerm |= configs.castleBits.whiteKingSide;
        }
        if (castlePermissions[configs.colors.white].queenSide) {
            castlePerm |= configs.castleBits.whiteQueenSide;
        }
        if (castlePermissions[configs.colors.black].kingSide) {
            castlePerm |= configs.castleBits.blackKingSide;
        }
        if (castlePermissions[configs.colors.black].queenSide) {
            castlePerm |= configs.castleBits.blackQueenSide;
        }

        origHash ^= this.castleKeys[castlePerm];

        return origHash;
    }

    hashSide(origHash, side, firstHash) {
        firstHash = !isUndefined(firstHash);

        if (!firstHash) {
            origHash ^= this.sideKeys[side ^ 1];
        }
        origHash ^= this.sideKeys[side];

        return origHash;
    }

    hashEnPassant(origHash, enPassant) {
        let row = 0;
        let column = 0;

        if (enPassant !== false) {
            row = enPassant[0];
            column = enPassant[1];
        }
        origHash ^= this.enPassantKeys[row * column];

        return origHash;
    }

    hashMovementSide(origHash, side) {
        origHash ^= this.movementSideKeys[side];

        return origHash;
    }

    generateBoardHash(boardModel) {
        let finalKey = 0;

        boardModel.traverse((row, column, piece) => {
            if (piece !== configs.pieces.empty) {
                finalKey = this.hashPiece(finalKey, piece, row, column);
            }
        });

        finalKey = this.hashSide(finalKey, boardModel.getSide(), true);
        finalKey = this.hashEnPassant(finalKey, boardModel.getEnPassantPosition());
        finalKey = this.hashCastle(finalKey, boardModel.getCastleFlags());

        return finalKey;
    }
}

module.exports = new HashService();
