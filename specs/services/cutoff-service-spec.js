const random = require('lodash/random');
const CutoffService = require('../../source/services/cutoff-service.js');

describe('Cutoff Service', function () {
    const genRandomHash = function () {
        return (Math.floor((Math.random() * 255) + 1) << 23);
    };
    const genRandomMoveObj = function () {
        return {
            rowOrig: random(1, 8),
            columnOrig: random(1, 8),
            rowDest: random(1, 8),
            columnDest: random(1, 8),
            score: 0,
            hash: genRandomHash()
        };
    };
    const moves = [];

    beforeEach(function () {
        moves.push(genRandomMoveObj());
        moves.push(genRandomMoveObj());
        moves.push(genRandomMoveObj());
        moves.push(genRandomMoveObj());
        moves.push(genRandomMoveObj());
    });

    test('storeAlphaMove and promoteAlphaMoves method', function () {
        CutoffService.reset(2);
        CutoffService.storeAlphaMove(moves[2], 1);
        CutoffService.storeAlphaMove(moves[4], 1);
        CutoffService.promoteAlphaMoves(moves, 1);

        expect(moves[2].score).toBe(CutoffService.getAlphaMovesScore());
        expect(moves[4].score).toBe(CutoffService.getAlphaMovesScore());
    });

    test('storeBetaMove and promoteBetaMoves method', function () {
        CutoffService.reset(2);
        CutoffService.storeBetaMove(moves[2], 1);
        CutoffService.storeBetaMove(moves[4], 1);
        CutoffService.promoteBetaMoves(moves, 1);

        expect(moves[2].score).toBe(CutoffService.getBetaMovesScore());
        expect(moves[4].score).toBe(CutoffService.getBetaMovesScore());
    });
});
