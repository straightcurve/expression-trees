"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var lib_js_1 = require("../src/lib.js");
var main_js_1 = require("../src/main.js");
var TestExpression = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(TestExpression, _super);
    function TestExpression(lambda) {
        var _this = _super.call(this, 'test') || this;
        _this.lambda = lambda;
        return _this;
    }
    TestExpression.prototype.evaluate = function () {
        this.lambda();
    };
    return TestExpression;
}(main_js_1.Expression));
describe('expression trees', function () {
    it('should deserialize properly', function () {
        var start = {
            type: 'binary-expression',
            op: 'greater-than',
            left: {
                type: 'constant',
                value: 45,
                valueType: 'number'
            },
            right: {
                type: 'constant',
                value: 66,
                valueType: 'number'
            }
        };
        var tree = (0, main_js_1.deserialize)(start);
        expect(tree.type).toEqual('binary-expression');
        expect(tree.op).toEqual('greater-than');
        expect(tree.evaluate()).toEqual(false);
        expect(tree.left.type).toEqual('constant');
        expect(tree.left.evaluate()).toEqual(45);
        expect(tree.right.type).toEqual('constant');
        expect(tree.right.evaluate()).toEqual(66);
    });
    it('should deserialize properly', function () {
        var serialized = {
            type: 'binary-expression',
            op: 'and',
            left: {
                type: 'binary-expression',
                op: 'greater-than',
                left: {
                    type: 'constant',
                    value: 45,
                    valueType: 'number'
                },
                right: {
                    type: 'constant',
                    value: 66,
                    valueType: 'number'
                }
            },
            right: {
                type: 'binary-expression',
                op: 'equals',
                left: {
                    type: 'constant',
                    value: 'tony',
                    valueType: 'string'
                },
                right: {
                    type: 'constant',
                    value: 'tony',
                    valueType: 'string'
                }
            }
        };
        var tree = (0, main_js_1.deserialize)(serialized);
        expect(tree.type).toEqual('binary-expression');
        expect(tree.op).toEqual('and');
        expect(tree.evaluate()).toEqual(false);
        var treeLeft = tree.left;
        var treeRight = tree.right;
        expect(treeLeft.type).toEqual('binary-expression');
        expect(treeLeft.op).toEqual('greater-than');
        expect(treeRight.type).toEqual('binary-expression');
        expect(treeRight.op).toEqual('equals');
        var treeLeftLeft = treeLeft.left;
        var treeLeftRight = treeLeft.right;
        expect(treeLeftLeft.type).toEqual('constant');
        expect(treeLeftLeft.valueType).toEqual('number');
        expect(treeLeftLeft.evaluate()).toEqual(45);
        expect(treeLeftRight.type).toEqual('constant');
        expect(treeLeftRight.valueType).toEqual('number');
        expect(treeLeftRight.evaluate()).toEqual(66);
        var treeRightLeft = treeRight.left;
        var treeRightRight = treeRight.right;
        expect(treeRightLeft.type).toEqual('constant');
        expect(treeRightLeft.valueType).toEqual('string');
        expect(treeRightLeft.evaluate()).toEqual('tony');
        expect(treeRightRight.type).toEqual('constant');
        expect(treeRightRight.valueType).toEqual('string');
        expect(treeRightRight.evaluate()).toEqual('tony');
    });
    describe('operations evaluation', function () {
        //a) if (((X and Y) or Z) and A) then S
        //b) if ((X and Y) or (Z and A)) then S
        it('in order: if (((X and Y) or Z) and A) then S', function () {
            var x = new main_js_1.BooleanExpression(true);
            var y = new main_js_1.BooleanExpression(true);
            var z = new main_js_1.BooleanExpression(true);
            var a = new main_js_1.BooleanExpression(false);
            var tree = new main_js_1.AndExpression(x, y);
            tree = new main_js_1.OrExpression(tree, z);
            tree = new main_js_1.AndExpression(tree, a);
            expect(tree.evaluate()).toEqual(false);
        });
        it('logical: if ((X and Y) or (Z and A)) then S', function () {
            var x = new main_js_1.BooleanExpression(true);
            var y = new main_js_1.BooleanExpression(true);
            var z = new main_js_1.BooleanExpression(true);
            var a = new main_js_1.BooleanExpression(false);
            var xy = new main_js_1.AndExpression(x, y);
            var za = new main_js_1.AndExpression(z, a);
            var xyza = new main_js_1.OrExpression(xy, za);
            expect(xyza.evaluate()).toEqual(true);
        });
    });
    describe('expressions', function () {
        describe('number', function () {
            it('should let users update the value', function () {
                var expr = new main_js_1.NumberExpression(10);
                expr.value = 42;
                expect(expr.value).toEqual(42);
            });
        });
        describe('string', function () {
            it('should let users update the value', function () {
                var expr = new main_js_1.StringExpression('hello');
                expr.value = 'world';
                expect(expr.value).toEqual('world');
            });
        });
        describe('boolean', function () {
            it('should let users update the value', function () {
                var expr = new main_js_1.BooleanExpression(false);
                expr.value = true;
                expect(expr.value).toEqual(true);
            });
        });
        describe('block', function () {
            it('should work', function () {
                new main_js_1.BlockExpression([]);
            });
        });
        describe('if', function () {
            it('should work', function () {
                var value = 23;
                var condition = new main_js_1.BooleanExpression(false);
                var block = new main_js_1.BlockExpression([
                    new TestExpression(function () { return (value = 42); }),
                ]);
                var expr = new main_js_1.IfThenExpression(condition, block);
                expr.evaluate();
                expect(value).toEqual(23);
                condition.value = true;
                expr.evaluate();
                expect(value).toEqual(42);
            });
            it('should parse properly', function () {
                var condition = new main_js_1.BooleanExpression(false);
                var outcome = new TestExpression(function () { });
                var block = new main_js_1.BlockExpression([
                    outcome
                ]);
                var expr = new main_js_1.IfThenExpression(condition, block);
                var result = (0, lib_js_1.parse)(expr);
                expect(result.conditions[0]).toEqual(condition);
                expect(result.outcomes[0]).toEqual(outcome);
            });
        });
    });
});
//# sourceMappingURL=main.test.js.map