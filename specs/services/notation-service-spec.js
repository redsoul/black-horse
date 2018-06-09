const NotationService = require('../../source/services/notation-service.js');
const configs = require('../../source/configurations');

describe('NotationService', function () {
    'use strict';

    describe('algebraicNotation function -', function () {
        test('Move pieces to empty space - no flags', function () {
            expect(NotationService.algebraicNotation(configs.pieces.bP, configs.pieces.empty, {rowDest: 5, columnDest:2}, {})).toBe('b5');
            expect(NotationService.algebraicNotation(configs.pieces.bB, configs.pieces.empty, {rowDest: 5, columnDest:2}, {})).toBe('Bb5');

            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty, {rowDest: 4, columnDest:3}, {})).toBe('c4');
            expect(NotationService.algebraicNotation(configs.pieces.bN, configs.pieces.empty, {rowDest: 4, columnDest:3}, {})).toBe('Nc4');

            expect(NotationService.algebraicNotation(configs.pieces.bK, configs.pieces.empty, {rowDest: 6, columnDest:4}, {})).toBe('Kd6');
            expect(NotationService.algebraicNotation(configs.pieces.wK, configs.pieces.empty, {rowDest: 7, columnDest:5}, {})).toBe('Ke7');
        });

        test('Move pieces to empty space - isOppositeKingInCheck flag', function () {
            const moveFlag = {
                isOppositeKingInCheck: true
            };

            expect(NotationService.algebraicNotation(configs.pieces.bP, configs.pieces.empty, {rowDest: 5, columnDest:2}, moveFlag)).toBe('b5+');
            expect(NotationService.algebraicNotation(configs.pieces.bB, configs.pieces.empty, {rowDest: 5, columnDest:2}, moveFlag)).toBe('Bb5+');

            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty, {rowDest: 4, columnDest:3}, moveFlag)).toBe('c4+');
            expect(NotationService.algebraicNotation(configs.pieces.bN, configs.pieces.empty, {rowDest: 4, columnDest:3}, moveFlag)).toBe('Nc4+');

            expect(NotationService.algebraicNotation(configs.pieces.bK, configs.pieces.empty, {rowDest: 6, columnDest:4}, moveFlag)).toBe('Kd6+');
            expect(NotationService.algebraicNotation(configs.pieces.wK, configs.pieces.empty, {rowDest: 7, columnDest:5}, moveFlag)).toBe('Ke7+');
        });

        test('Move pieces to empty space - enPassant flag', function () {
            const moveFlag = {
                enPassant: true
            };

            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty, {rowDest: 4, columnDest:2}, moveFlag)).toBe('exb4(ep)');
            expect(NotationService.algebraicNotation(configs.pieces.bP, configs.pieces.empty, {rowDest: 5, columnDest:2}, moveFlag)).toBe('exb5(ep)');
        });

        test('Move pieces to empty space - promotion flag', function () {
            const moveFlag = {
                promotion: true
            };

            expect(NotationService.algebraicNotation(configs.pieces.bP, configs.pieces.empty,
                {rowDest: 1, columnDest:2, promotedPiece: configs.pieces.bQ}, moveFlag)).toBe('b1=Q');
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty,
                {rowDest: 8, columnDest:3, promotedPiece: configs.pieces.wR}, moveFlag)).toBe('c8=R');
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty,
                {rowDest: 8, columnDest:3}, moveFlag)).toBe('c8');
        });

        test('Move pieces to empty space - castle flag', function () {
            const castleFlags = [];
            castleFlags[configs.colors.white] = {
                kingSide: true,
                queenSide: false
            };
            castleFlags[configs.colors.black] = {
                kingSide: false,
                queenSide: false
            };

            expect(NotationService.algebraicNotation(configs.pieces.wK, configs.pieces.empty,
                {rowDest: 1, columnDest:3}, {castle: castleFlags})).toBe('0-0');

            castleFlags[configs.colors.white].kingSide = false;
            castleFlags[configs.colors.white].queenSide = true;
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty,
                {rowDest: 1, columnDest:8}, {castle: castleFlags})).toBe('0-0-0');

            castleFlags[configs.colors.white].queenSide = false;
            castleFlags[configs.colors.black].kingSide = true;
            castleFlags[configs.colors.black].queenSide = false;
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty,
                {rowDest: 8, columnDest:3}, {castle: castleFlags})).toBe('0-0');

            castleFlags[configs.colors.black].kingSide = false;
            castleFlags[configs.colors.black].queenSide = true;
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.empty,
                {rowDest: 8, columnDest:8}, {castle: castleFlags})).toBe('0-0-0');
        });

        test('Capture moves', function () {
            expect(NotationService.algebraicNotation(configs.pieces.bP, configs.pieces.wP,
                {rowDest: 4, columnDest:2}, {})).toBe('exb4');
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.bR,
                {rowDest: 8, columnDest:2, promotedPiece: configs.pieces.wQ}, {promotion: true})).toBe('b8=Q');
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.bR,
                {rowDest: 8, columnDest:2, promotedPiece: configs.pieces.wQ}, {promotion: true, isOppositeKingInCheck: true})).toBe('b8=Q+');
            expect(NotationService.algebraicNotation(configs.pieces.wP, configs.pieces.bP,
                {rowDest: 6, columnDest:3}, {})).toBe('exc6');
            expect(NotationService.algebraicNotation(configs.pieces.wR, configs.pieces.bB,
                {rowDest: 8, columnDest:3}, {})).toBe('Rxc8');
        });
    });
});
