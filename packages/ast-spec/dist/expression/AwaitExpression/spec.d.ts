import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
export interface AwaitExpression extends BaseNode {
    type: AST_NODE_TYPES.AwaitExpression;
    argument: Expression;
}
//# sourceMappingURL=spec.d.ts.map