const TreeModel = require ('../models/tree-model');

class CacheService {
  constructor () {
    this.tree = new TreeModel (0, null);
  }

  cacheMoves (parentKey, key, moves) {
    if (!this.hasMove (parentKey)) {
      this.tree.add (0, parentKey, null);
    }
    this.tree.add (parentKey, key, moves);
  }

  getMoves (key) {
    // console.log ('Get Moves: ' + key);
    const node = this.tree.search (key);
    return node === null ? null : node.data;
  }

  hasMove (key) {
    return !!this.tree.search (key);
  }
}

module.exports = new CacheService ();
