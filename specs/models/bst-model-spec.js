const BstModel = require('../../source/models/bst-model')

describe('BST Model', function () {
    'use strict';
    let victim;

    beforeEach(function () {
        victim = new BstModel();
    });

    describe('insert and search function - ', function () {
        test('Insert multiple value with the same key', function () {
            const keys = [4, 1, 1, 2, 3, 2, 3];
            let index;
            for (index = 0; index < keys.length; index++) {
                victim.insert(keys[index], 'test' + index);
            }

            expect(victim.search(1)).toBe('test2');
            expect(victim.search(2)).toBe('test5');
            expect(victim.search(3)).toBe('test6');
            expect(victim.search(4)).toBe('test0');
            expect(victim.count()).toBe(4);
        });

        test('Insert multiple strings', function () {
            const keys = [4, 1, 10, 2, 3, 9, 8, 5, 7, 6];
            let index;
            for (index = 0; index < keys.length; index++) {
                victim.insert(keys[index], 'test' + keys[index]);
            }

            expect(victim.search(1)).toBe('test1');
            expect(victim.search(2)).toBe('test2');
            expect(victim.search(3)).toBe('test3');
            expect(victim.search(4)).toBe('test4');
            expect(victim.search(5)).toBe('test5');
            expect(victim.search(6)).toBe('test6');
            expect(victim.search(7)).toBe('test7');
            expect(victim.search(8)).toBe('test8');
            expect(victim.search(9)).toBe('test9');
            expect(victim.search(10)).toBe('test10');

            expect(victim.count()).toBe(10);
        });

        test('Insert objects', function () {
            const obj = {prop1: 1, prop2: 2};
            const obj2 = {prop1: 2, prop2: 3};
            victim.insert(1, obj);
            victim.insert(2, obj2);

            obj.prop1 = 3;

            expect(victim.search(1).prop1).toBe(3);
            expect(victim.search(1).prop2).toBe(2);
            expect(victim.search(2).prop1).toBe(2);
            expect(victim.search(2).prop2).toBe(3);
        });
    });

    test('depth + height function', function () {
        const keys = [4, 1, 10, 2, 3, 9, 8, 5, 7, 6];
        let index;
        for (index = 0; index < keys.length; index++) {
            victim.insert(keys[index], 'test' + keys[index]);
        }
        //              4
        //            /  \
        //           1    10
        //           \    /
        //           2   9
        //           \  /
        //           3 8
        //            /
        //           5
        //           \
        //           7
        //          /
        //         6

        expect(victim.depth()).toBe(7);
        expect(victim.depth(5)).toBe(3);
        expect(victim.depth(3)).toBe(1);

        expect(victim.height()).toBe(1);
        expect(victim.height(5)).toBe(5);
        expect(victim.height(3)).toBe(4);
    });

    describe('remove function', function () {
        beforeEach(function () {
            const keys = [4, 3, 7, 1, 2, 5, 9, 6, 8, 10];
            let index;
            for (index = 0; index < keys.length; index++) {
                victim.insert(keys[index], 'test' + keys[index]);
            }
            //              4
            //             / \
            //            3   7
            //           /   /\
            //          1   5  9
            //           \  \ / \
            //           2  6 8 10
        });

        test('Remove a node not present in the tree ', function () {
            expect(victim.count()).toBe(10);
            victim.remove(11);
            expect(victim.count()).toBe(10);
        });

        test('Node to be removed has no children', function () {
            expect(victim.count()).toBe(10);
            expect(victim.search(2)).toBe('test2');
            expect(victim.depth()).toBe(4);
            expect(victim.height(2)).toBe(4);

            victim.remove(2);
            //              4
            //             / \
            //            3   7
            //           /   /\
            //          1   5  9
            //              \ / \
            //              6 8 10

            expect(victim.count()).toBe(9);
            expect(victim.search(2)).toBe(false);
            expect(victim.depth()).toBe(4);
            expect(victim.height(2)).toBe(0);
        });

        test('Node to be removed has one child', function () {
            expect(victim.count()).toBe(10);
            expect(victim.search(1)).toBe('test1');
            expect(victim.depth()).toBe(4);
            expect(victim.height(2)).toBe(4);

            victim.remove(1);
            //              4
            //             / \
            //            3   7
            //           /   /\
            //          2   5  9
            //              \ / \
            //              6 8 10

            expect(victim.count()).toBe(9);
            expect(victim.search(1)).toBe(false);
            expect(victim.depth()).toBe(4);
            expect(victim.height(2)).toBe(3);
        });

        test('Node to be removed has 2 leaf childs', function () {
            expect(victim.count()).toBe(10);
            expect(victim.search(9)).toBe('test9');
            expect(victim.depth()).toBe(4);
            expect(victim.height(8)).toBe(4);
            expect(victim.height(10)).toBe(4);

            victim.remove(9);
            //              4
            //             / \
            //            3   7
            //           /   /\
            //          1   5  10
            //           \  \ /
            //           2  6 8

            expect(victim.count()).toBe(9);
            expect(victim.search(9)).toBe(false);
            expect(victim.depth()).toBe(4);
            expect(victim.height(8)).toBe(4);
            expect(victim.height(10)).toBe(3);
        });

        test('Node to be removed has 2 childs', function () {
            expect(victim.count()).toBe(10);
            expect(victim.search(7)).toBe('test7');
            expect(victim.depth()).toBe(4);
            expect(victim.height(8)).toBe(4);

            victim.remove(7);
            //              4
            //             / \
            //            3   8
            //           /   /\
            //          1   5  9
            //           \  \  \
            //           2  6  10

            expect(victim.count()).toBe(9);
            expect(victim.search(7)).toBe(false);
            expect(victim.depth()).toBe(4);
            expect(victim.height(8)).toBe(2);
        });

        test('Node to be removed is the root', function () {
            expect(victim.count()).toBe(10);
            expect(victim.search(4)).toBe('test4');
            expect(victim.depth()).toBe(4);
            expect(victim.height(5)).toBe(3);
            expect(victim.depth(5)).toBe(2);
            expect(victim.height(6)).toBe(4);
            expect(victim.depth(6)).toBe(1);

            victim.remove(4);
            //              5
            //             / \
            //            3   7
            //           /   /\
            //          1   6  9
            //           \    / \
            //           2   8 10

            expect(victim.count()).toBe(9);
            expect(victim.search(4)).toBe(false);
            expect(victim.depth()).toBe(4);
            expect(victim.height(5)).toBe(1);
            expect(victim.depth(5)).toBe(4);
            expect(victim.height(6)).toBe(3);
            expect(victim.depth(6)).toBe(1);
        });

        test('Remove root element without right childs', function () {
            const keys = [52, 34, 21, 11, 13, 15, 17, 18, 22, 23, 24, 26, 27, 28, 36];
            let index;

            victim = new BstModel();
            for (index = 0; index < keys.length; index++) {
                victim.insert(keys[index], 'test' + keys[index]);
                expect(victim.count()).toBe(index+1);
            }

            expect(victim.count()).toBe(15);
            expect(victim.search(52)).toBe('test52');
            expect(victim.depth()).toBe(9);
            expect(victim.depth(52)).toBe(9);
            expect(victim.height(52)).toBe(1);

            victim.remove(52);

            expect(victim.count()).toBe(14);
            expect(victim.search(52)).toBe(false);
            expect(victim.depth()).toBe(8);
            expect(victim.depth(52)).toBe(0);
            expect(victim.height(52)).toBe(0);
        });
    });

    test('clone function', function () {
        const keys = [4, 3, 7, 1, 2, 5, 9, 6, 8, 10];
        let clone;
        let index;
        for (index = 0; index < keys.length; index++) {
            victim.insert(keys[index], 'test' + keys[index]);
        }
        //              4
        //             / \
        //            3   7
        //           /   /\
        //          1   5  9
        //           \  \ / \
        //           2  6 8 10

        clone = victim.clone();

        expect(clone.count()).toBe(victim.count());
        expect(clone.search(10)).toBe('test10');
        expect(clone.height(10)).toBe(victim.height(10));
        expect(clone.depth(10)).toBe(victim.depth(10));
        expect(clone.height(9)).toBe(victim.height(9));
        expect(clone.depth(9)).toBe(victim.depth(9));

        victim.remove(10);

        expect(clone.count()).toBe(victim.count() + 1);
        expect(victim.search(10)).toBe(false);
        expect(clone.search(10)).toBe('test10');
        expect(clone.height(10)).toBe(4);
        expect(clone.depth(10)).toBe(1);
    });
});
