import type { AST_TOKEN_TYPES } from '../ast-token-types';
import type { NodeOrTokenData } from './NodeOrTokenData';
export interface BaseToken extends NodeOrTokenData {
    type: AST_TOKEN_TYPES;
    value: string;
}
//# sourceMappingURL=BaseToken.d.ts.map