import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TypeNode } from '../../unions/TypeNode';
export interface TSTypeParameter extends BaseNode {
    type: AST_NODE_TYPES.TSTypeParameter;
    name: Identifier;
    constraint: TypeNode | undefined;
    default: TypeNode | undefined;
    in: boolean;
    out: boolean;
    const: boolean;
}
//# sourceMappingURL=spec.d.ts.map