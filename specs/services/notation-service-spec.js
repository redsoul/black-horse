const NotationService = require('../../src/services/notation-service.js');
const MoveService = require('../../src/services/move-service.js');
const BoardService = require('../../src/services/board-service.js');
const configs = require('../../src/configurations');

const validateExpectedMoves = function (validMoves, expectedMoves) {
	expect(expectedMoves.length).toBe(validMoves.length);
	validMoves.forEach((validMove, index) => {
		const notation = NotationService.standartAlgebraicNotation(validMoves, validMove);
		expect(expectedMoves).toContain(notation);
	});
};

describe('NotationService', function () {
	describe('standartAlgebraicNotation function -', function () {
		test('Algebraic Notation on board initiation', function () {
			BoardService.initBoard();
			const board = BoardService.getBoard();
			let validMoves = MoveService.generateAllMoves(board, configs.colors.white);
			let expectedMoves = [
				'd4',
				'e4',
				'Nc3',
				'Nf3',
				'd3',
				'e3',
				'Na3',
				'Nh3',
				'c4',
				'f4',
				'c3',
				'f3',
				'a3',
				'h3',
				'a4',
				'b3',
				'b4',
				'g3',
				'g4',
				'h4',
			];
			validateExpectedMoves(validMoves, expectedMoves);

			validMoves = MoveService.generateAllMoves(board, configs.colors.black);
			expectedMoves = [
				'd5',
				'e5',
				'nc6',
				'nf6',
				'd6',
				'e6',
				'c5',
				'f5',
				'na6',
				'nh6',
				'c6',
				'f6',
				'a6',
				'h6',
				'a5',
				'b6',
				'b5',
				'g6',
				'g5',
				'h5',
			];
			validateExpectedMoves(validMoves, expectedMoves);
		});

		test('Ambiguous moves #1', function () {
			BoardService.parseFEN('7r1/r6p/pk6/3p1p2/4P3/8/P6P/R3K2R b KQkq - 0 1');
			const board = BoardService.getBoard();
			const validMoves = MoveService.generateAllMoves(board, configs.colors.black);

			const expectedMoves = [
				'dxe4',
				'fxe4',
				'kb7',
				'kc7',
				'rd7',
				're7',
				're8',
				'rd8',
				'rc7',
				'rf7',
				'rf8',
				'rc8',
				'kc6',
				'raa8',
				'rb7',
				'rg7',
				'rg8',
				'rb8',
				'rha8',
				'f4',
				'a5',
				'h6',
				'd4',
				'h5',
				'kb5',
				'ka5',
				'kc5',
			];
			validateExpectedMoves(validMoves, expectedMoves);
		});

		test('Ambiguous moves #2', function () {
			BoardService.parseFEN('7r1/r4P1p/pk6/3p1pP1/4P3/8/P6P/R3K2R w KQkq f6 0 1');
			const board = BoardService.getBoard();
			const validMoves = MoveService.generateAllMoves(board, configs.colors.white);
			const expectedMoves = [
				'exf5',
				'exd5',
				'gxf6 e.p.',
				'0-0',
				'0-0-0',
				'Rd1',
				'Kf1',
				'Rc1',
				'Rf1',
				'g6',
				'Rb1',
				'Kd1',
				'Rg1',
				'a3',
				'h3',
				'a4',
				'h4',
				'e5',
				'Ke2',
				'Kd2',
				'Kf2',
				'f8=Q',
				'f8=N',
				'f8=B',
				'f8=R',
			];
			validateExpectedMoves(validMoves, expectedMoves);
		});
	});
});
