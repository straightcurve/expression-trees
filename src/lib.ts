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
  customDeserializeFn?: (expr: AnySerializedExpression) => Expression,
): Expression {
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

export abstract class Expression {
  constructor(public type: string) { }

  public abstract evaluate(): Promise<any>;
  public abstract evaluateSync(): any;
}

export class ConstantExpression extends Expression {
  constructor(public valueType: string, protected _value: any) {
    super('constant');
    this.valueType = valueType;
  }

  public get value() {
    return this._value;
  }

  public set value(v: any) {
    this._value = v;
  }

  public override async evaluate() {
    return this.value;
  }

  public override evaluateSync() {
    return this.value;
  }
}

export class NumberExpression extends ConstantExpression {
  constructor(value: number) {
    super('number', value);
  }

  public override get value(): number {
    return this._value;
  }

  public override set value(v: number) {
    this._value = v;
  }
}

export class StringExpression extends ConstantExpression {
  constructor(value: any) {
    super('string', value);
  }

  public override get value(): string {
    return this._value;
  }

  public override set value(v: string) {
    this._value = v;
  }
}

export class BooleanExpression extends ConstantExpression {
  constructor(value: any) {
    super('boolean', value);
  }
  public override get value(): boolean {
    return this._value;
  }

  public override set value(v: boolean) {
    this._value = v;
  }
}

export abstract class BinaryExpression extends Expression {
  constructor(
    public op: string,
    public left: Expression,
    public right: Expression,
  ) {
    super('binary-expression');
    this.left = left;
    this.right = right;
  }
}

export class AndExpression extends BinaryExpression {
  constructor(left: Expression, right: Expression) {
    super('and', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) && (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() && this.right.evaluateSync();
  }
}

export class OrExpression extends BinaryExpression {
  constructor(left: Expression, right: Expression) {
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
  constructor(left: Expression, right: Expression) {
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
  constructor(left: Expression, right: Expression) {
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
  constructor(left: Expression, right: Expression) {
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
  constructor(left: Expression, right: Expression) {
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
  constructor(left: Expression, right: Expression) {
    super('equals', left, right);
  }

  public override async evaluate(): Promise<boolean> {
    return (await this.left.evaluate()) === (await this.right.evaluate());
  }

  public override evaluateSync(): boolean {
    return this.left.evaluateSync() === this.right.evaluateSync();
  }
}

export class BlockExpression extends Expression {
  constructor(public expressions: Expression[]) {
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

export class IfThenExpression extends Expression {
  constructor(public condition: Expression, public then: Expression) {
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

export type ExtractedIfThenExpression = {
  conditions: Expression[];
  outcomes: Expression[];
}

export type ExtractIfThenExpressionFn = (expr: IfThenExpression) => ExtractedIfThenExpression;

export const parse: ExtractIfThenExpressionFn = (expr) => {
  let result: ExtractedIfThenExpression = { conditions: [], outcomes: [] };

  switch (expr.condition.type) {
    case "binary-operation": { 
      
      break; }
    default: {
      result.conditions.push(expr.condition);
    }
  }

  return result;
};

