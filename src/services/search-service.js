const BoardService = require('./board-service.js');
const EvaluationService = require('./evaluation-service.js');
const PieceService = require('./piece-service.js');
const PvTableService = require('./pvtable-service.js');
const MoveService = require('./move-service.js');
const CutoffService = require('./cutoff-service.js');
const NotationService = require('./notation-service.js');

const configs = require('../configurations');
const pad = require('lodash/pad');

class SearchService {
    constructor() {
        this.PieceService = PieceService;
        this.BoardService = BoardService;
        this.EvaluationService = EvaluationService;
        this.PvTableService = PvTableService;
        this.MoveService = MoveService;
        this.CutoffService = CutoffService;
        this.NotationService = NotationService;

        this.defaultSearchTime = 1000; //1 second
        this.maxDepth = 20;
        this.maxQuiescenceDepth = 5;
        this.maxDepthReached = 0;
        this.alphaBetaEvaluations = 0;
        this.quiescenceAttackEvaluations = 0;
        this.quiescenceCaptureEvaluations = 0;
        this.searchStart = null;
        this.searchTime = null;
        this.searchStop = false;
        this.searchNodes = 0;
        this.checkmateScore = this.PieceService.getStartingPieceValue(configs.pieces.wK);

        //for statistics only
        this.failHighFirst = 0;
        this.failHigh = 0;
    }

    _resetSearch() {
        this.searchStart = SearchService._now();
        this.alphaBetaEvaluations = 0;
        this.searchStop = false;
        this.failHighFirst = 0;
        this.failHigh = 0;
        this.searchNodes = 0;

        this.PvTableService.reset();
        this.CutoffService.reset(this.maxDepth);
    }

    static _now() {
        return (new Date()).getTime();
    }

    _checkUp() {
        if (this.alphaBetaEvaluations > 0 && (this.alphaBetaEvaluations % 100) === 0) {
            if ((SearchService._now() - this.searchStart) > this.searchTime) {
                this.searchStop = true;
            }

            if ((this.alphaBetaEvaluations % 2000) === 0) {
                const timeSoFar = (SearchService._now() - this.searchStart) / 1000;

                if (configs.loggingEnabled && configs.logLevel >= configs.logLevels.evaluation) {
                    console.log('Time elapsed: ', timeSoFar);
                    console.log('Evaluations per second: ', this.alphaBetaEvaluations / timeSoFar);
                    console.log('Saved evaluations uses: ', this.EvaluationService.getEvaluatedScoresUses());
                    console.log('Saved evaluations count: ', this.EvaluationService.getEvaluatedScoresCount());
                    console.log('-----------------------------');
                }
            }
        }
    }

    _evaluate(currentMove) {
        this.alphaBetaEvaluations += 1;
        return this.EvaluationService.evaluateBoard(this.BoardService.getBoard(), currentMove);
    }

    _quiescence(alpha, beta, quiescenceDepth, currentDepth, currentMove) {
        let board = this.BoardService.getBoard();
        const score = this._evaluate(currentMove);
        let captureMoves;
        let index;
        let move;
        let legalMoves = 0;
        let bestMove;
        let side;
        let oldAlpha;
        let movesLength;

        this.maxDepthReached = Math.max(this.maxDepthReached, currentDepth);

        this._checkUp();

        this.searchNodes += 1;

        if (currentDepth > this.maxDepth || quiescenceDepth > this.maxQuiescenceDepth) {
            return score;
        }

        if (score >= beta) {
            return beta;
        }

        if (score > alpha) {
            alpha = score;
        }

        oldAlpha = alpha;

        captureMoves = this.BoardService.generateAllCaptureMoves(board.getSide());
        if (captureMoves.length === 0) {
            return alpha;
        }

        //put the best move from the last iteration on top
        this.PvTableService.promoteLastBestMove(captureMoves, board.getHash());

        this.BoardService.switchSide();
        side = board.getSide();

        for (index = 0, movesLength = captureMoves.length; index < movesLength; index += 1) {
            this.BoardService.getBoard().setSide(side);
            board = this.BoardService.getBoard();
            move = this.MoveService.pickNextMove(captureMoves, index);

            if (!this.BoardService.makeMove(move)) {
                continue;
            }

            legalMoves += 1;
            if (!this.BoardService.isPieceAttacked(move.rowDest, move.columnDest)) {
                move.score = this._evaluate() * -1;
                this.quiescenceCaptureEvaluations += 1;
                this.searchNodes += 1;
            } else {
                move.score = -this._quiescence(-beta, -alpha, quiescenceDepth + 1, currentDepth + 1, move);
                this.quiescenceAttackEvaluations += 1;
            }
            this.BoardService.rollbackMove();

            //alpha cutoff
            if (move.score && move.score > alpha) {
                //beta cutoff
                if (move.score >= beta) {
                    if (legalMoves === 1) {
                        this.failHighFirst += 1;
                    }
                    this.failHigh += 1;

                    return beta;
                }

                alpha = move.score;
                bestMove = move;
            }
        }

        if (oldAlpha !== alpha) {
            this.PvTableService.storeMove(bestMove);
        }

        return alpha;
    }

