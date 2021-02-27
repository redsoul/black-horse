const engine = require('../engine.js');
const keys = require('lodash/keys');

engine.configs.loggingEnabled = false;

describe('Engine', function () {
	test('check exposed methods', () => {
		expect(keys(engine)).toEqual([
			'initBoard',
			'printBoard',
			'parseFEN',
			'getBoard',
			'getPieceValidMoves',
			'isCheckMate',
			'searchNextMove',
			'move',
			'getPieceSide',
			'configs',
		]);
	});

	test('integration test #1', () => {
		expect(engine.getBoard().fenString).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0');
		engine.initBoard();
		expect(engine.getBoard().fenString).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0');
		engine.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0');
		expect(engine.getBoard().fenString).toEqual('2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0');
		engine.initBoard();
		expect(engine.getBoard()).toMatchObject({
			fenString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0',
		});

		const validMoves = engine.getPieceValidMoves(2, 2);
		// console.log(validMoves);
		expect(validMoves).toMatchObject([
			{
				columnDest: 2,
				columnOrig: 2,
				rowDest: 3,
				rowOrig: 2,
				algebraicNotation: 'b3',
			},
			{
				columnDest: 2,
				columnOrig: 2,
				rowDest: 4,
				rowOrig: 2,
				algebraicNotation: 'b4',
			},
		]);
		engine.move(validMoves[0]);
		expect(engine.getBoard().fenString).toEqual('rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1');
	});

	test('integration test #2', () => {
		engine.initBoard();
		expect(engine.searchNextMove({ minDepth: 6 })).toMatchObject({
			columnDest: 5,
			columnOrig: 5,
			piece: 1,
			pieceDest: 0,
			promotedPiece: null,
			rowDest: 4,
			rowOrig: 2,
			score: 5,
			side: 0,
		});
		expect(engine.isCheckMate(0)).toBeFalsy();
	});

	test('integration test #3', () => {
		engine.parseFEN('7k/1R6/2Q5/8/8/8/8/7K w - - 0 1');
		const nextMove = engine.searchNextMove({ minDepth: 4 });
		const result = engine.move(nextMove);

		expect(result).toMatchObject({
			algebraicNotation: 'Qc8',
			board: expect.any(Object),
			isCheckMate: true,
		});
		expect(engine.isCheckMate(0)).toBeFalsy();
		expect(engine.isCheckMate(1)).toBeTruthy();
	});

	test('integration test #4', () => {
		engine.parseFEN('2Q4k/1R6/8/8/8/8/8/7K w - - 0 2');

		expect(engine.isCheckMate(0)).toBeFalsy();
		expect(engine.isCheckMate(1)).toBeTruthy();
	});

	test('integration test #5', () => {
		engine.initBoard();
		engine.move('d4');
		engine.move('d5');

		engine.move('Bf4');
		engine.move('c5');

		engine.move('e3');
		engine.move('nf6');

		engine.move('c3');
		engine.move('bf5');

		engine.move('Bd3');
		engine.move('bxd3');

		expect(engine.getBoard().fenString).toBe('rn1qkb1r/pp2pppp/5n2/2pp4/3P1B2/2PbP3/PP3PPP/RN1QK1NR w KQkq - 0 10');
	});
});
