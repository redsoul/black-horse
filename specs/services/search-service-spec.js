const SearchService = require('../../src/services/search-service.js');
const BoardService = require('../../src/services/board-service.js');
const configs = require('../../src/configurations');

describe('SearchService', function () {
	const searchService = SearchService;
	const boardService = BoardService;
	const searchDepth = 2;
	const searchOptions = { minDepth: searchDepth };

	configs.loggingEnabled = false;

	beforeEach(function () {
		boardService.initBoard();
	});

	describe('searchNextMove - ', function () {
		test('Searches first move for white', function () {
			let move;
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(boardService.getBoard().getFullMoveCounter()).toBe(0);
			move = searchService.searchNextMove({ minDepth: 5 });
			expect(boardService.getBoard().getFullMoveCounter()).toBe(0);
			expect(move.piece).toEqual(1);
			expect(move.rowOrig).toEqual(2);
			expect(move.columnOrig).toEqual(5);
			expect(move.rowDest).toEqual(4);
			expect(move.columnDest).toEqual(5);
		});

		test('Searches first move for black', function () {
			let move;
			expect(boardService.getBoard().getFullMoveCounter()).toBe(0);
			boardService.moveAndSwitch(2, 4, 4, 4);
			expect(boardService.getBoard().getFullMoveCounter()).toBe(1);
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
			move = searchService.searchNextMove(searchOptions);
			expect(boardService.getBoard().getFullMoveCounter()).toBe(1);
			expect(move.piece).toEqual(7);
			expect(move.rowOrig).toEqual(7);
			expect(move.columnOrig).toEqual(4);
			expect(move.rowDest).toEqual(5);
			expect(move.columnDest).toEqual(4);
		});
	});

	describe('Search next move based on FEN strings - ', function () {
		let move;

		beforeEach(function () {
			configs.currentLogLevel = configs.logLevels.search;
		});

		test('King and 2 Pawns against King and Pawn', function () {
			boardService.parseFEN('3k4/3P4/2PK4/8/8/6p1/8/8 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(1);
			expect(move.rowOrig).toEqual(6);
			expect(move.columnOrig).toEqual(3);
			expect(move.rowDest).toEqual(7);
			expect(move.columnDest).toEqual(3);
		});

		test('King and Pawn against King and Pawn', function () {
			boardService.parseFEN('7k/7p/8/8/8/8/7P/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(6);
			expect(move.rowOrig).toEqual(1);
			expect(move.columnOrig).toEqual(8);
			expect(move.rowDest).toEqual(2);
			expect(move.columnDest).toEqual(7);
		});

		test('FEN 3', function () {
			boardService.parseFEN('rn1qkbnr/p4ppp/2p1b3/1Q2p3/2p1P3/3B3P/PP1P1PP1/RNB1K1NR w KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(5);
			expect(move.rowOrig).toEqual(5);
			expect(move.columnOrig).toEqual(2);
			expect(move.rowDest).toEqual(7);
			expect(move.columnDest).toEqual(2);
		});

		test('FEN 4', function () {
			boardService.parseFEN('3bk1nr/p4ppp/2p1b3/4Q3/2p1P3/3q3P/PP1P1PP1/RNB1K1NR b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(9);
			expect(move.rowOrig).toEqual(8);
			expect(move.columnOrig).toEqual(4);
			expect(move.rowDest).toEqual(6);
			expect(move.columnDest).toEqual(6);
		});

		test('FEN 5', function () {
			boardService.parseFEN('r1b1kbnr/pppp1ppp/2n1pq2/8/4P3/2NB4/PPPP1PPP/R1BQK1NR w KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(2);
			expect(move.rowOrig).toEqual(1);
			expect(move.columnOrig).toEqual(7);
			expect(move.rowDest).toEqual(3);
			expect(move.columnDest).toEqual(6);
		});

		test('FEN 6', function () {
			boardService.parseFEN('r1bqk2r/pppp1ppp/2nb1n2/4p1B1/4P3/P1NP4/1PP2PPP/R2QKBNR b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);

			move = searchService.searchNextMove(searchOptions);
			expect(move.piece).toEqual(8);
			expect(move.rowOrig).toEqual(6);
			expect(move.columnOrig).toEqual(3);
			expect(move.rowDest).toEqual(4);
			expect(move.columnDest).toEqual(4);
		});

		test('FEN 7', function () {
			let kingsPosition;

			boardService.parseFEN('r1bqkb1r/ppp2ppp/5n2/3P4/3p4/2NB4/PPPPQPPP/R1B1K2R b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
			move = searchService.searchNextMove(searchOptions);
			kingsPosition = boardService.getBoard().getKingPosition(configs.colors.black);
			expect(boardService.makeMoveXY(move.rowOrig, move.columnOrig, move.rowDest, move.columnDest, move.flag)).toBeTruthy();
			expect(boardService.isPieceAttacked(kingsPosition[0], kingsPosition[1])).toBeFalsy();
		});

		test('FEN 8 - testing depth 1 return alpha', function () {
			boardService.parseFEN('rnb1k2r/pppp1ppp/3b1n2/1N2p1q1/4P3/3B1Q2/PPPP1PPP/R1B1K1NR b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
			move = searchService.searchNextMove({ minDepth: 1 });

			expect(move).not.toBeFalsy();
		});

		test('FEN 9 - testing depth 1 return alpha', function () {
			boardService.parseFEN('rnbqk2r/p2p1ppp/2pb4/3Np3/2B1P3/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
			move = searchService.searchNextMove({ minDepth: 1 });

			expect(move).not.toBeFalsy();
		});

		test('FEN 10', function () {
			boardService.parseFEN('r1bqk2r/pppp1ppp/3b1n2/4p3/1n2P3/2NB1N2/PPPP1PPP/R1BQ1RK1 w kq - 0 10');
			move = searchService.searchNextMove({ minDepth: 1 });

			expect(move).not.toBeFalsy();
		});

		test('FEN 11 - Check with castle', function () {
			boardService.parseFEN('r3k2r/p1p2ppp/4p3/1P6/4n3/5P2/1PQ1BqPP/2RK3R b kq - 5 20');
			move = searchService.searchNextMove({ minDepth: 1 });

			expect(move).not.toBeFalsy();
		});

		test('FEN 12', function () {
			boardService.parseFEN('1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -');
			move = searchService.searchNextMove(searchOptions);

			expect(move).not.toBeFalsy();
		});
	});

	describe('Immediate checkmate moves - ', function () {
		test('Checkmate with Queen and Rook against King', function () {
			boardService.parseFEN('7k/1R6/2Q5/8/8/8/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 5,
				rowOrig: 6,
				columnOrig: 3,
				rowDest: 8,
				columnDest: 3,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Rook against King', function () {
			boardService.parseFEN('1k6/ppp5/8/8/8/8/5R2/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 4,
				rowOrig: 2,
				columnOrig: 6,
				rowDest: 8,
				columnDest: 6,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Queen and Knight against King', function () {
			boardService.parseFEN('4k3/7Q/8/5N2/8/8/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 5,
				rowOrig: 7,
				columnOrig: 8,
				rowDest: 7,
				columnDest: 5,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Queen and Bishop against King and Rook', function () {
			boardService.parseFEN('1kr5/ppp5/8/8/8/5Q3/6B1/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 5,
				rowOrig: 3,
				columnOrig: 6,
				rowDest: 7,
				columnDest: 2,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with 2 Bishops against King and Pawn', function () {
			boardService.parseFEN('k7/p7/8/8/6B1/6B1/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 3,
				rowOrig: 4,
				columnOrig: 7,
				rowDest: 3,
				columnDest: 6,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Bishop and Knight against King and Rook', function () {
			boardService.parseFEN('1kr5/p1p5/1pB5/8/1N6/8/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 2,
				rowOrig: 4,
				columnOrig: 2,
				rowDest: 6,
				columnDest: 1,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with 2 Pawns against King and Pawn', function () {
			boardService.parseFEN('3k4/3P4/2PK4/8/8/6p1/8/8 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 1,
				rowOrig: 6,
				columnOrig: 3,
				rowDest: 7,
				columnDest: 3,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Knight against King and Rook', function () {
			boardService.parseFEN('6rk/6pp/8/6N1/8/8/8/5K2 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 2,
				rowOrig: 5,
				columnOrig: 7,
				rowDest: 7,
				columnDest: 6,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Rook and Knight against King and Rook', function () {
			boardService.parseFEN('5r2/4Nppk/8/8/8/2R5/8/5K2 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 4,
				rowOrig: 3,
				columnOrig: 3,
				rowDest: 3,
				columnDest: 8,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate with Rook and Bishop against King', function () {
			boardService.parseFEN('7k/4Bp1p/8/8/8/8/8/2K3R1 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 3,
				rowOrig: 7,
				columnOrig: 5,
				rowDest: 6,
				columnDest: 6,
				flag: null,
				score: 50001,
			});
		});

		test('Middle game checkmate with Queen and bishop', function () {
			boardService.parseFEN('3r1rk1/1bp1qppp/pp2pb/3n4/3P4/P2QBN2/1P3PPP/1B1RR1K1 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 5,
				rowOrig: 3,
				columnOrig: 4,
				rowDest: 7,
				columnDest: 8,
				flag: null,
				score: 50001,
			});
		});

		test('Checkmate in 2 plays', function () {
			boardService.parseFEN('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
			expect(searchService.searchNextMove(searchOptions)).toMatchObject({
				piece: 11,
				rowOrig: 8,
				columnOrig: 4,
				rowDest: 4,
				columnDest: 8,
				flag: null,
				score: 50001,
			});
		});
	});

	describe('Two moves distance checkmate - ', function () {
		xtest('Checkmate with Queen and Rook against King', function () {
			boardService.parseFEN('7k/1Q6/1R6/8/8/8/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove({ minDepth: 4 })).toMatchObject({
				piece: 5,
				rowOrig: 7,
				columnOrig: 2,
				rowDest: 7,
				columnDest: 1,
				flag: null,
				score: 50002,
			});
		});

		test('Checkmate with Queen and Bishop against King and Rook', function () {
			boardService.parseFEN('1k6/ppp5/8/4r3/8/5Q2/8/7K w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove({ minDepth: 4 })).toMatchObject({
				piece: 5,
				rowOrig: 3,
				columnOrig: 6,
				rowDest: 8,
				columnDest: 6,
				flag: null,
				score: 50003,
			});
		});

		test('Checkmate with 2 Pawns against King and Pawn', function () {
			boardService.parseFEN('3k4/3P4/3K4/2P5/6p1/8/8/8 w - - 0 1');
			expect(boardService.getBoard().getSide()).toBe(configs.colors.white);
			expect(searchService.searchNextMove({ minDepth: 4 })).toMatchObject({
				piece: 1,
				rowOrig: 5,
				columnOrig: 3,
				rowDest: 6,
				columnDest: 3,
				flag: null,
				score: 50003,
			});
		});
	});
});
