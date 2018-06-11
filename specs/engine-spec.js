const engine = require('../engine.js');
const keys = require('lodash/keys');

describe('Engine', function () {
    test('check exposed methods', ()=>{
        expect(keys(engine)).toEqual(["initBoard", "parseFEN", "getBoard", "getPieceValidMoves", "isCheckMate", "searchNextMove", "makeMove", "configs"]);
    });
});