const engine = require ('./engine');

engine.initBoard();
engine.configs.moveCacheEnabled = false;
console.log(engine.searchNextMove(15));

// const TreeModel = require ('./src/models/tree-model');
// const tree = new TreeModel (1, null);
// tree.add (1, 2, [{a:2}, {a:4}]);
// tree.add (1, 3, [{a:3}, {a:5}]);
// tree.traverseBreadthFirst(node => {
//     console.log(node.data);
// });