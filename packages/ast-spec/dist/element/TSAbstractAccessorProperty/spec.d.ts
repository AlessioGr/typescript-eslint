import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { PropertyDefinitionComputedNameBase, PropertyDefinitionNonComputedNameBase } from '../../base/PropertyDefinitionBase';
export interface TSAbstractAccessorPropertyComputedName extends PropertyDefinitionComputedNameBase {
    type: AST_NODE_TYPES.TSAbstractAccessorProperty;
    value: null;
}
export interface TSAbstractAccessorPropertyNonComputedName extends PropertyDefinitionNonComputedNameBase {
    type: AST_NODE_TYPES.TSAbstractAccessorProperty;
    value: null;
}
export type TSAbstractAccessorProperty = TSAbstractAccessorPropertyComputedName | TSAbstractAccessorPropertyNonComputedName;
//# sourceMappingURL=spec.d.ts.map