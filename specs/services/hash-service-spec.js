const BoardService = require('../../src/services/board-service.js');
const HashService = require('../../src/services/hash-service.js');
const configs = require('../../src/configurations');

describe('Hash Service', function () {
	const boardService = BoardService;
	let boardModel;
	let hashKey;
	let hashKey2;
	let castlePerms;

	//mock Application to allow us to inject our own dependencies
	beforeEach(function () {
		boardService.initBoard();
	});

	describe('generateBoardHash function - ', function () {
		beforeEach(function () {
			boardModel = boardService.getBoard();
			HashService.initHashKeys();
		});

		test('FEN 1', function () {
			boardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w KQkq - 0 1');
			hashKey = HashService.generateBoardHash(boardModel);
			boardService.makeMoveXY(3, 3, 1, 4);
			expect(HashService.generateBoardHash(boardModel)).not.toBe(hashKey);
			boardService.makeMoveXY(1, 4, 3, 3);
			expect(HashService.generateBoardHash(boardModel)).toBe(hashKey);
		});

		test('FEN 2', function () {
			boardService.parseFEN('7k/5p1p/5B2/8/8/8/8/2K3R1 w - - 0 1');
			hashKey = HashService.generateBoardHash(boardModel);
			boardService.makeMoveXY(1, 7, 1, 6);
			expect(HashService.generateBoardHash(boardModel)).not.toBe(hashKey);
			boardService.makeMoveXY(1, 6, 1, 7);
			expect(HashService.generateBoardHash(boardModel)).toBe(hashKey);
		});

		test('FEN 3', function () {
			boardService.parseFEN('1k2R3/ppp5/8/8/8/8/8/7K w - - 0 1');
			hashKey = HashService.generateBoardHash(boardModel);
			boardService.parseFEN('1k2R3/ppp5/8/8/8/8/8/7K b - - 0 1');
			expect(HashService.generateBoardHash(boardModel)).not.toBe(hashKey);
		});
	});

	describe('hash functions - ', function () {
		beforeEach(function () {
			boardService.initBoard();
			boardModel = boardService.getBoard();
		});

		test('hashEnPassant', function () {
			let enPassantPosition;

			hashKey = boardService.getBoard().getHash();
			enPassantPosition = boardModel.getEnPassantPosition();

			hashKey2 = HashService.hashEnPassant(hashKey, enPassantPosition);
			hashKey2 = HashService.hashEnPassant(hashKey2, enPassantPosition);

			expect(hashKey).toBe(hashKey2);
		});

		test('hashPiece', function () {
			hashKey = boardModel.getHash();

			hashKey2 = HashService.hashPiece(hashKey, configs.pieces.wP, 2, 4);
			hashKey2 = HashService.hashPiece(hashKey2, configs.pieces.wP, 2, 4);

			expect(hashKey).toBe(hashKey2);
		});

		test('hashCastle', function () {
			hashKey = boardModel.getHash();
			castlePerms = boardModel.getCastleFlags();
			castlePerms[configs.colors.white].kingSide = !castlePerms[configs.colors.white].kingSide;

			hashKey2 = HashService.hashCastle(hashKey, castlePerms);
			hashKey2 = HashService.hashCastle(hashKey2, castlePerms);

			expect(hashKey).toBe(hashKey2);
		});

		test('hashColor', function () {
			hashKey = boardModel.getHash();

			hashKey2 = HashService.hashColor(hashKey, !boardModel.getColor());
			hashKey2 = HashService.hashColor(hashKey2, !boardModel.getColor());

			expect(hashKey).toBe(hashKey2);
		});

		test('hashMovementColor', function () {
			hashKey = boardModel.getHash();

			hashKey2 = HashService.hashMovementColor(hashKey, !boardModel.getColor());
			hashKey2 = HashService.hashMovementColor(hashKey2, !boardModel.getColor());

			expect(hashKey).toBe(hashKey2);
		});

		test('FEN 1 - starting fen', function () {
			hashKey = boardModel.getHash();

			boardService.parseFEN(configs.fen.startingString);
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 2 - remove a piece', function () {
			hashKey = boardModel.getHash();
			hashKey = HashService.hashPiece(hashKey, configs.pieces.wP, 2, 4);

			boardService.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 3 - move a piece', function () {
			boardService.makeMoveXY(2, 4, 3, 4);
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 4 - capture a piece', function () {
			boardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w KQkq - 0 1');
			boardService.makeMoveXY(3, 3, 5, 4);
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('2qk4/1p3n2/2p5/3N4/5P2/4P3/3P4/4QK2 b KQkq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 5 - pawn promotion', function () {
			boardService.parseFEN('8/P7/8/k7/8/8/8/K7 w - - 0 1');
			boardService.makeMoveXY(7, 1, 8, 1);
			boardService.switchColor();
			expect(boardService.convertToFEN()).toBe('Q7/8/8/k7/8/8/8/K7 b - - 0 2');

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('Q7/8/8/k7/8/8/8/K7 b - - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 6 - capturing and promote', function () {
			boardService.parseFEN('8/k7/8/7K/8/8/p7/1N6 b - - 0 1');
			boardService.makeMoveXY(2, 1, 1, 2);
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('8/k7/8/7K/8/8/8/1q6 w - - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 7 - castling move king side', function () {
			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
			boardService.makeMoveXY(1, 5, 1, 7);
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1 b kq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 8 - castling move queen side', function () {
			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
			boardService.makeMoveXY(1, 5, 1, 3);
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/2KR3R b kq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});

		test('FEN 9 - en passant move', function () {
			boardService.parseFEN('8/7b/8/8/R1p5/4P1k1/P2P4/K7 w - - 0 1');
			expect(boardService.makeMoveXY(2, 4, 4, 4)).toBeTruthy();
			boardService.switchColor();
			hashKey = boardService.getBoard().getHash();

			boardService.parseFEN('8/7b/8/8/R1pP4/4P1k1/P7/K7 b - d3 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
			expect(boardService.makeMoveXY(4, 3, 3, 4, configs.flags.enPassant)).toBeTruthy();
			boardService.switchColor();

			hashKey2 = boardService.getBoard().getHash();
			boardService.parseFEN('8/7b/8/8/R7/3pP1k1/P7/K7 w - - 0 1');
			expect(hashKey).not.toBe(hashKey2);
			expect(hashKey2).toBe(boardService.getBoard().getHash());
		});

		test('FEN 10 - middle game', function () {
			boardService.parseFEN('r1bqk1nr/pppp1ppp/2nb4/4p3/4P3/P1NP4/1PP2PPP/R1BQKBNR w KQkq - 0 1');

			expect(boardService.makeMoveXY(8, 7, 6, 6)).toBeTruthy();
			boardService.switchColor();

			expect(boardService.makeMoveXY(1, 3, 5, 7)).toBeTruthy();
			boardService.switchColor();

			hashKey = boardService.getBoard().getHash();
			boardService.parseFEN('r1bqk2r/pppp1ppp/2nb1n2/4p1B1/4P3/P1NP4/1PP2PPP/R2QKBNR w KQkq - 0 1');
			expect(hashKey).toBe(boardService.getBoard().getHash());
		});
	});
});
