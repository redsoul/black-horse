# Black Horse
https://www.npmjs.com/package/black-horse

Javascript Chess Engine

## Installation

    npm install black-horse --save

## Usage

Just import the library and all of Black Horse namespace will be available to you:

```javascript
const BlackHorseChessEngine = require('black-horse');
```

## Public API

All the methods use the coordinates system based on the following board:

```Javascript
/*
         8    r  n  b  q  k  b  n  r
         7    p  p  p  p  p  p  p  p
         6
         5
         4
         3
         2    P  P  P  P  P  P  P  P
         1    R  N  B  Q  K  B  N  R

              1  2  3  4  5  6  7  8
*/
```

### initBoard()
Set the board to the default opening board.
```Javascript
BlackHorseChessEngine.initBoard();
```

### printBoard()
Prints de current board to the console
```Javascript
BlackHorseChessEngine.printBoard();
/*
         8   r  n  b  q  k  b  n  r 
         7   p  p  p  p  p  p  p  p 
         6   .  .  .  .  .  .  .  . 
         5   .  .  .  .  .  .  .  . 
         4   .  .  .  .  .  .  .  . 
         3   .  .  .  .  .  .  .  . 
         2   P  P  P  P  P  P  P  P 
         1   R  N  B  Q  K  B  N  R 
 
             a  b  c  d  e  f  g  h 
*/
```

### parseFEN(fenString)
Used to set the board to different state, using the FEN notation
```Javascript
BlackHorseChessEngine.parseFEN("2r3k1/1q1nbppp/r3p3/3pP3/p1pP4/P1Q2N2/1PRN1PPP/2R4K b - - 0 0");
```

### getBoard()
Return the board object with all the current status, including the current FEN string
```Javascript
console.log(BlackHorseChessEngine.getBoard());
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
      color: 0,
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
### getPieceValidMoves(notation)
Returns an Array of all the valid moves for the piece in the position indicated by the coordinates or by the Standart Algebraic Notation
```Javascript
console.log(BlackHorseChessEngine.getPieceValidMoves(2, 2)); 
console.log(BlackHorseChessEngine.getPieceValidMoves('b2')); 
/*
[ 
  { 
    algebraicNotation: 'b3',
    piece: 1,
    pieceDest: 0,
    color: 0,
    rowOrig: 2,
    columnOrig: 2,
    rowDest: 3,
    columnDest: 2,
    flag: null,
    promotedPiece: null,
    hash: 2127761049,
    score: -10 
  },
  { 
    algebraicNotation: 'b4',
    piece: 1,
    pieceDest: 0,
    color: 0,
    rowOrig: 2,
    columnOrig: 2,
    rowDest: 4,
    columnDest: 2,
    flag: null,
    promotedPiece: null,
    hash: 2127761049,
    score: -10 
  } 
]
*/
```

### isCheckMate(color)
Checks if for the given color, is it in check mate or not
```Javascript
BlackHorseChessEngine.parseFEN("2Q4k/1R6/8/8/8/8/8/7K w - - 0 2");
//0 - white, 1 - black
BlackHorseChessEngine.isCheckMate(0); //false
BlackHorseChessEngine.isCheckMate(1); //true
```

### searchNextMove(options)
#### options
```Javascript
{
    minDepth: 4, // min search depth - default 4
    maxSearchTime: 3000 //max search time spended in seconds - default 3000
}
```
Search the next move for the current color
```Javascript
BlackHorseChessEngine.initBoard();
const searchOptions = {
  minDepth:6, 
  maxSearchTime: 1000 
} 
const nextMove = BlackHorseChessEngine.searchNextMove(searchOptions);
/*
{
    "algebraicNotation": "d4",
    "columnDest": 4,
    "columnOrig": 4,
    "piece": 1,
    "pieceDest": 0,
    "promotedPiece": null,
    "rowDest": 4,
    "rowOrig": 2,
    "score": 10,
    "color": 0
}
*/
```

### move(moveObject)
Search the next move for the current color. 
Can accept an object with the coordinates and move flag or can accept a string with the Standart Algebraic Notation
```Javascript
console.log(BlackHorseChessEngine.move({
                                   "columnDest": 4,
                                   "columnOrig": 4,
                                   "rowDest": 4,
                                   "rowOrig": 2,
                               }));
console.log(BlackHorseChessEngine.move('d4');
/*
{
  algebraicNotation: 'd4',
  board: { 'board object' },
  isCheckMate: false
}
*/

```

### configs
Object containing all the configurations used in the chess engine.

#### Pieces codes
 * 0 - empty
 * 1 - White Pawn
 * 2 - White Knight
 * 3 - White Bishop
 * 4 - White Rook
 * 5 - White Queen
 * 6 - White King
 * 7 - Black Pawn
 * 8 - Black Knight
 * 9 - Black Bishop
 * 10 - Black Rook
 * 11 - Black Queen
 * 12 - Black King

#### Color codes
 * 0 - White
 * 1 - Black


# Node.js version compatibility

12.0.0 or higher