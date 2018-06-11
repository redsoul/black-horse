# Black Horse
https://www.npmjs.com/package/black-horse

NodeJS Chess Engine

## Installation

    npm install black-horse --save

## Usage

Just require the library and all of Black Horse namespace will be available to you:

```javascript
const BlackHorseChessEngine = require('black-horse');
```

## Unit Tests

    npm install --only=dev
    npm test

## Public API

All the methods use the coordinates system based on the following board:

```Javascript
/*
         7    r  n  b  q  k  b  n  r
         6    p  p  p  p  p  p  p  p
         5
         4
         3
         2
         1    P  P  P  P  P  P  P  P
         0    R  N  B  Q  K  B  N  R

              0  1  2  3  4  5  6  7
*/
```

### initBoard()
```Javascript
/**
* @method initBoard
* @description Set the board to the default opening board.
* @returns {void}
*/

BlackHorseChessEngine.initBoard();
```

### parseFEN(fenString)
```Javascript
/**
* @method parseFEN
* @description Used to set the board to different state, using the FEN notation
* @param fenString {String}
* @returns {void}
*/

BlackHorseChessEngine.parseFEN("2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0");
```

### getBoard()
```Javascript
/**
* @method getBoard
* @description Return the board object with all the current status, including the current FEN string
* @returns {Object}
*/

const board = BlackHorseChessEngine.getBoard();

/*
{
      board:
       [ [ 10, 8, 9, 11, 12, 9, 8, 10 ],
         [ 7, 7, 7, 7, 7, 7, 7, 7 ],
         [ 0, 0, 0, 0, 0, 0, 0, 0 ],
         [ 0, 0, 0, 0, 0, 0, 0, 0 ],
         [ 0, 0, 0, 0, 0, 0, 0, 0 ],
         [ 0, 0, 0, 0, 0, 0, 0, 0 ],
         [ 1, 1, 1, 1, 1, 1, 1, 1 ],
         [ 4, 2, 3, 5, 6, 3, 2, 4 ] ],
      castle:
       [ { kingSide: true, queenSide: true },
         { kingSide: true, queenSide: true } ],
      pieceMaterial: [ 54100, 54100 ],
      pawnMaterial: [ 800, 800 ],
      capturedPieces: [ [], [] ],
      kingPosition: [ [ 1, 5 ], [ 8, 5 ] ],
      piecesCounter: [ null, 8, 2, 2, 2, 1, 1, 8, 2, 2, 2, 1, 1 ],
      hash: 726761150,
      side: 0,
      enPassant: false,
      fiftyMoveCounter: 0,
      fullmoveCounter: 0,
      pawnList: [ { list: [Object] }, { list: [Object] } ],
      pieceList: [ { list: [Object] }, { list: [Object] } ],
      fenString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0'
}
*/
```

### getPieceValidMoves(row, column)
```Javascript
/**
* @method getPieceValidMoves
* @description Returns an Array of all the valid moves for the piece in the position indicated by the coordinates
* @param row {Number}
* @param column {Number}
* @returns {Array}
*/

const pawnValidMoves = BlackHorseChessEngine.getPieceValidMoves(2, 2);

/*
[ { piece: 1,
        pieceDest: 0,
        side: 0,
        rowOrig: 2,
        columnOrig: 2,
        rowDest: 3,
        columnDest: 2,
        flag: null,
        promotedPiece: null,
        hash: 2127761049,
        score: -10 },
      { piece: 1,
        pieceDest: 0,
        side: 0,
        rowOrig: 2,
        columnOrig: 2,
        rowDest: 4,
        columnDest: 2,
        flag: null,
        promotedPiece: null,
        hash: 2127761049,
        score: -10 } ]

*/
```

### isCheckMate(side)
```Javascript
/**
* @method isCheckMate
* @description Checks if for the given side, is it in check mate or not
* @param side {Number} 0 - white, 1 - black
* @returns {Boolean}
*/

BlackHorseChessEngine.parseFEN("2Q4k/1R6/8/8/8/8/8/7K w - - 0 2");
BlackHorseChessEngine.isCheckMate(0); //false
BlackHorseChessEngine.isCheckMate(1); //true
```

### searchNextMove(searchTime, depth)
```Javascript
/**
* @method searchNextMove
* @description Search the next move for the current side
* @param searchTime {Number} max search time spended in milli-seconds - default 1000 (1 second)
* @param searchTime {depth} max search depth - default 20
* @returns {Object} - Move object. Can be used in the makeMove method
*/

BlackHorseChessEngine.initBoard();
const nextMove = BlackHorseChessEngine.searchNextMove();
/*
{
    "columnDest": 4,
    "columnOrig": 4,
    "piece": 1,
    "pieceDest": 0,
    "promotedPiece": null,
    "rowDest": 4,
    "rowOrig": 2,
    "score": 10,
    "side": 0
}
*/
```

### makeMove(moveObject)
```Javascript
/**
* @method makeMove
* @description Search the next move for the current side
* @param moveObject {Object} object with the all the details about the move
* @returns {Object} - object with the details of the moved piece
*/

BlackHorseChessEngine.makeMove({
                                   "columnDest": 4,
                                   "columnOrig": 4,
                                   "rowDest": 4,
                                   "rowOrig": 2,
                               })

```

### configs
Object containing all the configurations used in the chess engine.


# Node.js version compatibility

6.0.0 or higher