    _alphaBeta(alpha, beta, depthLeft, currentDepth, currentMove) {
        let moves;
        let movesLength;
        let board = this.BoardService.getBoard();
        let index;
        let move;
        let legalMoves = 0;
        let side;
        let oldAlpha = alpha;
        let bestMove = false;
        let inCheck;

        if (depthLeft <= 0 || currentDepth > this.maxDepth) {
            return this._quiescence(alpha, beta, 1, currentDepth, currentMove);
        }

        this._checkUp();

        inCheck = this.BoardService.isPieceAttacked(board.getKingPosition(board.getSide()));
        if (inCheck) {
            depthLeft += 1;
        }
        this.searchNodes += 1;
        moves = this.BoardService.generateAllMoves(board.getSide());
// NotationService.printMoveArray(moves);
        //put the best move from the last iteration on top
        this.PvTableService.promoteLastBestMove(moves, board.getHash());
// NotationService.printMoveArray(moves);
        this.CutoffService.promoteBetaMoves(moves, currentDepth);
// NotationService.printMoveArray(moves);
        this.CutoffService.promoteAlphaMoves(moves, currentDepth);
// NotationService.printMoveArray(moves);

        this.BoardService.switchSide();

        side = board.getSide();
        for (index = 0, movesLength = moves.length; index < movesLength; index += 1) {
            this.BoardService.getBoard().setSide(side);
            board = this.BoardService.getBoard();
            move = this.MoveService.pickNextMove(moves, index);
// NotationService.printMove(move);
            if (!this.BoardService.makeMove(move)) {
                continue;
            }

            legalMoves += 1;
            move.score = -this._alphaBeta(-beta, -alpha, depthLeft - 1, currentDepth + 1, move);
// console.log('score: '+move.score);
            this.BoardService.rollbackMove();

            if (this.searchStop) {
                if (configs.loggingEnabled && configs.logLevel >= configs.logLevels.timeout) {
                    console.log('timeout, depth ' + currentDepth + ', ' + (movesLength - index + 1) + ' moves left');
                }

                return false;
            }

            //alpha cutoff
            if (move.score && move.score > alpha) {
                //beta cutoff
                if (move.score >= beta) {
                    if (legalMoves === 1) {
                        this.failHighFirst += 1;
                    }

                    this.failHigh += 1;
                    if (board.getPieceByRowColumn(move.rowDest, move.columnDest) === configs.pieces.empty) {
                        this.CutoffService.storeBetaMove(move, currentDepth);
                    }

                    return beta;
                }

                if (bestMove && board.getPieceByRowColumn(move.rowDest, move.columnDest) === configs.pieces.empty) {
                    this.CutoffService.storeAlphaMove(move, currentDepth);
                }

                alpha = move.score;
                bestMove = move;
            }
        }

        if (legalMoves === 0) {
            if (inCheck) {
                return -(this.checkmateScore + currentDepth - 1);
            } else {
                return 0;
            }
        }

        if (oldAlpha !== alpha) {
            this.PvTableService.storeMove(bestMove);
        }

        return alpha;
    }

