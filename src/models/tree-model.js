class Node {
  constructor (key, data) {
    this.key = key;
    this.data = data;
    this.parent = null;
    this.children = [];
  }
}

function findIndex (arr, key) {
  var index;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].key === key) {
      index = i;
    }
  }

  return index;
}

//https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
module.exports = class Tree {
  constructor (key, data) {
    this._root = new Node (key, data);
  }

  /*
   tree.traverseDepthFirst(node => console.log(node.data));
   */
  traverseDepthFirst (callback) {
    // this is a recurse and immediately-invoking function
    (function recurse (currentNode) {
      // step 2
      for (var i = 0, length = currentNode.children.length; i < length; i++) {
        // step 3
        recurse (currentNode.children[i]);
      }

      // step 4
      callback (currentNode);

      // step 1
    }) (this._root);
  }

  /*
   tree.traverseBreadthFirst(node => console.log(node.data));
   */
  traverseBreadthFirst (callback) {
    const queue = new Array ();
    queue.unshift (this._root);
    let currentTree = queue.pop ();

    while (currentTree) {
      for (var i = 0, length = currentTree.children.length; i < length; i++) {
        queue.unshift (currentTree.children[i]);
      }

      callback (currentTree);
      currentTree = queue.pop ();
    }
  }

  /*
  tree.contains(function(node){
    if (node.data === 'two') {
        console.log(node);
    }
  }, tree.traverseBF);
  */
  contains (callback, traversal) {
    traversal.call (this, callback);
  }

  search (key) {
    let returnNode = null;
    this.traverseBreadthFirst (node => {
      if (node.key === key) {
        returnNode = node;
        return;
      }
    });
    return returnNode;
  }

  /*
    var tree = new Tree('CEO');
 
    tree.add('VP of Happiness', 'CEO', tree.traverseBF);
    tree.add('VP of Finance', 'CEO', tree.traverseBF);
    tree.add('VP of Sadness', 'CEO', tree.traverseBF);
    
    tree.add('Director of Puppies', 'VP of Finance', tree.traverseBF);
    tree.add('Manager of Puppies', 'Director of Puppies', tree.traverseBF);
 
  'CEO'
    ├── 'VP of Happiness'
    ├── 'VP of Finance'
    │   ├── 'Director of Puppies'
    │   └── 'Manager of Puppies'
    └── 'VP of Sadness'
  */
  add = function (parentKey, key, data, traversal = this.traverseBreadthFirst) {
    // console.log ('New Node: ' + parentKey + ' - ' + key);
    const child = new Node (key, data);
    let parent = null;

    this.contains (node => {
      if (node.key === parentKey) {
        parent = node;
      }
    }, traversal);

    if (parent) {
      parent.children.push (child);
      child.parent = parent;
    } else {
      throw new Error ('Cannot add node to a non-existent parent.');
    }
  };

  remove (key, targetKey, traversal) {
    let parent = null;
    let childToRemove = null;
    let index;

    this.contains (node => {
      if (node.key === targetKey) {
        parent = node;
      }
    }, traversal);

    if (parent) {
      index = findIndex (parent.children, key);

      if (index === undefined) {
        throw new Error ('Node to remove does not exist.');
      } else {
        childToRemove = parent.children.splice (index, 1);
      }
    } else {
      throw new Error ('Parent does not exist.');
    }

    return childToRemove;
  }
};
