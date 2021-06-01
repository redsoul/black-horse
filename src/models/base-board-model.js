const configs = require('../configurations');
const indexOf = require('lodash/indexOf');
const cloneDeep = require('lodash/cloneDeep');
const times = require('lodash/times');
const MapModel = require('./map-model');

module.exports = class BaseBoardModel {
	constructor() { }

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
			color: this.color,
			enPassant: this.enPassant,
			fiftyMoveCounter: this.fiftyMoveCounter,
			fullmoveCounter: this.fullmoveCounter,
			pawnList: cloneDeep(this.pawnList),
			pieceList: cloneDeep(this.pieceList),
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
		this.color = obj.color;
		this.enPassant = obj.enPassant;
		this.fiftyMoveCounter = obj.fiftyMoveCounter;
		this.fullmoveCounter = obj.fullmoveCounter;

		this.pawnList = [];
		this.pieceList = [];

		if (
			typeof obj.pawnList[configs.colors.black] === 'object' &&
			typeof obj.pawnList[configs.colors.white] === 'object' &&
			typeof obj.pieceList[configs.colors.black] === 'object' &&
			typeof obj.pieceList[configs.colors.white] === 'object'
		) {
			this.pawnList[configs.colors.black] = obj.pawnList[configs.colors.black].clone();
			this.pawnList[configs.colors.white] = obj.pawnList[configs.colors.white].clone();
			this.pieceList[configs.colors.black] = obj.pieceList[configs.colors.black].clone();
			this.pieceList[configs.colors.white] = obj.pieceList[configs.colors.white].clone();
		} else {
			this.pawnList[configs.colors.black] = new MapModel();
			this.pawnList[configs.colors.white] = new MapModel();
			this.pieceList[configs.colors.black] = new MapModel();
			this.pieceList[configs.colors.white] = new MapModel();

			this.pawnList[configs.colors.black].rebuild(obj.pawnList[configs.colors.black]);
			this.pawnList[configs.colors.white].rebuild(obj.pawnList[configs.colors.white]);
			this.pieceList[configs.colors.black].rebuild(obj.pieceList[configs.colors.black]);
			this.pieceList[configs.colors.white].rebuild(obj.pieceList[configs.colors.white]);
		}
	}

	getPiece(row, col) {
		// eslint-disable-line no-unused-vars
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

	getPieceMaterial(color) {
		return this.pieceMaterial[color];
	}

	setPieceMaterial(color, value) {
		this.pieceMaterial[color] = value;
	}

	getPawnMaterial(color) {
		return this.pawnMaterial[color];
	}

	setPawnMaterial(color, value) {
		this.pawnMaterial[color] = value;
	}

	getPawnList(color) {
		return this.pawnList[color];
	}

	getPieceList(color) {
		return this.pieceList[color];
	}

	isEmpty(row, column) {
		return this.getPiece(row, column) === configs.pieces.empty;
	}

	isPawn(piece) {
		return piece === configs.pieces.wP || piece === configs.pieces.bP;
	}

	getKingPosition(color) {
		return this.kingPosition[color];
	}

	setKingPosition(color, pos) {
		this.kingPosition[color] = pos;
	}

	getColor() {
		return this.color;
	}

	setColor(_color) {
		this.color = _color;
	}

	switchColor() {
		this.color ^= 1;
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

	get64Board() {
		const board = times(8, function () {
			return new Array(8);
		});
		let indexCol;
		let indexRow;

		for (indexRow = 8; indexRow >= 1; indexRow--) {
			for (indexCol = 1; indexCol <= 8; indexCol++) {
				board[8 - indexRow][indexCol - 1] = this.getPiece(indexRow, indexCol);
			}
		}

		return board;
	}

	getPieceColor() {
		if (arguments.length === 1) {
			let piece = arguments[0];
			if (piece === configs.pieces.empty || piece === configs.pieces.offBoard) {
				return -1;
			}
			return indexOf(configs.whitePieces, piece) >= 0 ? configs.colors.white : configs.colors.black;
		}
		return this.getPieceColor(this.getPiece(arguments[0], arguments[1]));
	}

	addLostPiece() {
		const piece = arguments.length === 1 ? arguments[0] : this.getPiece(arguments[0], arguments[1]);
		this.capturedPieces[this.getPieceColor(piece)].push(piece);
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
