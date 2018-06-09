const BoardService = require('../../source/services/board-service.js');
const configs = require('../../source/configurations');

describe('BoardService', function () {
    'use strict';

    const boardService = BoardService;

    beforeEach(function () {
        boardService.initBoard();
    });

    describe('parseFEN and convertToFEN functions -', function () {
        test('Starting FEN', function () {
            boardService.parseFEN(configs.fen.startingString);
            expect(boardService.convertToFEN()).toBe(configs.fen.startingString);
        });

        test('FEN 2', function () {
            const fen = '2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0';

            boardService.parseFEN(fen);
            expect(boardService.getBoard().getSide()).toBe(configs.colors.black);
            expect(boardService.convertToFEN()).toBe(fen);

            boardService.makeMoveXY(2, 2, 4, 2);
            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/pPpP4/P1Q2N2/2RN1PPP/2R4K b - b3 0 1');
        });

        test('FEN 3', function () {
            boardService.parseFEN('8/6bb/8/8/R1p3k1/4P3/P2P4/K7 b - - 0 1');
            boardService.makeMoveXY(2, 4, 4, 4);

            expect(boardService.convertToFEN()).toBe('8/6bb/8/8/R1pP2k1/4P3/P7/K7 b - d3 0 2');
        });

        test('FEN 4', function () {
            boardService.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/pPpP4/P1Q2N2/2RN1PPP/2R4K b - b3 0 1');
            const enPas = boardService.getBoard().getEnPassantPosition();

            expect(enPas[0]).toBe(4);
            expect(enPas[1]).toBe(2);
        });

        test('FEN 5', function () {
            boardService.parseFEN('8/6bb/8/8/R1pP2k1/4P3/P7/K7 b - d3 0 1');
            const enPas = boardService.getBoard().getEnPassantPosition();

            expect(enPas[0]).toBe(4);
            expect(enPas[1]).toBe(4);
        });

        test('FEN 6', function () {
            boardService.parseFEN(configs.fen.startingString);

            boardService.makeMoveXY(2, 2, 4, 2);
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq b3 0 1');

            boardService.makeMoveXY(7, 2, 5, 2);
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/p1pppppp/8/1p6/1P6/8/P1PPPPPP/RNBQKBNR w KQkq b6 0 2');

            boardService.makeMoveXY(2, 3, 4, 3);
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/p1pppppp/8/1p6/1PP5/8/P2PPPPP/RNBQKBNR b KQkq c3 0 3');

            boardService.makeMoveXY(7, 3, 5, 3);
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/p2ppppp/8/1pp5/1PP5/8/P2PPPPP/RNBQKBNR w KQkq c6 0 4');
        });

        test('FEN 7 - fullMoveCounter check', function(){
            boardService.parseFEN('rnbqkbnr/p1pppppp/8/1p6/1P6/8/P1PPPPPP/RNBQKBNR w KQkq b6 1 2');
            expect(boardService.getBoard().getFiftyMoveCounter()).toBe(1);
            expect(boardService.getBoard().getFullMoveCounter()).toBe(2);

            boardService.parseFEN('rnbqkbnr/p1pppppp/8/1p6/1P6/8/P1PPPPPP/RNBQKBNR w KQkq b6 5 10');
            expect(boardService.getBoard().getFiftyMoveCounter()).toBe(5);
            expect(boardService.getBoard().getFullMoveCounter()).toBe(10);

            boardService.parseFEN('rnbqkbnr/p1pppppp/8/1p6/1P6/8/P1PPPPPP/RNBQKBNR w KQkq b6 15 25');
            expect(boardService.getBoard().getFiftyMoveCounter()).toBe(15);
            expect(boardService.getBoard().getFullMoveCounter()).toBe(25);
        });
    });

    describe('generateAllCaptureMoves function -', function () {
        test('King and 2 Pawns against King and Pawn', function () {
            boardService.parseFEN('3k4/3P4/2PK4/8/8/6p1/8/8 w - - 0 1');
            let captureMoves = boardService.generateAllCaptureMoves(configs.colors.white);
            expect(captureMoves.length).toEqual(0);
            captureMoves = boardService.generateAllCaptureMoves(configs.colors.black);
            expect(captureMoves.length).toEqual(1);
        });

        test('FEN 2', function () {
            boardService.parseFEN('rn1qkbnr/p4ppp/2p1b3/1Q2p3/2p1P3/3B3P/PP1P1PP1/RNB1K1NR w KQkq - 0 1');
            let captureMoves = boardService.generateAllCaptureMoves(configs.colors.white);
            expect(captureMoves.length).toEqual(5);
            captureMoves = boardService.generateAllCaptureMoves(configs.colors.black);
            expect(captureMoves.length).toEqual(4);
        });
    });

    describe('generateAllValidMoves function -', function () {
        test('FEN 1 - starting FEN', function () {
            let captureMoves;

            boardService.parseFEN(configs.fen.startingString);

            captureMoves = boardService.generateAllValidMoves(configs.colors.white);
            expect(captureMoves.length).toEqual(20);
            captureMoves = boardService.generateAllValidMoves(configs.colors.black);
            expect(captureMoves.length).toEqual(20);
        });

        test('FEN 2', function () {
            let captureMoves;

            boardService.parseFEN('8/6kN/8/6q1/Pp1rp3/2RP1N2/3Kp3/1r6 w - - 0 1');

            captureMoves = boardService.generateAllValidMoves(configs.colors.white);
            expect(captureMoves.length).toEqual(4);
            captureMoves = boardService.generateAllValidMoves(configs.colors.black);
            expect(captureMoves.length).toEqual(50);
        });

        test('FEN 3', function () {
            let captureMoves;

            boardService.parseFEN('7k/1Q6/1R6/8/8/8/8/7K w - - 0 1');

            captureMoves = boardService.generateAllValidMoves(configs.colors.white);
            expect(captureMoves.length).toEqual(31);

            captureMoves = boardService.generateAllValidMoves(configs.colors.black);
            expect(captureMoves.length).toEqual(1);
        });
    });

    describe('makeMove / rollbackMove function -', function () {
        test('FEN 1', function () {
            const initFen = 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 0';
            let initHash;

            boardService.parseFEN(initFen);
            initHash = boardService.getBoard().hash;
            expect(boardService.makeMoveXY(2, 7, 4, 7)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR w KQkq g3 0 1');

            boardService.rollbackMove();
            expect(boardService.convertToFEN()).toBe(initFen);
            expect(boardService.getBoard().hash).toBe(initHash);
        });

        test('FEN 2', function () {
            boardService.parseFEN('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1');
            expect(boardService.makeMoveXY(8, 4, 4, 8)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            expect(boardService.convertToFEN()).toBe('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2');
        });

        test('FEN 3', function () {
            const fen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 0';
            boardService.parseFEN(fen);
            expect(boardService.makeMoveXY(2, 8, 3, 8)).toBe(false);
            expect(boardService.convertToFEN()).toBe(fen);

            expect(boardService.makeMoveXY(1, 7, 3, 8)).toBe(false);
            expect(boardService.convertToFEN()).toBe(fen);
        });

        test('FEN 4', function () {
            boardService.parseFEN('1k6/ppp5/8/8/8/8/5R2/7K w - - 0 0');
            expect(boardService.makeMoveXY(2, 6, 8, 6)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            expect(boardService.convertToFEN()).toBe('1k3R2/ppp5/8/8/8/8/8/7K w - - 0 1');
        });

        test('FEN 5 - castling move king side', function () {
            boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 0');
            expect(boardService.makeMoveXY(1, 5, 1, 7)).toEqual({
                enPassant: false,
                castle: [{kingSide: true, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            expect(boardService.convertToFEN()).toBe('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1 w kq - 0 1');
        });

        test('FEN 6 - castling move queen side', function () {
            boardService.parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
            expect(boardService.makeMoveXY(1, 5, 1, 3)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: true}, {kingSide: false, queenSide: false}]
            });
            expect(boardService.convertToFEN()).toBe('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/2KR3R w kq - 0 2');
        });

        test('FEN 7 - promotion white side', function () {
            boardService.parseFEN('8/P7/8/k7/8/8/8/K7 w - - 0 1');
            expect(boardService.makeMoveXY(7, 1, 8, 1)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}],
                promotion: true
            });
            expect(boardService.convertToFEN()).toBe('Q7/8/8/k7/8/8/8/K7 w - - 0 2');
        });

        test('FEN 8 - promotion black side', function () {
            boardService.parseFEN('8/k7/8/7K/8/8/p7/8 b - - 0 1');
            expect(boardService.makeMoveXY(2, 1, 1, 1)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}],
                promotion: true
            });
            expect(boardService.convertToFEN()).toBe('8/k7/8/7K/8/8/8/q7 b - - 0 2');
        });

        test('FEN 9 - capturing and promote', function () {
            boardService.parseFEN('8/k7/8/7K/8/8/p7/1N6 b - - 0 1');
            expect(boardService.makeMoveXY(2, 1, 1, 2)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}],
                promotion: true
            });
            expect(boardService.convertToFEN()).toBe('8/k7/8/7K/8/8/8/1q6 b - - 0 2');
        });

        test('FEN 10 - en passant move', function () {
            boardService.parseFEN('8/6bb/8/8/R1p32/4P2k/P2P4/K7 b - - 0 0');
            expect(boardService.makeMoveXY(2, 4, 4, 4)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('8/6bb/8/8/R1pP4/4P2k/P7/K7 w - d3 0 1');
            expect(boardService.makeMoveXY(4, 3, 3, 4, configs.flags.enPassant)).toEqual({
                enPassant: true,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('8/6bb/8/8/R7/3pP2k/P7/K7 b - - 0 2');
        });

        test('FEN 11 - double en passant move', function () {
            boardService.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0');
            expect(boardService.makeMoveXY(2, 2, 4, 2)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/pPpP4/P1Q2N2/2RN1PPP/2R4K w - b3 0 1');
            expect(boardService.makeMoveXY(4, 1, 3, 2, configs.flags.enPassant)).toEqual({
                enPassant: true,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/2pP4/PpQ2N2/2RN1PPP/2R4K b - - 0 2');
        });

        test('FEN 12 - piece movement while king is in check', function () {
            boardService.parseFEN('r1bqkb1r/ppp2ppp/5n2/3P4/3p4/2NB4/PPPPQPPP/R1B1K2R b KQkq - 0 1');
            //console.log(boardService.getBoard().getKingPosition(configs.colors.black));
            //console.log(boardService.getBoard().getKingPosition(configs.colors.white));
            expect(boardService.isPieceAttacked(8, 5)).toBeTruthy();
            expect(boardService.makeMoveXY(8, 4, 5, 4)).toBeFalsy();
        });

        test('FEN 13 - board model piece list', function () {
            const initFen = 'rnb1k2r/pppp1ppp/3b4/1N2p1q1/4n3/3B1Q2/PPPP1PPP/R1B1K1NR w KQkq - 0 0';
            let initHash;

            boardService.parseFEN(initFen);
            initHash = boardService.getBoard().hash;

            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([11, 13, 15, 17, 18, 21, 22, 23, 24, 26, 27, 28, 34, 36, 52]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([45, 55, 57, 64, 71, 72, 73, 74, 76, 77, 78, 81, 82, 83, 85, 88]);

            expect(boardService.makeMoveXY(5, 2, 6, 4)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();

            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([11, 13, 15, 17, 18, 21, 22, 23, 24, 26, 27, 28, 34, 36, 64]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([45, 55, 57, 71, 72, 73, 74, 76, 77, 78, 81, 82, 83, 85, 88]);

            expect(boardService.convertToFEN()).toBe('rnb1k2r/pppp1ppp/3N4/4p1q1/4n3/3B1Q2/PPPP1PPP/R1B1K1NR b KQkq - 0 1');

            boardService.rollbackMove();
            expect(boardService.convertToFEN()).toBe(initFen);
            expect(boardService.getBoard().hash).toBe(initHash);
        });

        test('FEN 14 - board model piece list after castling move', function () {
            const initFen = 'rnbqk2r/p2p1ppp/2pb4/3Np3/2B1P3/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 0';
            let initHash;

            boardService.parseFEN(initFen);
            initHash = boardService.getBoard().hash;

            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([11, 13, 14, 15, 18, 21, 22, 23, 24, 26, 27, 28, 36, 43, 45, 54]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([55, 63, 64, 71, 74, 76, 77, 78, 81, 82, 83, 84, 85, 88]);

            expect(boardService.makeMoveXY(8, 5, 8, 7, configs.flags.blackKingCastle)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: true, queenSide: false}]
            });
            boardService.switchSide();

            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([11, 13, 14, 15, 18, 21, 22, 23, 24, 26, 27, 28, 36, 43, 45, 54]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([55, 63, 64, 71, 74, 76, 77, 78, 81, 82, 83, 84, 86, 87]);

            expect(boardService.convertToFEN()).toBe('rnbq1rk1/p2p1ppp/2pb4/3Np3/2B1P3/5N2/PPPP1PPP/R1BQK2R w KQ - 0 1');

            boardService.rollbackMove();
            expect(boardService.convertToFEN()).toBe(initFen);
            expect(boardService.getBoard().hash).toBe(initHash);
        });

        test('FEN 15 - board model piece list after en passant move', function () {
            boardService.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0');
            expect(boardService.makeMoveXY(2, 2, 4, 2)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();

            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/pPpP4/P1Q2N2/2RN1PPP/2R4K w - b3 0 1');
            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([13, 18, 23, 24, 26, 27, 28, 31, 33, 36, 42, 44, 55]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([41, 43, 54, 61, 65, 72, 74, 75, 76, 77, 78, 83, 87]);

            expect(boardService.makeMoveXY(4, 1, 3, 2, configs.flags.enPassant)).toEqual({
                enPassant: true,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/2pP4/PpQ2N2/2RN1PPP/2R4K b - - 0 2');

            expect(boardService.getBoard().getPieceList(configs.colors.white).keys()).toEqual([13, 18, 23, 24, 26, 27, 28, 31, 33, 36, 44, 55]);
            expect(boardService.getBoard().getPieceList(configs.colors.black).keys()).toEqual([32, 43, 54, 61, 65, 72, 74, 75, 76, 77, 78, 83, 87]);
        });

        test('FEN 16 - Invalid Move', function () {
            boardService.parseFEN('8/k7/8/7K/8/8/p7/8 b - - 0 1');
            expect(boardService.makeMove()).toBeFalsy();
            expect(boardService.makeMove({})).toBeFalsy();
        });

        test('FEN 17 - Move and auto-rollback after king check', function () {
            boardService.parseFEN('8/6bb/8/8/R1pP2k1/4P3/P7/K7 b - d3 0 0');
            expect(boardService.makeMoveXY(4, 3, 3, 4)).toBeFalsy();
            expect(boardService.convertToFEN()).toBe('8/6bb/8/8/R1pP2k1/4P3/P7/K7 b - d3 0 0');
        });

        test('FEN 18 - Check fullMoveCounter', function () {
            boardService.initBoard();
            expect(boardService.getBoard().getFullMoveCounter()).toBe(0);
            expect(boardService.moveAndSwitch(2, 2, 4, 2)).toBeTruthy();
            expect(boardService.getBoard().getFullMoveCounter()).toBe(1);
            expect(boardService.moveAndSwitch(7, 2, 5, 2)).toBeTruthy();
            expect(boardService.getBoard().getFullMoveCounter()).toBe(2);
            expect(boardService.moveAndSwitch(2, 6, 4, 6)).toBeTruthy();
            expect(boardService.getBoard().getFullMoveCounter()).toBe(3);
            expect(boardService.convertToFEN()).toBe('rnbqkbnr/p1pppppp/8/1p6/1P3P2/8/P1PPP1PP/RNBQKBNR b KQkq f3 0 3');
        });

    });

    describe('getPieceMoves / getPieceValidMoves function - ', function () {
        test('FEN 1 - starting FEN', function () {
            boardService.parseFEN(configs.fen.startingString);
            expect(boardService.getPieceMoves(1, 2).length).toBe(2);
            expect(boardService.getPieceMoves(2, 2).length).toBe(2);
            expect(boardService.getPieceMoves(1, 1).length).toBe(0);
            expect(boardService.getPieceValidMoves(1, 1).length).toBe(0);
        });

        test('FEN 2', function () {
            boardService.parseFEN('8/6kN/8/6q1/Pp1rp3/2RP1N2/3Kp3/1r6 w - - 0 1');
            expect(boardService.getPieceMoves(5, 7).length).toBe(20);
            expect(boardService.getPieceMoves(7, 7).length).toBe(8);
            expect(boardService.getPieceMoves(1, 2).length).toBe(9);
            expect(boardService.getPieceMoves(2, 4).length).toBe(6);
            expect(boardService.getPieceMoves(7, 7).length).toBe(8);
            expect(boardService.getPieceValidMoves(7, 7).length).toBe(6);
            expect(boardService.getPieceMoves(2, 4).length).toBe(6);
            expect(boardService.getPieceValidMoves(2, 4).length).toBe(2);
        });

        test('FEN 3', function () {
            boardService.parseFEN('7k/1Q6/1R6/8/8/8/8/7K w - - 0 1');
            expect(boardService.getPieceMoves(7, 2).length).toBe(16);
            expect(boardService.getPieceMoves(6, 2).length).toBe(12);
            expect(boardService.getPieceMoves(1, 8).length).toBe(3);
            expect(boardService.getPieceValidMoves(1, 8).length).toBe(3);
            expect(boardService.getPieceMoves(8, 8).length).toBe(3);
            expect(boardService.getPieceValidMoves(8, 8).length).toBe(1);
        });
    });
});
