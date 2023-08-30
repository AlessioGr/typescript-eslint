import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSExternalModuleReference } from '../../special/TSExternalModuleReference/spec';
import type { EntityName } from '../../unions/EntityName';
import type { ImportKind } from '../ExportAndImportKind';
export interface TSImportEqualsDeclaration extends BaseNode {
    type: AST_NODE_TYPES.TSImportEqualsDeclaration;
    /**
     * The locally imported name
     */
    id: Identifier;
    /**
     * The value being aliased.
     * ```
     * import F1 = A;
     * import F2 = A.B.C;
     * import F3 = require('mod');
     * ```
     */
    moduleReference: EntityName | TSExternalModuleReference;
    importKind: ImportKind;
}
//# sourceMappingURL=spec.d.ts.map