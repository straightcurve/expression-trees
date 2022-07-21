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
export declare function deserialize(sExpression: AnySerializedExpression, customDeserializeFn?: (expr: AnySerializedExpression) => Expression<any>): Expression<any>;
export declare abstract class Expression<T> {
    type: string;
    constructor(type: string);
    abstract evaluate(): Promise<T>;
    abstract evaluateSync(): T;
}
export declare class ConstantExpression<T> extends Expression<T> {
    valueType: string;
    protected _value: T;
    constructor(valueType: string, _value: T);
    get value(): T;
    set value(v: T);
    evaluate(): Promise<T>;
    evaluateSync(): T;
}
export declare class NumberExpression extends ConstantExpression<number> {
    constructor(value: number);
    get value(): number;
    set value(v: number);
}
export declare class StringExpression extends ConstantExpression<string> {
    constructor(value: string);
    get value(): string;
    set value(v: string);
}
export declare class BooleanExpression extends ConstantExpression<boolean> {
    constructor(value: boolean);
    get value(): boolean;
    set value(v: boolean);
}
export declare abstract class BinaryExpression extends Expression<boolean> {
    op: string;
    left: Expression<any>;
    right: Expression<any>;
    constructor(op: string, left: Expression<any>, right: Expression<any>);
}
export declare class AndExpression extends BinaryExpression {
    constructor(left: Expression<boolean>, right: Expression<boolean>);
    evaluate(): Promise<any>;
    evaluateSync(): any;
}
export declare class OrExpression extends BinaryExpression {
    constructor(left: Expression<boolean>, right: Expression<boolean>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class GreaterThanExpression extends BinaryExpression {
    constructor(left: Expression<number>, right: Expression<number>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class LessThanExpression extends BinaryExpression {
    constructor(left: Expression<number>, right: Expression<number>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class GreaterThanOrEqualExpression extends BinaryExpression {
    constructor(left: Expression<number>, right: Expression<number>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class LessThanOrEqualExpression extends BinaryExpression {
    constructor(left: Expression<number>, right: Expression<number>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class EqualsExpression extends BinaryExpression {
    constructor(left: Expression<any>, right: Expression<any>);
    evaluate(): Promise<boolean>;
    evaluateSync(): boolean;
}
export declare class BlockExpression extends Expression<any> {
    expressions: Expression<any>[];
    constructor(expressions: Expression<any>[]);
    evaluate(): Promise<void>;
    evaluateSync(): void;
}
export declare class IfThenExpression extends Expression<any> {
    condition: Expression<boolean>;
    then: Expression<any>;
    constructor(condition: Expression<boolean>, then: Expression<any>);
    evaluate(): Promise<void>;
    evaluateSync(): void;
}
