const isUndefined = require('lodash/isUndefined');
const configs = require('../configurations');

//Zobrist hashing implementation
class HashService {
	constructor() {
		this.squareNumber = 8;
		this.pieceKeys = new Array(12 * this.squareNumber * this.squareNumber);
		this.castleKeys = new Array(16);
		this.enPassantKeys = new Array(this.squareNumber * this.squareNumber);
		this.colorKeys = new Array(2);
		this.movementColorKeys = new Array(2);
	}

	static _rand32() {
		return (
			(Math.floor(Math.random() * 255 + 1) << 23) |
			(Math.floor(Math.random() * 255 + 1) << 16) |
			(Math.floor(Math.random() * 255 + 1) << 8) |
			Math.floor(Math.random() * 255 + 1)
		);
	}

	initHashKeys() {
		let index;

		for (index = 1; index <= 12 * this.squareNumber * this.squareNumber; index += 1) {
			this.pieceKeys[index] = HashService._rand32();
		}

		for (index = 0; index <= this.squareNumber * this.squareNumber; index += 1) {
			this.enPassantKeys[index] = HashService._rand32();
		}

		this.colorKeys[configs.colors.white] = HashService._rand32();
		this.colorKeys[configs.colors.black] = HashService._rand32();

		this.movementColorKeys[configs.colors.white] = HashService._rand32();
		this.movementColorKeys[configs.colors.black] = HashService._rand32();

		for (index = 0; index < 16; index += 1) {
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

	hashColor(origHash, color, firstHash) {
		firstHash = !isUndefined(firstHash);

		if (!firstHash) {
			origHash ^= this.colorKeys[color ^ 1];
		}
		origHash ^= this.colorKeys[color];

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

	hashMovementColor(origHash, color) {
		origHash ^= this.movementColorKeys[color];

		return origHash;
	}

	generateBoardHash(boardModel) {
		let finalKey = 0;

		boardModel.traversePieces((key, value) => {
			const { row, column, piece } = value;
			finalKey = this.hashPiece(finalKey, piece, row, column);
		});

		finalKey = this.hashColor(finalKey, boardModel.getColor(), true);
		finalKey = this.hashEnPassant(finalKey, boardModel.getEnPassantPosition());
		finalKey = this.hashCastle(finalKey, boardModel.getCastleFlags());

		return finalKey;
	}
}

module.exports = new HashService();
