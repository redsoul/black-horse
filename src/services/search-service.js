const BoardService = require('./board-service.js');
const EvaluationService = require('./evaluation-service.js');
const PieceService = require('./piece-service.js');
const PvTableService = require('./pvtable-service.js');
const MoveService = require('./move-service.js');
const CutoffService = require('./cutoff-service.js');
const NotationService = require('./notation-service.js');
const LoggerService = require('./logger-service.js');

const configs = require('../configurations');
const pad = require('lodash/pad');
const assignIn = require('lodash/assignIn');

class SearchService {
	constructor() {
		this.PieceService = PieceService;
		this.BoardService = BoardService;
		this.EvaluationService = EvaluationService;
		this.PvTableService = PvTableService;
		this.MoveService = MoveService;
		this.CutoffService = CutoffService;
		this.NotationService = NotationService;

		//in seconds
		this.defaultSearchTime = 1;
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
		return new Date().getTime();
	}

	_checkUp() {
		if (this.alphaBetaEvaluations > 0 && this.alphaBetaEvaluations % 100 === 0) {
			if (SearchService._now() - this.searchStart > this.searchTime) {
				this.searchStop = true;
			}

			if (this.alphaBetaEvaluations % 2000 === 0) {
				const timeSoFar = (SearchService._now() - this.searchStart) / 1000;

				LoggerService.log(`Time elapsed: ${timeSoFar}`, configs.logLevels.evaluation);
				LoggerService.log(`Evaluations per second: ${this.alphaBetaEvaluations / timeSoFar}`, configs.logLevels.evaluation);
				LoggerService.log('-----------------------------', configs.logLevels.evaluation);
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
		let color;
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

		captureMoves = this.BoardService.generateAllCaptureMoves(board.getColor());
		if (captureMoves.length === 0) {
			return alpha;
		}

		//put the best move from the last iteration on top
		this.PvTableService.promoteLastBestMove(captureMoves, board.getHash());

		this.BoardService.switchColor();
		color = board.getColor();

		for (index = 0, movesLength = captureMoves.length; index < movesLength; index += 1) {
			this.BoardService.getBoard().setColor(color);
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
		let color;
		let oldAlpha = alpha;
		let bestMove = false;
		let inCheck;

		if (depthLeft <= 0 || currentDepth > this.maxDepth) {
			return this._quiescence(alpha, beta, 1, currentDepth, currentMove);
		}

		this._checkUp();

		const kingPosition = board.getKingPosition(board.getColor());
		inCheck = this.BoardService.isPieceAttacked(kingPosition[0], kingPosition[1]);
		if (inCheck) {
			depthLeft += 1;
		}
		this.searchNodes += 1;
		moves = this.BoardService.generateAllMoves(board.getColor());
		// NotationService.printMoveArray(moves);
		//put the best move from the last iteration on top
		this.PvTableService.promoteLastBestMove(moves, board.getHash());
		// NotationService.printMoveArray(moves);
		this.CutoffService.promoteBetaMoves(moves, currentDepth);
		// NotationService.printMoveArray(moves);
		this.CutoffService.promoteAlphaMoves(moves, currentDepth);
		// NotationService.printMoveArray(moves);

		this.BoardService.switchColor();

		color = board.getColor();
		for (index = 0, movesLength = moves.length; index < movesLength; index += 1) {
			this.BoardService.getBoard().setColor(color);
			board = this.BoardService.getBoard();
			move = this.MoveService.pickNextMove(moves, index);
			// NotationService.printMove(move);
			if (!this.BoardService.makeMove(move)) {
				continue;
			}

			legalMoves += 1;
			move.score = -this._alphaBeta(-beta, -alpha, depthLeft - 1, currentDepth + 1, move);
			// console.log('score: ' + move.score);
			this.BoardService.rollbackMove();

			if (this.searchStop) {
				LoggerService.log(`timeout, depth ${currentDepth}, ${movesLength - index + 1}  ${moves} left`, configs.logLevels.timeout);

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
					if (board.getPiece(move.rowDest, move.columnDest) === configs.pieces.empty) {
						this.CutoffService.storeBetaMove(move, currentDepth);
					}

					return beta;
				}

				if (bestMove && board.getPiece(move.rowDest, move.columnDest) === configs.pieces.empty) {
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
     * @param options object - default {
            minDepth: 4,
            maxSearchTime: 3000
        }
     * @returns {*}
     */
	searchNextMove(options = {}) {
		let bestMove = null;
		let board = this.BoardService.getBoard();
		let color = board.getColor();
		let initHash = board.getHash();
		let currentDepth;
		let timeSoFar;
		let line = '';
		const defaultOptions = {
			minDepth: 4,
			maxSearchTime: 3000,
		};
		options = assignIn(defaultOptions, options);

		// NotationService.printBoard(board.get64Board());
		this.searchTime = options.maxSearchTime * 1000;
		this._resetSearch();

		LoggerService.log(
			pad('Depth', 8) + pad('Best move', 12) + pad('Score', 8) + pad('Nodes', 8) + pad('Time elapsed', 15) + pad('Ordering', 8),
			configs.logLevels.search
		);

		// iterative deepening
		for (currentDepth = 1; currentDepth <= options.minDepth; currentDepth += 1) {
			// console.log('------------------------');
			// console.log('currentDepth: ' + currentDepth);
			// console.log('------------------------');
			this._alphaBeta(-Number.MAX_VALUE, Number.MAX_VALUE, currentDepth, 1);
			this.BoardService.getBoard().setColor(color);
			this.BoardService.updateBoardHash(initHash); //to ensure that the hash is the same in each iteration

			if (this.searchStop && bestMove !== false) {
				break;
			}

			bestMove = this.PvTableService.probeTable(initHash);

			if (this.searchStop) {
				break;
			}

			if (bestMove && bestMove.hasOwnProperty('score') && Math.abs(bestMove.score) >= this.checkmateScore) {
				LoggerService.log(
					`Checkmate move, level ${currentDepth}, move: ${this.MoveService.convertToString(bestMove)}`,
					configs.logLevels.search
				);
				break;
			}

			timeSoFar = (SearchService._now() - this.searchStart) / 1000;
			line = pad(currentDepth, 8);
			line += pad(this.MoveService.convertToString(bestMove), 12);
			line += pad(bestMove.score, 8);
			line += pad(this.searchNodes, 8);
			line += pad(timeSoFar, 15);

			if (currentDepth > 1) {
				line += pad(((this.failHighFirst / this.failHigh) * 100).toFixed(2) + '%', 8);
			} else {
				line += pad('-', 8);
			}

			LoggerService.log(line, configs.logLevels.search);

			LoggerService.log(`Evaluations so far: ${this.alphaBetaEvaluations}`, configs.logLevels.evaluation);
			LoggerService.log(`-----------------------------`, configs.logLevels.evaluation);
		}

		LoggerService.log('-----------------------------', configs.logLevels.search);
		line =
			`Search finished for Depth ${options.minDepth}\n` +
			`Evaluations so far: ${this.alphaBetaEvaluations}` +
			', Best Move: ' +
			this.MoveService.convertToString(bestMove) +
			', Score: ' +
			bestMove.score +
			', Max Depth reached: ' +
			this.maxDepthReached +
			', Time: ' +
			(SearchService._now() - this.searchStart) / 1000 +
			' seconds' +
			', Nodes: ' +
			this.searchNodes;
		LoggerService.log(line, configs.logLevels.search);
		LoggerService.log('-----------------------------', configs.logLevels.search);

		LoggerService.log(`Total evaluations: ${this.alphaBetaEvaluations}`, configs.logLevels.evaluation);
		LoggerService.log(`Quiescence attack evaluations: ${this.quiescenceAttackEvaluations}`, configs.logLevels.evaluation);
		LoggerService.log(`Quiescence capture evaluations: ${this.quiescenceCaptureEvaluations}`, configs.logLevels.evaluation);
		LoggerService.log(`-----------------------------`, configs.logLevels.evaluation);

		return bestMove;
	}
}

module.exports = new SearchService();
