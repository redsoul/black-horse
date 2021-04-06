const engine = require('./engine');

// engine.parseFEN('3r2k1/p5p1/Q2n3p/1pq1B3/8/5P2/4R1P1/5K2 b - - 5 39');
engine.initBoard();
engine.printBoard();
console.log(engine.searchNextMove({ maxSearchTime: 20, minDepth: 6 }));
// console.log(engine.isCheckMate(0));
// console.log(engine.getPieceValidMoves('b2'))
// engine.parseFEN('3r2k1/p5p1/Q2n3p/1pq1B3/8/5P2/4R1P1/5K2 b - - 5 39');

// engine.move('c3');
// engine.printBoard();
// console.log(engine.searchNextMove({minDepth:6}));

/*
2021-01-31T17:26:56.167Z - Search finished for Depth 6
Evaluations so far: 536080, Best Move: e8e2, Score: 40, Max Depth reached: 12, Time: 107.219, Nodes: 636335


*/
