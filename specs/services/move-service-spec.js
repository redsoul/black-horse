const BoardService = require('../../src/services/board-service.js');
const MoveService = require('../../src/services/move-service.js');
const configs = require('../../src/configurations');

describe('Move Service', function () {
	const boardService = BoardService;
	const moveService = MoveService;
	let boardModel;

	beforeEach(function () {
		boardService.initBoard();
	});

	describe('isPieceAttacked function - ', function () {
		beforeEach(function () {
			boardModel = boardService.getBoard();
		});

		test('FEN 1', function () {
			boardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w KQkq - 0 1');
			expect(moveService.isPieceAttacked(boardModel, 5, 4)).toBe(true);
			expect(moveService.isPieceAttacked(boardModel, 4, 6)).toBe(false);
			expect(moveService.isPieceAttacked(boardModel, 1, 1)).toBe(false);
			expect(moveService.isPieceAttacked(boardModel, 5, 2)).toBe(false);
			expect(moveService.isPieceAttacked(boardModel, 5, 1)).toBe(false);
		});

		test('FEN 2', function () {
			let kingPosition;
			boardService.parseFEN('7k/5p1p/5B2/8/8/8/8/2K3R1 w - - 0 1');

			kingPosition = boardModel.getKingPosition(boardModel.getColor() ^ 1);
			expect(moveService.isPieceAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(true);

			kingPosition = boardModel.getKingPosition(boardModel.getColor());
			expect(moveService.isPieceAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(false);
		});

		test('FEN 3', function () {
			boardService.parseFEN('1k2R3/ppp5/8/8/8/8/8/7K w - - 0 1');
			expect(moveService.isPieceAttacked(boardModel, 8, 2)).toBe(true);
		});

		test('FEN 4', function () {
			let kingPosition;
			boardService.parseFEN('8/6kN/8/6q1/Pp1rp3/2RP1N2/3Kp3/1r6 w - - 0 1');
			kingPosition = boardModel.getKingPosition(boardModel.getColor());
			expect(moveService.isPieceAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(true);

			kingPosition = boardModel.getKingPosition(boardModel.getColor() ^ 1);
			expect(moveService.isPieceAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(false);

			expect(moveService.isPieceAttacked(boardModel, 4, 1)).toBe(false);
		});
	});

	describe('generateAllMoves function - ', function () {
		beforeEach(function () {
			boardModel = boardService.getBoard();
		});

		test('FEN 1', function () {
			boardService.parseFEN('7k/7p/8/8/8/8/7P/7K w - - 0 1');

			let board = boardService.getBoard();
			let moves = moveService.generateAllMoves(board, configs.colors.white);
			expect(moves.length).toBe(4);

			moves = moveService.generateAllMoves(board, configs.colors.black);
			expect(moves.length).toBe(4);

			boardService.makeMoveXY(1, 8, 1, 7);

			board = boardService.getBoard();
			moves = moveService.generateAllMoves(board, configs.colors.white);
			expect(moves.length).toBe(6);

			moves = moveService.generateAllMoves(board, configs.colors.black);
			expect(moves.length).toBe(4);

			boardService.makeMoveXY(1, 7, 1, 8);

			board = boardService.getBoard();
			moves = moveService.generateAllMoves(board, configs.colors.white);
			expect(moves.length).toBe(4);

			moves = moveService.generateAllMoves(board, configs.colors.black);
			expect(moves.length).toBe(4);
		});

		test('FEN 2', function () {
			boardService.parseFEN('rnbqkbnr/pp1ppppp/2p5/8/6P1/2P5/PP1PPP1P/RNBQKBNR b KQkq - 0 1');

			const board = boardService.getBoard();
			let moves = moveService.generateAllMoves(board, configs.colors.white);
			expect(moves.length).toBe(22);

			moves = moveService.generateAllMoves(board, configs.colors.black);
			expect(moves.length).toBe(21);
		});
	});

	describe('isSquareAttacked function - ', function () {
		beforeEach(function () {
			boardModel = boardService.getBoard();
		});

		test('FEN 1', function () {
			boardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w KQkq - 0 1');
			expect(moveService.isSquareAttacked(boardModel, 4, 6)).toBe(false);
			expect(moveService.isSquareAttacked(boardModel, 1, 1)).toBe(false);
			expect(moveService.isSquareAttacked(boardModel, 5, 2, configs.colors.white)).toBe(true);
			expect(moveService.isSquareAttacked(boardModel, 5, 1, configs.colors.white)).toBe(false);
			expect(moveService.isSquareAttacked(boardModel, 5, 4)).toBe(true);

			//white queen checks black king
			boardService.makeMoveXY(1, 5, 4, 8);
			expect(moveService.isSquareAttacked(boardModel, 8, 4)).toBe(true);
		});

		test('FEN 2', function () {
			let kingPosition;
			boardService.parseFEN('7k/5p1p/5B2/8/8/8/8/2K3R1 w - - 0 1');

			kingPosition = boardModel.getKingPosition(boardModel.getColor() ^ 1);
			expect(moveService.isSquareAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(true);
			expect(moveService.isSquareAttacked(boardModel, kingPosition[0], kingPosition[1] - 1, boardModel.getColor() ^ 1)).toBe(true);

			kingPosition = boardModel.getKingPosition(boardModel.getColor());
			expect(moveService.isSquareAttacked(boardModel, kingPosition[0], kingPosition[1])).toBe(false);

			expect(moveService.isSquareAttacked(boardModel, 6, 6)).toBe(false);
			expect(moveService.isSquareAttacked(boardModel, 7, 6)).toBe(false);
		});

		test('FEN 3', function () {
			boardService.parseFEN('1k2R3/ppp5/8/8/8/8/8/7K w - - 0 1');
			expect(moveService.isSquareAttacked(boardModel, 8, 2)).toBe(true);
		});
	});

	describe('_kingMoves function - ', function () {
		beforeEach(function () {
			boardService.parseFEN(configs.fen.startingString);
		});

		test('FEN 1', function () {
			let kingPosition;

			boardService.parseFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			kingPosition = boardService.getBoard().getKingPosition(configs.colors.white);

			expect(moveService._kingMoves(kingPosition[0], kingPosition[1])).toEqual([
				[2, 5],
				[1, 6],
				[2, 4],
				[1, 4],
				[2, 6],
				[1, 7, configs.flags.whiteKingCastle],
				[1, 3, configs.flags.whiteQueenCastle],
			]);

			kingPosition = boardService.getBoard().getKingPosition(configs.colors.black);
			expect(moveService._kingMoves(kingPosition[0], kingPosition[1])).toEqual([
				[8, 6],
				[7, 5],
				[8, 4],
				[7, 4],
				[7, 6],
				[8, 7, configs.flags.blackKingCastle],
				[8, 3, configs.flags.blackQueenCastle],
			]);
		});

		test('FEN 2', function () {
			boardService.parseFEN('r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(1, 5)).toEqual([
				[2, 5],
				[1, 6],
				[2, 4],
				[1, 4],
				[2, 6],
			]);

			expect(moveService._kingMoves(8, 5)).toEqual([
				[8, 6],
				[7, 5],
				[8, 4],
				[7, 4],
				[7, 6],
			]);
		});

		test('FEN 3', function () {
			boardService.parseFEN('r3k2r/8/3q4/8/8/8/8/R3K2R w KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(1, 5)).toEqual([
				[2, 5],
				[1, 6],
				[2, 4],
				[1, 4],
				[2, 6],
				[1, 7, configs.flags.whiteKingCastle],
			]);

			expect(moveService._kingMoves(8, 5)).toEqual([
				[8, 6],
				[7, 5],
				[8, 4],
				[7, 4],
				[7, 6],
				[8, 7, configs.flags.blackKingCastle],
				[8, 3, configs.flags.blackQueenCastle],
			]);
		});

		test('FEN 4', function () {
			boardService.parseFEN('rn2k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(8, 5)).toEqual([
				[8, 6],
				[8, 4],
				[8, 7, configs.flags.blackKingCastle],
			]);
		});

		test('FEN 5', function () {
			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(1, 5)).toEqual([
				[1, 6],
				[1, 4],
				[1, 7, configs.flags.whiteKingCastle],
				[1, 3, configs.flags.whiteQueenCastle],
			]);

			boardService.makeMoveXY(1, 1, 1, 2);
			boardService.makeMoveXY(1, 2, 1, 1);

			expect(moveService._kingMoves(1, 5)).toEqual([
				[1, 6],
				[1, 4],
				[1, 7, configs.flags.whiteKingCastle],
			]);

			boardService.makeMoveXY(1, 8, 1, 7);
			boardService.makeMoveXY(1, 7, 1, 8);

			expect(moveService._kingMoves(1, 5)).toEqual([
				[1, 6],
				[1, 4],
			]);
		});

		test('FEN 6', function () {
			boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(1, 5)).toEqual([
				[1, 6],
				[1, 4],
				[1, 7, configs.flags.whiteKingCastle],
				[1, 3, configs.flags.whiteQueenCastle],
			]);

			boardService.makeMoveXY(1, 5, 1, 6);
			boardService.makeMoveXY(1, 6, 1, 5);

			expect(moveService._kingMoves(1, 5)).toEqual([
				[1, 6],
				[1, 4],
			]);
		});

		test('FEN 7', function () {
			boardService.parseFEN('4k3/8/8/8/8/8/8/4K2R w K - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._kingMoves(1, 5)).toEqual([
				[2, 5],
				[1, 6],
				[2, 4],
				[1, 4],
				[2, 6],
				[1, 7, configs.flags.whiteKingCastle],
			]);

			expect(moveService._kingMoves(8, 5)).toEqual([
				[8, 6],
				[7, 5],
				[8, 4],
				[7, 4],
				[7, 6],
			]);
		});
	});

	describe('_rookMoves function - ', function () {
		test('FEN 1', function () {
			boardService.parseFEN('4k3/8/8/8/8/8/8/4K2R w K - 0 1');
			moveService.setBoardModel(boardService.getBoard());
			expect(moveService._rookMoves(1, 8)).toEqual([
				[2, 8],
				[3, 8],
				[4, 8],
				[5, 8],
				[6, 8],
				[7, 8],
				[8, 8],
				[1, 7],
				[1, 6],
			]);
		});
	});

	describe('_pawnMoves function - ', function () {
		test('en passant move', function () {
			boardService.parseFEN('8/6bb/8/8/R1p3k1/4P3/P2P4/K7 w - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			boardService.makeMoveXY(2, 4, 4, 4);
			boardService.switchColor();

			expect(moveService._pawnMoves(4, 3)).toEqual([
				[3, 3],
				[3, 4, configs.flags.enPassant],
			]);
		});

		test('en passant move black', function () {
			boardService.parseFEN('8/1R6/8/5pPp/5K1k/5P2/8/8 w - h6 0 43');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(5, 7)).toEqual([
				[6, 7],
				[6, 8, configs.flags.enPassant],
			]);
		});

		test('en passant move white', function () {
			boardService.parseFEN('8/k/8/5pP1/8/8/K/8 b - g4 0 43');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(5, 6)).toEqual([
				[4, 6],
				[4, 7, configs.flags.enPassant],
			]);
		});

		test('double en passant move', function () {
			boardService.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			boardService.makeMoveXY(2, 2, 4, 2);

			expect(moveService._pawnMoves(4, 1)).toEqual([[3, 2, configs.flags.enPassant]]);

			expect(moveService._pawnMoves(4, 3)).toEqual([[3, 2, configs.flags.enPassant]]);
		});

		test('black promotion', function () {
			boardService.parseFEN('8/6k1/8/6N1/Pp1rp3/2RP1N2/3Kp3/1r6 b - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(2, 5)).toEqual([
				[1, 5, 'promotion', 11],
				[1, 5, 'promotion', 8],
				[1, 5, 'promotion', 9],
				[1, 5, 'promotion', 10],
			]);
		});

		test('white promotion', function () {
			boardService.parseFEN('8/2P3k1/8/6N1/Pp1rp3/2RP1N2/3Kp3/1r6 b - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(7, 3)).toEqual([
				[8, 3, 'promotion', 5],
				[8, 3, 'promotion', 2],
				[8, 3, 'promotion', 3],
				[8, 3, 'promotion', 4],
			]);
		});

		test('capture', function () {
			boardService.parseFEN('8/2P3k1/8/6N1/Ppp1p3/2RP1N2/3Kp3/1r6 w - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(3, 4)).toEqual([
				[4, 5],
				[4, 3],
				[4, 4],
			]);

			expect(moveService._pawnMoves(4, 3)).toEqual([[3, 4]]);

			expect(moveService._pawnMoves(4, 5)).toEqual([
				[3, 6],
				[3, 4],
				[3, 5],
			]);
		});

		test('capture and promote', function () {
			boardService.parseFEN('8/k7/8/7K/8/8/p7/BN6 b - - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(2, 1)).toEqual([
				[1, 2, 'promotion', 11],
				[1, 2, 'promotion', 8],
				[1, 2, 'promotion', 9],
				[1, 2, 'promotion', 10],
			]);
		});

		test('move', function () {
			boardService.parseFEN('r1b1k2r/ppppqppp/2nb1n2/1N2p3/4P3/3PBN2/PPP2PPP/R2QKB1R b KQkq - 0 1');
			moveService.setBoardModel(boardService.getBoard());

			expect(moveService._pawnMoves(2, 2)).toEqual([
				[3, 2],
				[4, 2],
			]);
			expect(moveService._pawnMoves(3, 4)).toEqual([[4, 4]]);
			expect(moveService._pawnMoves(7, 2)).toEqual([[6, 2]]);
			expect(moveService._pawnMoves(7, 3)).toEqual([]);
		});
	});

	describe('perft test', function () {
		const depth = 2;
		const perft = function (depth) {
			let moves;

			if (depth === 0) {
				return 1;
			}

			if (depth === 1) {
				return boardService.generateAllValidMoves(boardService.getBoard().getColor()).length;
			}

			moves = boardService.generateAllMoves(boardService.getBoard().getColor());
			let index;
			let leafNodes = 0;

			for (index = 0; index < moves.length; ++index) {
				if (boardService.makeMove(moves[index])) {
					boardService.switchColor();
					leafNodes += perft(depth - 1);
					boardService.rollbackMove();
				}
			}

			return leafNodes;
		};
		//http://marcelk.net/rookie/nostalgia/v3/perft-random.epd
		const perftTests = [
			{
				fen: configs.fen.startingString,
				depth1: 20,
				depth2: 400,
				depth3: 8902,
				depth4: 197281,
				depth5: 4865609,
				depth6: 119060324,
			},
			{
				fen: 'rnbqkbnr/pp1ppppp/2p5/8/6P1/2P5/PP1PPP1P/RNBQKBNR b KQkq - 0 1',
				depth1: 21,
				depth2: 463,
				depth3: 11138,
				depth4: 274234,
				depth5: 7290026,
				depth6: 195464529,
			},
			{
				fen: '5b2/8/8/Pk2p3/7p/1KP1Pr2/1Bn1b3/7N w - - 0 1',
				depth1: 10,
				depth2: 291,
				depth3: 2992,
				depth4: 90496,
				depth5: 1013174,
				depth6: 30909673,
			},
			{
				fen: '3b4/8/3k4/8/B1P1pN2/2K5/8/8 b - - 0 1',
				depth1: 12,
				depth2: 223,
				depth3: 2387,
				depth4: 43315,
				depth5: 514348,
				depth6: 9050627,
			},
			{
				fen: '3k4/8/8/2PBb3/4p3/2K1N3/8/8 w - - 0 1',
				depth1: 5,
				depth2: 90,
				depth3: 1950,
				depth4: 27716,
				depth5: 585553,
				depth6: 7814002,
			},
			{
				fen: 'rB5r/pp4k1/5n2/3qp1pp/Pb3p2/1P1P3b/R2QPPP1/1N2KBNR b K - 0 1',
				depth1: 60,
				depth2: 1513,
				depth3: 84307,
				depth4: 2325605,
				depth5: 121928751,
				depth6: 3626493565,
			},
			{
				fen: '8/6kN/8/6q1/Pp1rp3/2RP1N2/3Kp3/1r6 w - - 0 1',
				depth1: 4,
				depth2: 155,
				depth3: 2848,
				depth4: 103116,
				depth5: 1935527,
				depth6: 69634302,
			},
			{
				fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -',
				depth1: 48,
				depth2: 2038, //2039
				depth3: 97862,
				depth4: 4085603,
				depth5: 193690690,
				depth6: 8031647685,
			},
			{
				fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -',
				depth1: 14,
				depth2: 191,
				depth3: 2812,
				depth4: 43238,
				depth5: 674624,
				depth6: 11030083,
			},
			{
				fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
				depth1: 6,
				depth2: 258, //264
				depth3: 9467,
				depth4: 422333,
				depth5: 15833292,
				depth6: 706045033,
			},
			{
				fen: 'r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1',
				depth1: 6,
				depth2: 258, //264
				depth3: 9467,
				depth4: 422333,
				depth5: 15833292,
				depth6: 706045033,
			},
			{
				fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
				depth1: 44,
				depth2: 1486,
				depth3: 62379,
				depth4: 2103487,
				depth5: 89941194,
			},
			{
				fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
				depth1: 46,
				depth2: 2079,
				depth3: 89890,
				depth4: 3894594,
				depth5: 164075551,
			},
		];

		const perfTest = function (perftTest, index) {
			let indexB;
			test('FEN ' + index + ' - ' + perftTest.fen, function () {
				boardService.parseFEN(perftTest.fen);
				for (indexB = 1; indexB <= depth; indexB++) {
					expect(perft(indexB)).toBe(perftTest['depth' + indexB]);
				}
			});
		};
		let index;

		beforeEach(function () {
			configs.evaluationCacheEnabled = false;
		});

		for (index = 0; index < perftTests.length; index++) {
			perfTest(perftTests[index], index);
		}
	});
});
