const BoardService = require('../../src/services/board-service.js');
const PieceService = require('../../src/services/piece-service.js');
const configs = require('../../src/configurations');

describe('Piece Service', function () {
    'use strict';

    const boardService = BoardService;
    const pieceService = PieceService;

    beforeEach(function () {
        boardService.initBoard();
    });

    describe('pieceStage - ', function () {

        test('FEN 1 - starting fen', function () {
            boardService.parseFEN(configs.fen.startingString);
            const board = boardService.getBoard();

            expect(pieceService.pieceStage(configs.pieces.wP, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bP, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wN, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bN, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wR, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bR, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wQ, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bQ, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wK, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bK, board)).toBe(1);
        });

        test('FEN 2 - middle game fen', function () {
            boardService.parseFEN('3r1rk1/1bp1qppp/1p2pb/3n4/3P4/3QBN2/1P3PPP/1B1RR1K1 w - - 0 1');
            const board = boardService.getBoard();

            expect(pieceService.pieceStage(configs.pieces.wP, board)).toBe(1.94);
            expect(pieceService.pieceStage(configs.pieces.bP, board)).toBe(1.94);

            expect(pieceService.pieceStage(configs.pieces.wN, board)).toBe(0.92);
            expect(pieceService.pieceStage(configs.pieces.bN, board)).toBe(0.92);

            expect(pieceService.pieceStage(configs.pieces.wR, board)).toBe(1.1);
            expect(pieceService.pieceStage(configs.pieces.bR, board)).toBe(1.1);

            expect(pieceService.pieceStage(configs.pieces.wQ, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bQ, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wK, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bK, board)).toBe(1);
        });

        test('FEN 3 - end game fen', function () {
            boardService.parseFEN('7k/4Bp1p/8/8/8/8/8/2K3R1 w - - 0 1');
            const board = boardService.getBoard();

            expect(pieceService.pieceStage(configs.pieces.wP, board)).toBe(3.63);
            expect(pieceService.pieceStage(configs.pieces.bP, board)).toBe(3.63);

            expect(pieceService.pieceStage(configs.pieces.wN, board)).toBe(0.77);
            expect(pieceService.pieceStage(configs.pieces.bN, board)).toBe(0.77);

            expect(pieceService.pieceStage(configs.pieces.wR, board)).toBe(1.29);
            expect(pieceService.pieceStage(configs.pieces.bR, board)).toBe(1.29);

            expect(pieceService.pieceStage(configs.pieces.wQ, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bQ, board)).toBe(1);

            expect(pieceService.pieceStage(configs.pieces.wK, board)).toBe(1);
            expect(pieceService.pieceStage(configs.pieces.bK, board)).toBe(1);
        });

    });

    describe('pawnStage - ', function () {
        let board;

        test('FEN 1 - starting fen', function () {
            boardService.parseFEN(configs.fen.startingString);
            board = boardService.getBoard();
            expect(pieceService.pawnStage(board)).toBe(0);
        });

        test('FEN 2 - r1bqk2r/pppp1ppp/3b1n2/4p3/1n2P3/2NB1N2/PPPP1PPP/R1BQ1RK1 w kq - 0 10', function () {
            boardService.parseFEN('r1bqk2r/pppp1ppp/3b1n2/4p3/1n2P3/2NB1N2/PPPP1PPP/R1BQ1RK1 w kq - 0 10');
            board = boardService.getBoard();
            expect(pieceService.pawnStage(board)).toBe(0);
        });

        test('FEN 3 - 7k/4Bp1p/8/8/8/8/8/2K3R1 w - - 0 1', function () {
            boardService.parseFEN('7k/4Bp1p/8/8/8/8/8/2K3R1 w - - 0 1');
            board = boardService.getBoard();
            expect(pieceService.pawnStage(board)).toBe(0.875);
        });

        test('FEN 4 - 7k/4B3/8/8/8/8/8/2K3R1 w - - 0 1', function () {
            boardService.parseFEN('7k/4B3/8/8/8/8/8/2K3R1 w - - 0 1');
            board = boardService.getBoard();
            expect(pieceService.pawnStage(board)).toBe(1);
        });

    });

    describe('gameStage - ', function () {
        let board;

        test('FEN 1 - starting fen', function () {
            boardService.parseFEN(configs.fen.startingString);
            board = boardService.getBoard();
            expect(pieceService.gameStage(board)).toBe(0);
        });

        test('FEN 2 - r1bqk2r/pppp1ppp/3b1n2/4p3/1n2P3/2NB1N2/PPPP1PPP/R1BQ1RK1 w kq - 0 10', function () {
            boardService.parseFEN('r1bqk2r/pppp1ppp/3b1n2/4p3/1n2P3/2NB1N2/PPPP1PPP/R1BQ1RK1 w kq - 0 10');
            board = boardService.getBoard();
            expect(pieceService.gameStage(board)).toBe(0);
        });

        test('FEN 3 - 5rk1/1b2q1p1/1p2pb/3n4/3P4/3QBN2/1P4P1/1B1R2K1 w - - 0 1', function () {
            boardService.parseFEN('5rk1/1b2q1p1/1p2pb/3n4/3P4/3QBN2/1P4P1/1B1R2K1 w - - 0 1');
            board = boardService.getBoard();
            expect(pieceService.gameStage(board)).toBe(0.3109756097560976);
        });

        test('FEN 4 - 7k/4B3/8/8/8/8/8/2K3R1 w - - 0 1', function () {
            boardService.parseFEN('7k/4B3/8/8/8/8/8/2K3R1 w - - 0 1');
            board = boardService.getBoard();
            expect(pieceService.gameStage(board)).toBe(0.899390243902439);
        });
    });
});
