const engine = require('../engine.js');
const keys = require('lodash/keys');

describe('Engine', function () {
    test('check exposed methods', () => {
        expect(keys(engine)).toEqual([
            "initBoard",
            "printBoard",
            "parseFEN",
            "getBoard",
            "getPieceValidMoves",
            "isCheckMate",
            "searchNextMove",
            "makeMove",
            "getPieceSide",
            "configs"
        ]);
    });

    test('integration test #1', () => {
        expect(engine.getBoard().fenString).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0");
        engine.initBoard();
        expect(engine.getBoard().fenString).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0");
        engine.parseFEN("2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0");
        expect(engine.getBoard().fenString).toEqual("2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0");
        engine.initBoard();
        expect(engine.getBoard()).toMatchObject({
            fenString: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"
        });

        const validMoves = engine.getPieceValidMoves(2, 2);
        // console.log(validMoves);
        expect(validMoves).toMatchObject(
            [{
                "columnDest": 2,
                "columnOrig": 2,
                "rowDest": 3,
                "rowOrig": 2
            }, {
                "columnDest": 2,
                "columnOrig": 2,
                "rowDest": 4,
                "rowOrig": 2
            }]
        );
        engine.makeMove(validMoves[0]);
        expect(engine.getBoard().fenString).toEqual("rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1");
    });

    test('integration test #2', () => {
        engine.initBoard();
        expect(engine.searchNextMove(10, 2)).toMatchObject(
            {
                "columnDest": 4,
                "columnOrig": 4,
                "piece": 1,
                "pieceDest": 0,
                "promotedPiece": null,
                "rowDest": 4,
                "rowOrig": 2,
                "score": 10,
                "side": 0
            }
        );
        expect(engine.isCheckMate(0)).toBeFalsy();
    });

    test('integration test #3', () => {
        engine.parseFEN("7k/1R6/2Q5/8/8/8/8/7K w - - 0 1");
        const nextMove = engine.searchNextMove(10, 2);
        engine.makeMove(nextMove);

        expect(engine.isCheckMate(0)).toBeFalsy();
        expect(engine.isCheckMate(1)).toBeTruthy();
    });
});