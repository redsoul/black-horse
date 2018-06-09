const EvaluationService = require('../../source/services/evaluation-service.js');
const BoardService = require('../../source/services/board-service.js');
const SearchService = require('../../source/services/search-service.js');
const MoveService = require('../../source/services/move-service.js');
const configs = require('../../source/configurations');

describe('Evaluation Service', function () {
    const evaluationService = EvaluationService;
    const boardService = BoardService;
    const searchService = SearchService;
    const moveService = MoveService;
    let board;

    beforeEach(function () {
        boardService.initBoard();
    });

    describe('evaluatePiece function - ', function () {

        test('Pawns', function () {
            boardService.parseFEN(configs.fen.startingString);
            board = boardService.getBoard();

            expect(evaluationService.evaluatePiece(board, configs.pieces.wP, 2, 1)).toBe(10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wP, 2, 8)).toBe(10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wP, 2, 4)).toBe(-10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wP, 3, 4)).toBe(5);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wP, 4, 4)).toBe(20);

            expect(evaluationService.evaluatePiece(board, configs.pieces.bP, 7, 1)).toBe(10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bP, 7, 8)).toBe(10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bP, 7, 4)).toBe(-10);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bP, 6, 4)).toBe(5);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bP, 5, 4)).toBe(20);
        });

        test('King', function () {
            boardService.parseFEN(configs.fen.startingString);
            board = boardService.getBoard();

            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 1, 1)).toBe(0);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 8, 8)).toBe(-70);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 8, 1)).toBe(-70);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 1, 8)).toBe(5);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 4, 4)).toBe(-70);

            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 1, 1)).toBe(-70);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 8, 8)).toBe(5);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 8, 1)).toBe(0);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 1, 8)).toBe(-70);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 4, 4)).toBe(-70);
        });

        test('King - End game', function () {
            boardService.parseFEN('3k4/3P4/2PK4/8/8/6p1/8/8 w - - 0 1');
            board = boardService.getBoard();

            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 1, 1)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 8, 8)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 8, 1)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 1, 8)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.wK, 4, 4)).toBe(20);

            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 1, 1)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 8, 8)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 8, 1)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 1, 8)).toBe(-50);
            expect(evaluationService.evaluatePiece(board, configs.pieces.bK, 4, 4)).toBe(20);
        });
    });

    describe('evaluateBoard function - ', function () {
        test('checks white evaluation on initial board', function () {
            boardService.parseFEN(configs.fen.startingString);
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(0);
        });

        test('checks white evaluation after 1st white move', function () {
            boardService.parseFEN('rnbqkbnr/pppppppp/8/8/8/2N5/PPPPPPPP/R1BQKBNR b KQkq - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(-20);
        });

        test('checks white evaluation after 1st black move', function () {
            boardService.parseFEN('r1bqkbnr/pppppppp/2n5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(0);
        });

        test('checks black evaluation after 1st black move', function () {
            boardService.parseFEN('r1bqkbnr/pppppppp/2n5/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(0);
        });

        test('Middle game evaluation 1', function () {
            boardService.parseFEN('rnb1k2r/pppp1ppp/3b1n2/1N2p1q1/4P3/3B1Q2/PPPP1PPP/R1B1K1NR b KQkq - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(0);
        });

        test('End game evaluation 1', function () {
            boardService.parseFEN('3k4/3P4/2PK4/8/8/6p1/8/8 w - - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(394);
        });

        test('FEN 7', function () {
            boardService.parseFEN('rnb1k2r/pp1p1ppp/3p4/4p1q1/4n3/3B1Q2/PPPP1PPP/R1B1K1NR w KQkq - 0 1');
            expect(evaluationService.evaluateBoard(boardService.getBoard())).toBe(-42);
        });

        test('FEN 8', function () {
            boardService.parseFEN('rnb1k2r/pppp1ppp/3b1n2/1N2p1q1/4P3/3B1Q2/PPPP1PPP/R1B1K1NR b KQkq - 0 1');
            expect(boardService.makeMoveXY(6, 6, 4, 5)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();
            board = boardService.getBoard();
            expect(boardService.convertToFEN()).toBe('rnb1k2r/pppp1ppp/3b4/1N2p1q1/4n3/3B1Q2/PPPP1PPP/R1B1K1NR w KQkq - 0 2');
            expect(evaluationService.evaluateBoard(board)).toBe(-139);
        });

        test('FEN 9 - castling move', function () {
            boardService.parseFEN('rnbqk2r/p2p1ppp/2pb4/3Np3/2B1P3/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 1');

            expect(boardService.makeMoveXY(8, 5, 8, 7, configs.flags.blackKingCastle)).toEqual({
                enPassant: false,
                castle: [{kingSide: false, queenSide: false}, {kingSide: true, queenSide: false}]
            });
            boardService.switchSide();

            board = boardService.getBoard();
            expect(boardService.convertToFEN()).toBe('rnbq1rk1/p2p1ppp/2pb4/3Np3/2B1P3/5N2/PPPP1PPP/R1BQK2R w KQ - 0 2');
            expect(evaluationService.evaluateBoard(board)).toBe(648);
        });

        test('FEN 10 - en passant move', function () {
            boardService.parseFEN('2r3k1/1q1nbppp/r3p3/3pP3/pPpP4/P1Q2N2/2RN1PPP/2R4K w - b3 0 1');

            expect(boardService.makeMoveXY(4, 1, 3, 2, configs.flags.enPassant)).toEqual({
                enPassant: true,
                castle: [{kingSide: false, queenSide: false}, {kingSide: false, queenSide: false}]
            });
            boardService.switchSide();

            board = boardService.getBoard();
            expect(boardService.convertToFEN()).toBe('2r3k1/1q1nbppp/r3p3/3pP3/2pP4/PpQ2N2/2RN1PPP/2R4K b - - 0 2');
            expect(evaluationService.evaluateBoard(board)).toBe(227);
        });
    });

    describe('isMaterialDraw function - ', function () {
        test('Just the two Kings on the board', function () {
            boardService.parseFEN('k7/8/8/8/8/8/p7/K7 w - - 0 1');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(false);

            boardService.parseFEN('k7/8/8/8/8/8/8/K7 b - - 0 1');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(true);
        });

        test('King and Bishop against a King', function () {
            boardService.parseFEN('k7/8/4p3/8/8/8/B7/K7 w - - 0 1');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(false);

            boardService.parseFEN('k7/8/8/8/8/8/B7/K7 b - - 0 1');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(true);
        });

        test('King and Knight against a King', function () {
            boardService.parseFEN('k7/8/8/8/1p6/8/N7/K7 w - - 0 1');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(false);

            boardService.parseFEN('k7/8/8/8/1N6/8/8/K7 b - - 0 0');
            expect(evaluationService.isMaterialDraw(boardService.getBoard())).toBe(true);
        });

    });

    describe('_pawnsScore function - ', function () {
        test('FEN 1 - initial board', function () {
            boardService.parseFEN(configs.fen.startingString);
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.white)).toBe(0);
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.black)).toBe(0);
        });

        test('FEN 2 - after 1st white move', function () {
            boardService.parseFEN('rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.white)).toBe(-10);
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.black)).toBe(0);
        });

        test('FEN 3 - isolated pawns', function () {
            boardService.parseFEN('2k5/7p/2p3p1/8/5P2/3P3/8/5K2 w - - 0 1');
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.white)).toBe(-20);
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.black)).toBe(-10);
        });

        test('FEN 4 - step pawns', function () {
            boardService.parseFEN('2qk4/1p3n2/2p5/3p4/5P2/2N1P3/3P4/4QK2 w - - 0 1');
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.white)).toBe(0);
            expect(evaluationService._pawnsScore(boardService.getBoard(), configs.colors.black)).toBe(0);
        });

    });

    xdescribe('getEvaluatedScoresCount function - ', function () {
        var searchTime = 1000;

        beforeEach(function () {
            configs.evaluationCacheEnabled = true;
        });

        afterEach(function () {
            configs.evaluationCacheEnabled = false;
        });

        test('FEN 1', function () {
            boardService.parseFEN('7k/7p/8/8/8/8/7P/7K w - - 0 1');

            evaluationService.evaluateBoard(boardService.getBoard());
            expect(evaluationService.getEvaluatedScoresCount()).toBe(1);

            boardService.parseFEN('7k/7p/8/8/8/8/7P/7K b - - 0 1');

            evaluationService.evaluateBoard(boardService.getBoard());
            expect(evaluationService.getEvaluatedScoresCount()).toBe(1);

            boardService.parseFEN('7k/7p/8/8/8/8/7P/7K w - - 0 1');

            evaluationService.evaluateBoard(boardService.getBoard());
            expect(evaluationService.getEvaluatedScoresCount()).toBe(1);

            boardService.parseFEN('7k/6p1/8/8/8/8/7P/7K b - - 0 1');

            evaluationService.evaluateBoard(boardService.getBoard());
            expect(evaluationService.getEvaluatedScoresCount()).toBe(2);
        });

        test('FEN 2 - starting fen with 1 depth level', function () {
            boardService.initBoard();

            searchService.searchNextMove(searchTime, 1);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(20);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(0);
            expect(boardService.getBoard().side).toBe(configs.colors.white);

            searchService.searchNextMove(searchTime, 1);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(20);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(20);

            boardService.switchSide();
            searchService.searchNextMove(searchTime, 1);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(40);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(20);
        });

        test('FEN 3 - starting fen with 2 depth level', function () {
            boardService.initBoard();

            searchService.searchNextMove(searchTime, 2);
            //console.log(boardService.convertToFEN());
            expect(evaluationService.getEvaluatedScoresCount()).toBe(40);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(0);
            expect(moveService.getGeneratedMovesCount()).toBe(82);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(80);
            expect(moveService.getGeneratedMovesUses()).toBe(7);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(80);

            searchService.searchNextMove(searchTime, 2);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(40);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(40);
            expect(moveService.getGeneratedMovesCount()).toBe(82);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(80);
            expect(moveService.getGeneratedMovesUses()).toBe(55);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(200);

            boardService.switchSide();
            searchService.searchNextMove(searchTime, 2);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(83);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(41);
            expect(moveService.getGeneratedMovesCount()).toBe(168);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(168);
            expect(moveService.getGeneratedMovesUses()).toBe(57);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(288);
        });

        test('FEN 4 - pawn and king against pawn and king - depth 1', function () {
            boardService.parseFEN('k7/p7/8/8/8/8/P7/K7 w - - 0 1');
            //boardService.printBoard();
            searchService.searchNextMove(searchTime, 1);

            expect(evaluationService.getEvaluatedScoresCount()).toBe(8);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(0);
            expect(moveService.getGeneratedMovesCount()).toBe(18);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(16);
            expect(moveService.getGeneratedMovesUses()).toBe(4);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(16);

            searchService.searchNextMove(searchTime, 1);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(8);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(8);
            expect(moveService.getGeneratedMovesCount()).toBe(18);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(16);
            expect(moveService.getGeneratedMovesUses()).toBe(17);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(40);

            boardService.switchSide();
            searchService.searchNextMove(searchTime, 1);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(15);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(9);
            expect(moveService.getGeneratedMovesCount()).toBe(36);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(32);
            expect(moveService.getGeneratedMovesUses()).toBe(19);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(56);
        });

        test('FEN 5 - pawn and king against pawn and king - depth 2', function () {
            boardService.parseFEN('k7/p7/8/8/8/8/P7/K7 w - - 0 1');
            //boardService.printBoard();
            searchService.searchNextMove(searchTime, 2);

            expect(evaluationService.getEvaluatedScoresCount()).toBe(23);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(8);
            expect(moveService.getGeneratedMovesCount()).toBe(18);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(52);
            expect(moveService.getGeneratedMovesUses()).toBe(12);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(60);

            searchService.searchNextMove(searchTime, 2);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(23);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(39);
            expect(moveService.getGeneratedMovesCount()).toBe(18);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(52);
            expect(moveService.getGeneratedMovesUses()).toBe(33);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(146);

            boardService.switchSide();
            searchService.searchNextMove(searchTime, 2);
            expect(evaluationService.getEvaluatedScoresCount()).toBe(56);
            expect(evaluationService.getEvaluatedScoresUses()).toBe(67);
            expect(moveService.getGeneratedMovesCount()).toBe(56);
            // expect(moveService.getGeneratedAttackMovesCount()).toBe(136);
            expect(moveService.getGeneratedMovesUses()).toBe(45);
            // expect(moveService.getGeneratedAttackMovesUses()).toBe(258);
        });

    });

    describe('_calculateMaterialScore function - ', function () {
        test('FEN 1 - initial board', function () {
            var scores;

            boardService.parseFEN(configs.fen.startingString);
            scores = evaluationService._calculateMaterialScore(boardService.getBoard());

            expect(scores.length).toBe(2);
            expect(scores[configs.colors.white]).toBe(54100);
            expect(scores[configs.colors.black]).toBe(54100);
        });
    });

    describe('_castlingScore function - ', function () {

        test('FEN 1 - starting fen', function () {
            var board;

            boardService.parseFEN(configs.fen.startingString);
            board = boardService.getBoard();
            expect(evaluationService._castlingScore(board, configs.colors.white)).toBe(0);
            expect(evaluationService._castlingScore(board, configs.colors.black)).toBe(0);
        });

        test('FEN 2 - middle game fen', function () {
            boardService.parseFEN('3r1rk1/1bp1qppp/1p2pb/3n4/3P4/3QBN2/1P3PPP/1B1RR1K1 w - - 0 1');
            var board = boardService.getBoard();
            expect(evaluationService._castlingScore(board, configs.colors.white)).toBe(-137);
            expect(evaluationService._castlingScore(board, configs.colors.black)).toBe(-137);
        });

        test('FEN 3 - end game fen', function () {
            boardService.parseFEN('7k/4Bp1p/8/8/8/8/8/2K3R1 w - - 0 1');
            var board = boardService.getBoard();
            expect(evaluationService._castlingScore(board, configs.colors.white)).toBe(-26);
            expect(evaluationService._castlingScore(board, configs.colors.black)).toBe(-26);
        });

    });

});
