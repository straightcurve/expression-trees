export type SerializedExpression = {
  type: string;
};

export type SerializedConstantExpression = {
  value: any;
  valueType: string;
} & SerializedExpression;

export type SerializedBinaryExpression = {
  type: 'binary-expression';
  op: string;
  left: AnySerializedExpression;
  right: AnySerializedExpression;
} & SerializedExpression;

export type SerializedBlockExpression = {
  type: 'block';
  expressions: AnySerializedExpression[];
} & SerializedExpression;

export type SerializedIfThenExpression = {
  type: 'if-then';
  condition: AnySerializedExpression;
  then: AnySerializedExpression;
} & SerializedExpression;

export type AnySerializedExpression =
  | SerializedExpression
  | SerializedConstantExpression
  | SerializedBinaryExpression
  | SerializedBlockExpression
  | SerializedIfThenExpression;

export function deserialize(
  sExpression: AnySerializedExpression,
  customDeserializeFn?: (expr: AnySerializedExpression) => Expression<any>,
): Expression<any> {
  switch (sExpression.type) {
    case 'constant': {
      const sConstantExpression = sExpression as SerializedConstantExpression;
      switch (sConstantExpression.valueType) {
        case 'boolean':
          return new BooleanExpression(sConstantExpression.value);
        case 'number':
          return new NumberExpression(sConstantExpression.value);
        case 'string':
          return new StringExpression(sConstantExpression.value);
        default:
          if (customDeserializeFn) return customDeserializeFn(sExpression);

          throw new Error(
            `unknown constant type, ${sConstantExpression.valueType}`,
          );
      }
    }

    case 'binary-expression': {
      const sBinaryExpression = sExpression as SerializedBinaryExpression;
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

          throw new Error(
            `unknown binary expression type, ${sBinaryExpression.op}`,
          );
      }
    }
    case 'block': {
      const sBlockExpression = sExpression as SerializedBlockExpression;

      return new BlockExpression(
        sBlockExpression.expressions.map((se) =>
          deserialize(se, customDeserializeFn),
        ),
      );
    }
    case 'if-then': {
      const sIfThenExpression = sExpression as SerializedIfThenExpression;

      return new IfThenExpression(
        deserialize(sIfThenExpression.condition, customDeserializeFn),
        deserialize(sIfThenExpression.then, customDeserializeFn),
      );
    }
    default:
      if (customDeserializeFn) return customDeserializeFn(sExpression);

      throw new Error(`unknown expression type, ${sExpression.type}`);
  }
}

export abstract class Expression<T> {
  constructor(public type: string) {}

  public abstract evaluate(): Promise<T>;
  public abstract evaluateSync(): T;
}

export class ConstantExpression<T> extends Expression<T> {
  constructor(public valueType: string, protected _value: T) {
    super('constant');
    this.valueType = valueType;
  }

  public get value() {
    return this._value;
  }

  public set value(v: T) {
    this._value = v;
  }

  public override async evaluate() {
    return this.value;
  }

  public override evaluateSync() {
    return this.value;
  }
}

export class NumberExpression extends ConstantExpression<number> {
  constructor(value: number) {
    super('number', value);
  }

  public override get value() {
    return this._value;
  }

  public override set value(v) {
    this._value = v;
  }
}

export class StringExpression extends ConstantExpression<string> {
  constructor(value: string) {
    super('string', value);
  }

  public override get value() {
    return this._value;
  }

  public override set value(v) {
    this._value = v;
  }
}

export class BooleanExpression extends ConstantExpression<boolean> {
  constructor(value: boolean) {
    super('boolean', value);
  }
  public override get value() {
    return this._value;
  }

  public override set value(v) {
    this._value = v;
  }
}

export abstract class BinaryExpression extends Expression<boolean> {
  constructor(
    public op: string,
    public left: Expression<any>,
    public right: Expression<any>,
  ) {
    super('binary-expression');
    this.left = left;
    this.right = right;
  }
}

export class AndExpression extends BinaryExpression {
  constructor(left: Expression<boolean>, right: Expression<boolean>) {
    super('and', left, right);
  }

  public override async evaluate() {
    return (await this.left.evaluate()) && (await this.right.evaluate());
  }

  public override evaluateSync() {
    return this.left.evaluateSync() && this.right.evaluateSync();
  }
}

export class OrExpression extends BinaryExpression {
  constructor(left: Expression<boolean>, right: Expression<boolean>) {
    super('or', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) || (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() || this.right.evaluateSync();
  }
}

export class GreaterThanExpression extends BinaryExpression {
  constructor(left: Expression<number>, right: Expression<number>) {
    super('greater-than', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) > (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() > this.right.evaluateSync();
  }
}

export class LessThanExpression extends BinaryExpression {
  constructor(left: Expression<number>, right: Expression<number>) {
    super('less-than', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) < (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() < this.right.evaluateSync();
  }
}

export class GreaterThanOrEqualExpression extends BinaryExpression {
  constructor(left: Expression<number>, right: Expression<number>) {
    super('greater-than-or-equal', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) >= (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() >= this.right.evaluateSync();
  }
}

export class LessThanOrEqualExpression extends BinaryExpression {
  constructor(left: Expression<number>, right: Expression<number>) {
    super('less-than-or-equal', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) <= (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() <= this.right.evaluateSync();
  }
}

export class EqualsExpression extends BinaryExpression {
  constructor(left: Expression<any>, right: Expression<any>) {
    super('equals', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) === (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() === this.right.evaluateSync();
  }
}

export class BlockExpression extends Expression<any> {
  constructor(public expressions: Expression<any>[]) {
    super('block');
  }

  public override async evaluate(): Promise<void> {
    for (let i = 0; i < this.expressions.length; i++) {
      const expr = this.expressions[i];
      await expr.evaluate();
    }
  }

  public override evaluateSync(): void {
    this.expressions.forEach((e) => e.evaluateSync());
  }
}

export class IfThenExpression extends Expression<any> {
  constructor(
    public condition: Expression<boolean>,
    public then: Expression<any>,
  ) {
    super('if-then');
  }

  public override async evaluate(): Promise<void> {
    const check = await this.condition.evaluate();
    if (check) await this.then.evaluate();
  }

  public override evaluateSync(): void {
    if (this.condition.evaluateSync()) this.then.evaluateSync();
  }
}
