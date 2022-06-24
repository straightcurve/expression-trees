import { parse } from '../src/lib.js';
import {
  AndExpression,
  BlockExpression,
  BooleanExpression,
  deserialize,
  EqualsExpression,
  Expression,
  GreaterThanExpression,
  IfThenExpression,
  NumberExpression,
  OrExpression,
  StringExpression,
} from '../src/main.js';

class TestExpression extends Expression {
  constructor(private lambda: () => void) {
    super('test');
  }

  public override evaluate() {
    this.lambda();
  }
}

describe('expression trees', () => {
  it('should deserialize properly', () => {
    let start = {
      type: 'binary-expression',
      op: 'greater-than',
      left: {
        type: 'constant',
        value: 45,
        valueType: 'number',
      },
      right: {
        type: 'constant',
        value: 66,
        valueType: 'number',
      },
    };

    const tree = deserialize(start) as GreaterThanExpression;

    expect(tree.type).toEqual('binary-expression');
    expect(tree.op).toEqual('greater-than');
    expect(tree.evaluate()).toEqual(false);

    expect(tree.left.type).toEqual('constant');
    expect(tree.left.evaluate()).toEqual(45);
    expect(tree.right.type).toEqual('constant');
    expect(tree.right.evaluate()).toEqual(66);
  });

  it('should deserialize properly', () => {
    const serialized = {
      type: 'binary-expression',
      op: 'and',
      left: {
        type: 'binary-expression',
        op: 'greater-than',
        left: {
          type: 'constant',
          value: 45,
          valueType: 'number',
        },
        right: {
          type: 'constant',
          value: 66,
          valueType: 'number',
        },
      },

      right: {
        type: 'binary-expression',
        op: 'equals',
        left: {
          type: 'constant',
          value: 'tony',
          valueType: 'string',
        },
        right: {
          type: 'constant',
          value: 'tony',
          valueType: 'string',
        },
      },
    };

    const tree = deserialize(serialized) as AndExpression;

    expect(tree.type).toEqual('binary-expression');
    expect(tree.op).toEqual('and');
    expect(tree.evaluate()).toEqual(false);

    const treeLeft = tree.left as GreaterThanExpression;
    const treeRight = tree.right as EqualsExpression;

    expect(treeLeft.type).toEqual('binary-expression');
    expect(treeLeft.op).toEqual('greater-than');
    expect(treeRight.type).toEqual('binary-expression');
    expect(treeRight.op).toEqual('equals');

    const treeLeftLeft = treeLeft.left as NumberExpression;
    const treeLeftRight = treeLeft.right as NumberExpression;

    expect(treeLeftLeft.type).toEqual('constant');
    expect(treeLeftLeft.valueType).toEqual('number');
    expect(treeLeftLeft.evaluate()).toEqual(45);
    expect(treeLeftRight.type).toEqual('constant');
    expect(treeLeftRight.valueType).toEqual('number');
    expect(treeLeftRight.evaluate()).toEqual(66);

    const treeRightLeft = treeRight.left as StringExpression;
    const treeRightRight = treeRight.right as StringExpression;

    expect(treeRightLeft.type).toEqual('constant');
    expect(treeRightLeft.valueType).toEqual('string');
    expect(treeRightLeft.evaluate()).toEqual('tony');
    expect(treeRightRight.type).toEqual('constant');
    expect(treeRightRight.valueType).toEqual('string');
    expect(treeRightRight.evaluate()).toEqual('tony');
  });

  describe('operations evaluation', () => {
    //a) if (((X and Y) or Z) and A) then S
    //b) if ((X and Y) or (Z and A)) then S
    it('in order: if (((X and Y) or Z) and A) then S', () => {
      const x = new BooleanExpression(true);
      const y = new BooleanExpression(true);
      const z = new BooleanExpression(true);
      const a = new BooleanExpression(false);

      let tree = new AndExpression(x, y);
      tree = new OrExpression(tree, z);
      tree = new AndExpression(tree, a);

      expect(tree.evaluate()).toEqual(false);
    });

    it('logical: if ((X and Y) or (Z and A)) then S', () => {
      const x = new BooleanExpression(true);
      const y = new BooleanExpression(true);
      const z = new BooleanExpression(true);
      const a = new BooleanExpression(false);

      const xy = new AndExpression(x, y);
      const za = new AndExpression(z, a);
      const xyza = new OrExpression(xy, za);

      expect(xyza.evaluate()).toEqual(true);
    });
  });

  describe('expressions', () => {
    describe('number', () => {
      it('should let users update the value', () => {
        let expr = new NumberExpression(10);

        expr.value = 42;
        expect(expr.value).toEqual(42);
      });
    });

    describe('string', () => {
      it('should let users update the value', () => {
        let expr = new StringExpression('hello');

        expr.value = 'world';
        expect(expr.value).toEqual('world');
      });
    });

    describe('boolean', () => {
      it('should let users update the value', () => {
        let expr = new BooleanExpression(false);
        expr.value = true;
        expect(expr.value).toEqual(true);
      });
    });

    describe('block', () => {
      it('should work', () => {
        new BlockExpression([] as Expression[]);
      });
    });

    describe('if', () => {
      it('should work', () => {
        let value = 23;
        const condition = new BooleanExpression(false);
        const block = new BlockExpression([
          new TestExpression(() => (value = 42)),
        ] as Expression[]);
        const expr = new IfThenExpression(condition, block);

        expr.evaluate();
        expect(value).toEqual(23);

        condition.value = true;

        expr.evaluate();
        expect(value).toEqual(42);
      });

      it('should parse properly', () => {
        const condition = new BooleanExpression(false);
        const outcome =
          new TestExpression(() => { })
        const block = new BlockExpression([
          outcome
        ] as Expression[]);
        const expr = new IfThenExpression(condition, block);

        const result = parse(expr);
        expect(result.conditions[0]).toEqual(condition)
        expect(result.outcomes[0]).toEqual(outcome)
      });
    });
  });
});
