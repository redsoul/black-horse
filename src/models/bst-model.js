/*
 * Class: BST
 *
 * A pure JavaScript implementation of a binary search tree.
 * https://gist.github.com/trevmex/821973
 *
 */

/*
     * Private Class: Node
     *
     * A BST node constructor
     *
     * Parameters:
     *        leftChild - a reference to the left child of the node.
     *        key - The key of the node.
     *        value - the value of the node.
     *        rightChild - a reference to the right child of the node.
     *        parent - a reference to the parent of the node.
     *
     * Note: All parameters default to null.
     */
class Node {
    constructor(leftChild, key, value, rightChild, parent) {
        this.leftChild = (typeof leftChild === 'undefined') ? null : leftChild;
        this.key = (typeof key === 'undefined') ? null : key;
        this.value = (typeof value === 'undefined') ? null : value;
        this.rightChild = (typeof rightChild === 'undefined') ? null : rightChild;
        this.parent = (typeof parent === 'undefined') ? null : parent;
    }
}

module.exports = class BstModel {
    constructor() {
        /*
         * The root node of the BST.
         */
        this._root = new Node();
        /*
         * stop traversing the BSP
         */
        this._stopTraversing = false;
    }

    /*
     * Search through a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to search for (as an integer).
     *
     * Returns:
     *     the value of the found node,
     *     or false if no node was found.
     *
     */
    _searchNode (node, key) {
        if (node.key === null) {
            return false; // key not found
        }

        const nodeKey = parseInt(node.key, 10);

        if (key < nodeKey) {
            return this._searchNode(node.leftChild, key);
        } else if (key > nodeKey) {
            return this._searchNode(node.rightChild, key);
        } else { // key is equal to node key
            return node;
        }
    };

    /*
     * Insert into a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to insert (as an integer).
     *     value - the value to associate with the key (any type of
     *             object).
     *
     * Returns:
     *     true.
     *
     */
    _insertNode (node, key, value, parent) {
        if (node.key === null) {
            node.leftChild = new Node();
            node.key = key;
            node.value = value;
            node.rightChild = new Node();
            node.parent = parent;
            return true;
        }

        const nodeKey = parseInt(node.key, 10);

        if (key < nodeKey) {
            this._insertNode(node.leftChild, key, value, node);
        } else if (key > nodeKey) {
            this._insertNode(node.rightChild, key, value, node);
        } else { // key is equal to node key, update the value
            node.value = value;
            return true;
        }
    };

    /*
     * Deletes a node from the binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to delete (as an integer).
     *
     * Returns:
     *     node
     *
     */
    _removeNode (node, key) {
        let tempNode;
        if (node && node.key) {
            if (key < node.key) {
                tempNode = this._removeNode(node.leftChild, key);
                if (tempNode) {
                    tempNode.parent = node.leftChild.parent;
                    node.leftChild = tempNode;
                }
            } else if (key > node.key) {
                tempNode = this._removeNode(node.rightChild, key);
                if (tempNode) {
                    tempNode.parent = node.rightChild.parent;
                    node.rightChild = tempNode;
                }
            } else if (node.leftChild.key && node.rightChild.key) {
                tempNode = this._minNode(node.rightChild);
                node.key = tempNode.key;
                node.value = tempNode.value;
                node.rightChild = this._removeNode(node.rightChild, tempNode.key);
            } else {
                node = node.leftChild.key ? node.leftChild : node.rightChild;
            }
        } else {
            return new Node();
        }
        return node;
    };

    /*
     * Call a function on each node of a binary tree.
     *
     * Parameters:
     *     node - the node to traverse.
     *     callback - the function to call on each node, this function
     *                takes a key and a value as parameters.
     *
     * Returns:
     *     Boolean.
     *
     */
    _inOrderNodeTraversal (node, callback) {
        if (node.key !== null) {
            this._inOrderNodeTraversal(node.leftChild, callback);

            if (this._stopTraversing) {
                return;
            }

            callback(node.key, node.value);

            if (this._stopTraversing) {
                return;
            }

            this._inOrderNodeTraversal(node.rightChild, callback);
        }

        return true;
    };

    /*
     * Call a function on each node of a binary tree.
     *
     * Parameters:
     *     node - the node to traverse.
     *     callback - the function to call on each node, this function
     *                takes a key and a value as parameters.
     *
     * Returns:
     *     Boolean.
     *
     */
    _preOrderNodeTraversal (node, callback) {
        if (node.key !== null) {
            callback(node.key, node.value);

            if (this._stopTraversing) {
                return;
            }

            this._preOrderNodeTraversal(node.leftChild, callback);

            if (this._stopTraversing) {
                return;
            }

            this._preOrderNodeTraversal(node.rightChild, callback);
        }

        return true;
    };

    /*
     * Find the key of the node with the lowest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the lowest key number.
     *
     */
    _minNode(node) {
        return node.leftChild.key ? this._minNode(node.leftChild) : node;
    };

    /*
     * Find the key of the node with the highest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the highest key number.
     *
     */
    _maxNode(node) {
        return node.rightChild.key ? this._maxNode(node.rightChild) : node.key;
    };

    /*
     * Method: depth
     *
     * calculates the max depth of the tree
     *
     * Returns:
     *     Number
     *
     */
    _depth(node) {
        let calcDepth = 0;
        let depthLeft;
        let depthRight;

        if (node.key !== null) {
            depthLeft = this._depth(node.leftChild) + 1;
            depthRight = this._depth(node.rightChild) + 1;

            calcDepth = Math.max(depthLeft, depthRight);
        }

        return calcDepth;
    };

    /*
     * Method: height
     *
     * calculates the max depth of the tree
     *
     * Returns:
     *     Number
     *
     */
    _height (node) {
        let calcHeight = 1;

        if (node.parent !== null) {
            calcHeight = this._height(node.parent) + 1;
        }

        return calcHeight;
    };

    /*
     * Method: count
     *
     * counts how many nodes the tree have
     *
     * Returns:
     *     Number
     *
     */
    count () {
        let nodeCount = 0;
        this.traverse(function () {
            nodeCount++;
        });
        return nodeCount;
    }

    /*
     * Method: depth
     *
     * calculates the max depth of the tree
     *
     * Returns:
     *     Number
     *
     */
    depth(key) {
        let node;
        if (key) {
            node = this._searchNode(this._root, parseInt(key, 10));
            if (node) {
                return this._depth(node);
            }
            return 0;
        }
        return this._depth(this._root);
    }

    /*
     * Method: height
     *
     * calculates the max depth of the tree
     *
     * Returns:
     *     Number
     *
     */
    height(key) {
        let node;
        if (key) {
            node = this._searchNode(this._root, parseInt(key, 10));
            if (node) {
                return this._height(node);
            }
            return 0;
        }
        return this._height(this._root);
    }

    /*
     * Method: search
     *
     * Search through a binary tree.
     *
     * Parameters:
     *     key - the key to search for.
     *
     * Returns:
     *     the value of the found node,
     *     or null if no node was found,
     *     or undefined if no key was specified.
     *
     */
    search(key) {
        const keyInt = parseInt(key, 10);
        let node;

        if (isNaN(keyInt)) {
            throw new Error('BST Model search key must be a number');
        } else {
            node = this._searchNode(this._root, keyInt);
            return node ? node.value : node;
        }
    }

    /*
     * Method: insert
     *
     * Insert into a binary tree.
     *
     * Parameters:
     *     key - the key to search for.
     *     value - the value to associate with the key (any type of
     *             object).
     *
     * Returns:
     *     true,
     *     or undefined if no key was specified.
     *
     */
    insert(key, value) {
        const keyInt = parseInt(key, 10);
        if (isNaN(keyInt)) {
            throw new Error('BST Model insert key must be a number'); // key must be a number
        } else {
            return this._insertNode(this._root, keyInt, value, null);
        }
    }

    /*
     * Method: remove
     *
     * Deletes a node from the binary tree
     *
     * Parameters:
     *     key - the key to search for.
     *     value - the value to associate with the key (any type of
     *             object).
     *
     * Returns:
     *     true,
     *     or undefined if no key was specified.
     *
     */
    remove(key) {
        const keyInt = parseInt(key, 10);
        if (isNaN(keyInt)) {
            throw new Error('BST Model remove key must be a number'); // key must be a number
        } else {
            this._root = this._removeNode(this._root, keyInt);
            return !!this._root;
        }
    }

    /*
     * Method: stopTraversing
     *
     * stop the traverse recursivity
     *
     * Returns:
     *     void
     *
     */
    stopTraversing() {
        this._stopTraversing = true;
    }

    /*
     * Method: traverse
     *
     * Call a function on each node of a binary tree.
     *
     * Parameters:
     *     callback - the function to call on each node, this function
     *                takes a key and a value as parameters. If no
     *                callback is specified, print is called.
     *
     * Returns:
     *     true.
     *
     */
    traverse(callback) {
        this._stopTraversing = false;
        if (typeof callback === 'undefined') {
            let line = '';
            let res;
            callback = function (key) {
                line += key + ', ';
            };

            res = this._inOrderNodeTraversal(this._root, callback);
            console.log(line);

            return res;
        } else {
            return this._inOrderNodeTraversal(this._root, callback);
        }
    }

    /*
     * Method: toArray
     *
     * convert the tree to an array
     *
     * Returns:
     *     Number
     *
     */
    toArray() {
        const arr = [];
        this.traverse(function (key, value) {
            arr.push([key, value]);
        });
        return arr;
    }

    /*
     * Method: keys
     *
     * return all the keys of the tree as a single array
     *
     * Returns:
     *     Number
     *
     */
    keys() {
        const arr = [];
        this._preOrderNodeTraversal(this._root, function (key) {
            arr.push(key);
        });
        return arr.sort();
    }

    /*
     * Method: clone
     *
     * clone the object itself
     *
     * Returns:
     *     BstModel
     *
     */
    clone() {
        const bst = new BstModel();
        this._preOrderNodeTraversal(this._root, function (key, value) {
            bst.insert(key, value);
        });
        return bst;
    }

    /*
     * Method: rebuild
     *
     * rebuild the tree based on an array of key/value pairs
     *
     * Returns:
     *     void
     *
     */
    rebuild(nodes) {
        if (nodes.length && nodes.length > 0) {
            nodes.forEach(function (value, key) {
                this.insert(key, value);
            });
        }
    }

};