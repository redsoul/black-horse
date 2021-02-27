const invert = require('lodash/invert');

module.exports = (function () {
	const pieces = {
		offBoard: -1,
		empty: 0,
		wP: 1,
		wN: 2,
		wB: 3,
		wR: 4,
		wQ: 5,
		wK: 6,
		bP: 7,
		bN: 8,
		bB: 9,
		bR: 10,
		bQ: 11,
		bK: 12,
	};
	const piecesConversion = {
		p: pieces.bP,
		n: pieces.bN,
		b: pieces.bB,
		r: pieces.bR,
		q: pieces.bQ,
		k: pieces.bK,
		P: pieces.wP,
		N: pieces.wN,
		B: pieces.wB,
		R: pieces.wR,
		Q: pieces.wQ,
		K: pieces.wK,
		'.': pieces.empty,
	};
	const logLevels = {
		info: 1,
		search: 2,
		timeout: 3,
		evaluation: 4,
	};

	return {
		loggingEnabled: true,
		currentLogLevel: logLevels.search,
		logStrategy: 'toConsole',
		rowChar: '12345678',
		columnChar: 'abcdefgh',
		pieceChar: '.PNBRQKpnbrqk',
		colors: {
			white: 0,
			black: 1,
		},
		pieces: pieces,
		whitePieces: [pieces.wP, pieces.wN, pieces.wB, pieces.wR, pieces.wQ, pieces.wK],
		blackPieces: [pieces.bP, pieces.bN, pieces.bB, pieces.bR, pieces.bQ, pieces.bK],
		fen: {
			startingString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0',
			piecesConversion: piecesConversion,
			invertedPiecesConversion: invert(piecesConversion),
			validPieces: 'pnbrqkPNBRQK',
			validCastleChars: 'KQkq',
			validSideChars: 'wb',
		},
		flags: {
			whiteKingCastle: 'wkc',
			whiteQueenCastle: 'wqc',
			blackKingCastle: 'bkc',
			blackQueenCastle: 'bqc',
			enPassant: 'enPassant',
			promotion: 'promotion',
		},
		castleBits: {
			whiteKingSide: 1,
			whiteQueenSide: 2,
			blackKingSide: 4,
			blackQueenSide: 8,
		},
		logLevels: logLevels,
	};
})();
