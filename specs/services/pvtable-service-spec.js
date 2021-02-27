const random = require('lodash/random');
const PvTableService = require('../../src/services/pvtable-service.js');

describe('Pvtable Service', function () {
	let pvtableService;
	const genRandomHash = function () {
		return Math.floor(Math.random() * 255 + 1) << 23;
	};
	const genRandomMoveObj = function () {
		return {
			rowOrig: random(1, 8),
			columnOrig: random(1, 8),
			rowDest: random(1, 8),
			columnDest: random(1, 8),
			score: 0,
			hash: genRandomHash(),
		};
	};

	beforeEach(function () {
		pvtableService = PvTableService;
	});

	describe('probeTable and storeMove method', function () {
		test('probe an empty table without hash', function () {
			expect(pvtableService.probeTable()).toBeFalsy();
		});

		test('probe an empty table with nonexistent hash', function () {
			expect(pvtableService.probeTable(genRandomHash())).toBeFalsy();
		});

		test('probe an empty table with existent hash', function () {
			const hash = genRandomHash();
			const obj = { move: null, hash: hash };

			pvtableService.storeMove(obj);

			expect(pvtableService.probeTable(genRandomHash())).toBeFalsy();
			expect(pvtableService.probeTable(hash)).toBe(obj);
		});
	});

	describe('promoteLastBestMove method', function () {
		const moves = [];

		describe('store moves', function () {
			beforeEach(function () {
				moves.push(genRandomMoveObj());
				moves.push(genRandomMoveObj());
				moves.push(genRandomMoveObj());
				moves.push(genRandomMoveObj());
				pvtableService.storeMove(moves[0]);
				pvtableService.storeMove(moves[1]);
				pvtableService.storeMove(moves[2]);
				pvtableService.storeMove(moves[3]);
			});

			test('promote a valid move', function () {
				expect(pvtableService.promoteLastBestMove(moves, moves[2].hash)).toBeTruthy();
				expect(moves[2].score).toBe(pvtableService.getPromotedScore());
			});

			test('promote a valid move with nonexisting hash', function () {
				expect(pvtableService.promoteLastBestMove(moves, genRandomHash())).toBeFalsy();
			});
		});

		test('promote a valid move but with no moves stored', function () {
			const move = genRandomMoveObj();

			expect(pvtableService.promoteLastBestMove([], move.hash)).toBeFalsy();
		});
	});
});
