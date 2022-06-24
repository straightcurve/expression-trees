"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfThenExpression = exports.BlockExpression = exports.EqualsExpression = exports.LessThanOrEqualExpression = exports.GreaterThanOrEqualExpression = exports.LessThanExpression = exports.GreaterThanExpression = exports.OrExpression = exports.AndExpression = exports.BinaryExpression = exports.BooleanExpression = exports.StringExpression = exports.NumberExpression = exports.ConstantExpression = exports.Expression = exports.deserialize = void 0;
const tslib_1 = require("tslib");
function deserialize(sExpression, customDeserializeFn) {
    switch (sExpression.type) {
        case 'constant': {
            const sConstantExpression = sExpression;
            switch (sConstantExpression.valueType) {
                case 'boolean':
                    return new BooleanExpression(sConstantExpression.value);
                case 'number':
                    return new NumberExpression(sConstantExpression.value);
                case 'string':
                    return new StringExpression(sConstantExpression.value);
                default:
                    if (customDeserializeFn)
                        return customDeserializeFn(sExpression);
                    throw new Error(`unknown constant type, ${sConstantExpression.valueType}`);
            }
        }
        case 'binary-expression': {
            const sBinaryExpression = sExpression;
            const left = deserialize(sBinaryExpression.left, customDeserializeFn);
            const right = deserialize(sBinaryExpression.right, customDeserializeFn);
            switch (sBinaryExpression.op) {
                case 'equals':
                    return new EqualsExpression(left, right);
                case 'and':
                    return new AndExpression(left, right);
                case 'or':
                    return new OrExpression(left, right);
                case 'greater-than':
                    return new GreaterThanExpression(left, right);
                case 'less-than':
                    return new LessThanExpression(left, right);
                case 'greater-than-or-equal':
                    return new GreaterThanOrEqualExpression(left, right);
                case 'less-than-or-equal':
                    return new LessThanOrEqualExpression(left, right);
                default:
                    if (customDeserializeFn)
                        return customDeserializeFn(sBinaryExpression);
                    throw new Error(`unknown binary expression type, ${sBinaryExpression.op}`);
            }
        }
        case 'block': {
            const sBlockExpression = sExpression;
            return new BlockExpression(sBlockExpression.expressions.map((se) => deserialize(se, customDeserializeFn)));
        }
        case 'if-then': {
            const sIfThenExpression = sExpression;
            return new IfThenExpression(deserialize(sIfThenExpression.condition, customDeserializeFn), deserialize(sIfThenExpression.then, customDeserializeFn));
        }
        default:
            if (customDeserializeFn)
                return customDeserializeFn(sExpression);
            throw new Error(`unknown expression type, ${sExpression.type}`);
    }
}
exports.deserialize = deserialize;
class Expression {
    constructor(type) {
        this.type = type;
    }
}
exports.Expression = Expression;
class ConstantExpression extends Expression {
    constructor(valueType, _value) {
        super('constant');
        this.valueType = valueType;
        this._value = _value;
        this.valueType = valueType;
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.value;
        });
    }
    evaluateSync() {
        return this.value;
    }
}
exports.ConstantExpression = ConstantExpression;
class NumberExpression extends ConstantExpression {
    constructor(value) {
        super('number', value);
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
}
exports.NumberExpression = NumberExpression;
class StringExpression extends ConstantExpression {
    constructor(value) {
        super('string', value);
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
}
exports.StringExpression = StringExpression;
class BooleanExpression extends ConstantExpression {
    constructor(value) {
        super('boolean', value);
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
}
exports.BooleanExpression = BooleanExpression;
class BinaryExpression extends Expression {
    constructor(op, left, right) {
        super('binary-expression');
        this.op = op;
        this.left = left;
        this.right = right;
        this.left = left;
        this.right = right;
    }
}
exports.BinaryExpression = BinaryExpression;
class AndExpression extends BinaryExpression {
    constructor(left, right) {
        super('and', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) && (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() && this.right.evaluateSync();
    }
}
exports.AndExpression = AndExpression;
class OrExpression extends BinaryExpression {
    constructor(left, right) {
        super('or', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) || (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() || this.right.evaluateSync();
    }
}
exports.OrExpression = OrExpression;
class GreaterThanExpression extends BinaryExpression {
    constructor(left, right) {
        super('greater-than', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) > (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() > this.right.evaluateSync();
    }
}
exports.GreaterThanExpression = GreaterThanExpression;
class LessThanExpression extends BinaryExpression {
    constructor(left, right) {
        super('less-than', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) < (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() < this.right.evaluateSync();
    }
}
exports.LessThanExpression = LessThanExpression;
class GreaterThanOrEqualExpression extends BinaryExpression {
    constructor(left, right) {
        super('greater-than-or-equal', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) >= (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() >= this.right.evaluateSync();
    }
}
exports.GreaterThanOrEqualExpression = GreaterThanOrEqualExpression;
class LessThanOrEqualExpression extends BinaryExpression {
    constructor(left, right) {
        super('less-than-or-equal', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) <= (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() <= this.right.evaluateSync();
    }
}
exports.LessThanOrEqualExpression = LessThanOrEqualExpression;
class EqualsExpression extends BinaryExpression {
    constructor(left, right) {
        super('equals', left, right);
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.left.evaluate()) === (yield this.right.evaluate());
        });
    }
    evaluateSync() {
        return this.left.evaluateSync() === this.right.evaluateSync();
    }
}
exports.EqualsExpression = EqualsExpression;
class BlockExpression extends Expression {
    constructor(expressions) {
        super('block');
        this.expressions = expressions;
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.expressions.length; i++) {
                const expr = this.expressions[i];
                yield expr.evaluate();
            }
        });
    }
    evaluateSync() {
        this.expressions.forEach((e) => e.evaluateSync());
    }
}
exports.BlockExpression = BlockExpression;
class IfThenExpression extends Expression {
    constructor(condition, then) {
        super('if-then');
        this.condition = condition;
        this.then = then;
    }
    evaluate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const check = yield this.condition.evaluate();
            if (check)
                yield this.then.evaluate();
        });
    }
    evaluateSync() {
        if (this.condition.evaluateSync())
            this.then.evaluateSync();
    }
}
exports.IfThenExpression = IfThenExpression;
