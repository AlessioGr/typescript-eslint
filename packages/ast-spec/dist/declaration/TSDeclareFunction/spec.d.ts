import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { BlockStatement } from '../../statement/BlockStatement/spec';
export interface TSDeclareFunction extends FunctionBase {
    type: AST_NODE_TYPES.TSDeclareFunction;
    body: BlockStatement | undefined;
    declare: boolean;
    expression: false;
}
//# sourceMappingURL=spec.d.ts.map