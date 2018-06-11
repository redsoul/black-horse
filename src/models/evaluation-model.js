const pawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [10, 10, 0, -10, -10, 0, 10, 10],
    [5, 0, 0, 5, 5, 0, 0, 5],
    [0, 0, 10, 20, 20, 10, 0, 0],
    [5, 5, 5, 10, 10, 5, 5, 5],
    [10, 10, 10, 20, 20, 10, 10, 10],
    [20, 20, 20, 30, 30, 20, 20, 20],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
const knightTable = [
    [0, -10, 0, 0, 0, 0, -10, 0],
    [0, 0, 0, 5, 5, 0, 0, 0],
    [0, 0, 10, 10, 10, 10, 0, 0],
    [0, 0, 10, 20, 20, 10, 5, 0],
    [5, 10, 15, 20, 20, 15, 10, 5],
    [5, 10, 10, 20, 20, 10, 10, 5],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
const bishopTable = [
    [0, 0, -10, 0, 0, -10, 0, 0],
    [0, 0, 0, 10, 10, 0, 0, 0],
    [0, 0, 10, 15, 15, 10, 0, 0],
    [0, 10, 15, 20, 20, 15, 10, 0],
    [0, 10, 15, 20, 20, 15, 10, 0],
    [0, 0, 10, 15, 15, 10, 0, 0],
    [0, 0, 0, 10, 10, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
const rookTable = [
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [25, 25, 25, 25, 25, 25, 25, 25],
    [0, 0, 5, 10, 10, 5, 0, 0]
];
const queenTable = [
    [0, 0, -10, 0, 0, -10, 0, 0],
    [0, 0, 0, 10, 10, 0, 0, 0],
    [0, 0, 10, 15, 15, 10, 0, 0],
    [0, 10, 15, 20, 20, 15, 10, 0],
    [0, 10, 15, 20, 20, 15, 10, 0],
    [0, 0, 10, 15, 15, 10, 0, 0],
    [25, 25, 25, 25, 25, 25, 25, 25],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
const kingTable = [
    [0, 5, 5, -10, -10, 0, 10, 5],
    [-30, -30, -30, -30, -30, -30, -30, -30],
    [-50, -50, -50, -50, -50, -50, -50, -50],
    [-70, -70, -70, -70, -70, -70, -70, -70],
    [-70, -70, -70, -70, -70, -70, -70, -70],
    [-70, -70, -70, -70, -70, -70, -70, -70],
    [-70, -70, -70, -70, -70, -70, -70, -70],
    [-70, -70, -70, -70, -70, -70, -70, -70]
];
const kingEndGameTable = [
    [-50, -10, 0, 0, 0, 0, -10, -50],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [0, 10, 20, 20, 20, 20, 10, 0],
    [0, 10, 20, 20, 20, 20, 10, 0],
    [0, 10, 20, 20, 20, 20, 10, 0],
    [0, 10, 20, 20, 20, 20, 10, 0],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-50, -10, 0, 0, 0, 0, -10, -50]
];

const bishopPairBonus = 30;
const endGameValue = 51400;
const doubledPawnPenalty = 10;
const isolatedPawnPenalty = 10;
const castlingPenalty = 99;
const castlingEndGamePenalty = 0;
const castlingBonus = 0;

module.exports = class EvaluationModel {
    constructor() {

    }

    pawnScore(row, column) {
        return pawnTable[row][column];
    }

    knightScore(row, column) {
        return knightTable[row][column];
    }

    bishopScore(row, column) {
        return bishopTable[row][column];
    }

    rookScore(row, column) {
        return rookTable[row][column];
    }

    queenScore(row, column) {
        return queenTable[row][column];
    }

    kingScore(row, column) {
        return kingTable[row][column];
    }

    kingEndGameScore(row, column) {
        return kingEndGameTable[row][column];
    }

    bishopPairBonus() {
        return bishopPairBonus;
    }

    doubledPawnPenalty() {
        return doubledPawnPenalty;
    }

    isolatedPawnPenalty() {
        return isolatedPawnPenalty;
    }

    castlingPenalty() {
        return castlingPenalty;
    }

    castlingEndGamePenalty() {
        return castlingEndGamePenalty;
    }

    castlingBonus() {
        return castlingBonus;
    }

    endGameValue() {
        return endGameValue;
    }
};