const BoardService = require('../../src/services/board-service.js');
const PieceService = require('../../src/services/piece-service.js');
const configs = require('../../src/configurations');

describe('Board Mode 8x8', function () {
	let board;

	describe('getPieceByRowColumn function - ', function () {
		beforeEach(function () {
			BoardService.parseFEN(configs.fen.startingString);
			board = BoardService.getBoard();
		});

		test('tests starting fen positions', function () {
			expect(board.getPiece(1, 1)).toBe(configs.pieces.wR);
			expect(board.getPiece(2, 1)).toBe(configs.pieces.wP);
			expect(board.getPiece(1, 8)).toBe(configs.pieces.wR);
			expect(board.getPiece(7, 1)).toBe(configs.pieces.bP);
			expect(board.getPiece(8, 1)).toBe(configs.pieces.bR);
			expect(board.getPiece(8, 8)).toBe(configs.pieces.bR);
		});
	});

	describe('pawnList', function () {
		test('black promotion', function () {
			BoardService.parseFEN('8/6k1/8/6N1/Pp1rp3/2RP1N2/3Kp3/1r6 b - - 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(2);
			expect(board.getPawnList(configs.colors.black).count()).toBe(3);

			BoardService.makeMoveXY(2, 5, 1, 5);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(2);
			expect(board.getPawnList(configs.colors.black).count()).toBe(2);
		});

		test('white promotion', function () {
			BoardService.parseFEN('8/2P3k1/8/6N1/Pp1rp3/2RP1N2/3Kp3/1r6 b - - 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(3);
			expect(board.getPawnList(configs.colors.black).count()).toBe(3);

			BoardService.makeMoveXY(7, 3, 8, 3);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(2);
			expect(board.getPawnList(configs.colors.black).count()).toBe(3);
		});

		test('capture and promotion', function () {
			BoardService.parseFEN('8/k7/6P1/7K/8/8/p7/BN6 b - - 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(1);
			expect(board.getPawnList(configs.colors.black).count()).toBe(1);

			BoardService.makeMoveXY(2, 1, 1, 2);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(1);
			expect(board.getPawnList(configs.colors.black).count()).toBe(0);
		});

		test('capture', function () {
			BoardService.parseFEN('8/2P3k1/8/6N1/1pp1p3/P1RP1N2/3Kp3/1r6 w - - 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(3);
			expect(board.getPawnList(configs.colors.black).count()).toBe(4);

			BoardService.makeMoveXY(3, 4, 4, 5);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(3);
			expect(board.getPawnList(configs.colors.black).count()).toBe(3);

			BoardService.makeMoveXY(4, 2, 3, 1);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(2);
			expect(board.getPawnList(configs.colors.black).count()).toBe(3);
		});

		test('en passant move', function () {
			BoardService.parseFEN('8/6bb/8/R7/2pP2k1/4P3/P7/K7 b - d3 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(3);
			expect(board.getPawnList(configs.colors.black).count()).toBe(1);

			BoardService.makeMoveXY(4, 3, 3, 4);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(2);
			expect(board.getPawnList(configs.colors.black).count()).toBe(1);
		});

		test('move', function () {
			BoardService.parseFEN('r1b1k2r/ppppqppp/2nb1n2/1N2p3/4P3/3PBN2/PPP2PPP/R2QKB1R b KQkq - 0 1');
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(8);
			expect(board.getPawnList(configs.colors.black).count()).toBe(8);

			BoardService.makeMoveXY(2, 2, 3, 2);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(8);
			expect(board.getPawnList(configs.colors.black).count()).toBe(8);

			BoardService.makeMoveXY(7, 7, 5, 7);
			board = BoardService.getBoard();

			expect(board.getPawnList(configs.colors.white).count()).toBe(8);
			expect(board.getPawnList(configs.colors.black).count()).toBe(8);
		});
	});

	describe('Material score - ', function () {
		beforeEach(function () {
			BoardService.initBoard();
			board = BoardService.getBoard();
		});

		test('Starting FEN', function () {
			expect(board.getPawnMaterial(configs.colors.black)).toBe(PieceService.getStartingPawnMaterial() / 2);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(PieceService.getStartingPawnMaterial() / 2);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(PieceService.getStartingMaterial() / 2);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(PieceService.getStartingMaterial() / 2);
			expect(board.getPieceList(configs.colors.white).count()).toBe(16);
			expect(board.getPieceList(configs.colors.black).count()).toBe(16);
		});

		test('Capture piece', function () {
			BoardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w KQkq - 0 1');
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(300);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(300);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51625);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(51625);
			expect(board.getPieceList(configs.colors.white).count()).toBe(6);
			expect(board.getPieceList(configs.colors.black).count()).toBe(6);

			BoardService.makeMoveXY(3, 3, 5, 4);
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(200);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(300);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51525);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(51625);
			expect(board.getPieceList(configs.colors.white).count()).toBe(6);
			expect(board.getPieceList(configs.colors.black).count()).toBe(5);

			BoardService.rollbackMove();
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(300);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(300);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51625);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(51625);
			expect(board.getPieceList(configs.colors.white).count()).toBe(6);
			expect(board.getPieceList(configs.colors.black).count()).toBe(6);
		});

		test('Promotion', function () {
			BoardService.parseFEN('8/2P3k1/8/6N1/Pp1rp3/2RP1N2/3Kp3/1r6 b - - 0 1');
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(300);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(300);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51200);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(51400);
			expect(board.getPieceList(configs.colors.white).count()).toBe(7);
			expect(board.getPieceList(configs.colors.black).count()).toBe(6);

			BoardService.makeMoveXY(7, 3, 8, 3);
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(300);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(200);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51200);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(52300);
			expect(board.getPieceList(configs.colors.white).count()).toBe(7);
			expect(board.getPieceList(configs.colors.black).count()).toBe(6);

			BoardService.rollbackMove();
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(300);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(300);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51200);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(51400);
			expect(board.getPieceList(configs.colors.white).count()).toBe(7);
			expect(board.getPieceList(configs.colors.black).count()).toBe(6);
		});

		test('capture and promotion', function () {
			BoardService.parseFEN('8/k7/8/7K/8/8/p7/BN6 b - - 0 1');
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(100);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(0);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(50100);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(50700);
			expect(board.getPieceList(configs.colors.white).count()).toBe(3);
			expect(board.getPieceList(configs.colors.black).count()).toBe(2);

			BoardService.makeMoveXY(2, 1, 1, 2);
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(0);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(0);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(51000);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(50375);
			expect(board.getPieceList(configs.colors.white).count()).toBe(2);
			expect(board.getPieceList(configs.colors.black).count()).toBe(2);

			BoardService.rollbackMove();
			board = BoardService.getBoard();
			expect(board.getPawnMaterial(configs.colors.black)).toBe(100);
			expect(board.getPawnMaterial(configs.colors.white)).toBe(0);
			expect(board.getPieceMaterial(configs.colors.black)).toBe(50100);
			expect(board.getPieceMaterial(configs.colors.white)).toBe(50700);
			expect(board.getPieceList(configs.colors.white).count()).toBe(3);
			expect(board.getPieceList(configs.colors.black).count()).toBe(2);
		});
	});
});