    /**
     *
     * @param searchTime integer - in milli-seconds
     * @param depth integer - search depth > 0
     * @returns {*}
     */
    searchNextMove(searchTime = this.defaultSearchTime, depth = this.maxDepth) {
        let bestMove = null;
        let board = this.BoardService.getBoard();
        let side = board.getSide();
        let initHash = board.getHash();
        let currentDepth;
        let timeSoFar;
        let line = '';

        // NotationService.printBoard(board.get64Board());
        this.searchTime = searchTime * 1000;
        this._resetSearch();

        if (configs.loggingEnabled) {
            console.log(
                pad('Depth', 8) +
                pad('Best move', 12) +
                pad('Score', 8) +
                pad('Nodes', 8) +
                pad('Time elapsed', 15) +
                pad('Ordering', 8)
            );
        }

        // iterative deepening
        for (currentDepth = 1; currentDepth <= depth; currentDepth += 1) {
            // console.log('------------------------');
            // console.log('currentDepth: '+currentDepth);
            // console.log('------------------------');
            this._alphaBeta(-Number.MAX_VALUE, Number.MAX_VALUE, currentDepth, 1);
            this.BoardService.getBoard().setSide(side);
            this.BoardService.updateBoardHash(initHash); //to ensure that the hash is the same in each iteration

            if (this.searchStop && bestMove !== false) {
                break;
            }

            bestMove = this.PvTableService.probeTable(initHash);

            if (this.searchStop) {
                break;
            }

            if (bestMove &&
                bestMove.hasOwnProperty('score') &&
                Math.abs(bestMove.score) >= this.checkmateScore) {

                if (configs.loggingEnabled && configs.logLevel >= configs.logLevels.search) {
                    console.log('Checkmate move, level ' + currentDepth + ', move: ' + this.MoveService.convertToString(bestMove));
                }

                break;
            }

            if (configs.loggingEnabled) {
                if (configs.logLevel >= configs.logLevels.search) {
                    timeSoFar = (SearchService._now() - this.searchStart) / 1000;
                    line = pad(currentDepth, 8);
                    line += pad(this.MoveService.convertToString(bestMove), 12);
                    line += pad(bestMove.score, 8);
                    line += pad(this.searchNodes, 8);
                    line += pad(timeSoFar, 15);

                    if (currentDepth > 1) {
                        line += pad((this.failHighFirst / this.failHigh * 100).toFixed(2) + '%', 8);
                    }
                    else {
                        line += '-';
                    }

                    console.log(line);
                }

                if (configs.logLevel >= configs.logLevels.evaluation) {
                    console.log('Evaluations so far: ', this.alphaBetaEvaluations);
                    console.log('Saved evaluations uses: ', this.EvaluationService.getEvaluatedScoresUses());
                    console.log('Saved evaluations count: ', this.EvaluationService.getEvaluatedScoresCount());
                    console.log('-----------------------------');
                }
            }
        }

        if (configs.loggingEnabled && configs.logLevel >= configs.logLevels.search) {
            if (configs.logLevel >= configs.logLevels.search) {
                console.log('-----------------------------');
                line = 'Search finished';
                line += ', Best Move: ' + this.MoveService.convertToString(bestMove);
                line += ', Max Depth reached: ' + this.maxDepthReached;
                line += ', Time: ' + (SearchService._now() - this.searchStart) / 1000;
                line += ', Nodes: ' + this.searchNodes;
                console.log(line);
                console.log('-----------------------------');
            }

            if (configs.logLevel >= configs.logLevels.evaluation) {
                console.log('Total evaluations: ' + this.alphaBetaEvaluations);
                console.log('Quiescence attack evaluations: ' + this.quiescenceAttackEvaluations);
                console.log('Quiescence capture evaluations: ' + this.quiescenceCaptureEvaluations);
                console.log('-----------------------------');
            }
        }

        return bestMove;
    }

}

module.exports = new SearchService();