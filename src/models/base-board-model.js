const configs = require('../configurations');
const indexOf = require('lodash/indexOf');
const cloneDeep = require('lodash/cloneDeep');
const times = require('lodash/times');
const ListModel = require('./list-model');

module.exports = class BaseBoardModel {
	constructor() {}

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
		this.side = obj.side;
		this.enPassant = obj.enPassant;
		this.fiftyMoveCounter = obj.fiftyMoveCounter;
		this.fullmoveCounter = obj.fullmoveCounter;

		this.pawnList = [];
		this.pieceList = [];

		if (
			typeof obj.pawnList[0] === 'object' &&
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

	getPieceByRowColumn(row, col) {
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

	get64Board() {
		const board = times(8, function () {
			return new Array(8);
		});
		let indexCol;
		let indexRow;

		for (indexRow = 8; indexRow >= 1; indexRow--) {
			for (indexCol = 1; indexCol <= 8; indexCol++) {
				board[8 - indexRow][indexCol - 1] = this.getPieceByRowColumn(indexRow, indexCol);
			}
		}

		return board;
	}

	getPieceColour() {
		if (arguments.length === 1) {
			let piece = arguments[0];
			if (piece === configs.pieces.empty || piece === configs.pieces.offBoard) {
				return -1;
			}
			return indexOf(configs.whitePieces, piece) >= 0 ? configs.colors.white : configs.colors.black;
		}
		return this.getPieceColour(this.getPieceByRowColumn(arguments[0], arguments[1]));
	}

	addLostPiece() {
		const piece = arguments.length === 1 ? arguments[0] : this.getPieceByRowColumn(arguments[0], arguments[1]);
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
