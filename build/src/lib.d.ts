export declare type SerializedExpression = {
    type: string;
};
export declare type SerializedConstantExpression = {
    value: any;
    valueType: string;
} & SerializedExpression;
export declare type SerializedBinaryExpression = {
    type: 'binary-expression';
    op: string;
    left: AnySerializedExpression;
    right: AnySerializedExpression;
} & SerializedExpression;
export declare type SerializedBlockExpression = {
    type: 'block';
    expressions: AnySerializedExpression[];
} & SerializedExpression;
export declare type SerializedIfThenExpression = {
    type: 'if-then';
    condition: AnySerializedExpression;
    then: AnySerializedExpression;
} & SerializedExpression;
export declare type AnySerializedExpression = SerializedExpression | SerializedConstantExpression | SerializedBinaryExpression | SerializedBlockExpression | SerializedIfThenExpression;
export declare function deserialize(sExpression: AnySerializedExpression, customDeserializeFn?: (expr: AnySerializedExpression) => Expression): Expression;
export declare abstract class Expression {
    type: string;
    constructor(type: string);
    abstract evaluate(): Promise<any>;
    abstract evaluateSync(): any;
}
export declare class ConstantExpression extends Expression {
    valueType: string;
    protected _value: any;
    constructor(valueType: string, _value: any);
    get value(): any;
    set value(v: any);
    evaluate(): Promise<any>;
    evaluateSync(): any;
}
export declare class NumberExpression extends ConstantExpression {
    constructor(value: number);
    get value(): number;
    set value(v: number);
}
export declare class StringExpression extends ConstantExpression {
    constructor(value: any);
    get value(): string;
    set value(v: string);
}
export declare class BooleanExpression extends ConstantExpression {
    constructor(value: any);
    get value(): boolean;
    set value(v: boolean);
}
export declare abstract class BinaryExpression extends Expression {
    op: string;
    left: Expression;
    right: Expression;
    constructor(op: string, left: Expression, right: Expression);
}
export declare class AndExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class OrExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class GreaterThanExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class LessThanExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class GreaterThanOrEqualExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class LessThanOrEqualExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class EqualsExpression extends BinaryExpression {
    constructor(left: Expression, right: Expression);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class BlockExpression extends Expression {
    expressions: Expression[];
    constructor(expressions: Expression[]);
    evaluate(): Promise<void>;
    evaluateSync(): void;
}
export declare class IfThenExpression extends Expression {
    condition: Expression;
    then: Expression;
    constructor(condition: Expression, then: Expression);
    evaluate(): Promise<void>;
    evaluateSync(): void;
}
