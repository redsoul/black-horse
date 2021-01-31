const engine = require ('./engine');

engine.initBoard();
engine.parseFEN('3rq1k1/pp5p/6p1/5p2/8/1PQ3PP/P4P2/2R3K1 b - - 0 25');
engine.configs.moveCacheEnabled = false;
console.log(engine.searchNextMove({minDepth:6}));

/*
2021-01-31T17:26:56.167Z - Search finished for Depth 6
Evaluations so far: 536080, Best Move: e8e2, Score: 40, Max Depth reached: 12, Time: 107.219, Nodes: 636335


*/