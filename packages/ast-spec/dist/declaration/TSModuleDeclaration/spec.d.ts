import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';
import type { TSQualifiedName } from '../../type/spec';
import type { Literal } from '../../unions/Literal';
export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';
interface TSModuleDeclarationBase extends BaseNode {
    type: AST_NODE_TYPES.TSModuleDeclaration;
    /**
     * The name of the module
     * ```
     * namespace A {}
     * namespace A.B.C {}
     * module 'a' {}
     * ```
     */
    id: Identifier | Literal | TSQualifiedName;
    /**
     * The body of the module.
     * This can only be `undefined` for the code `declare module 'mod';`
     * This will be a `TSModuleDeclaration` if the name is "nested" (`Foo.Bar`).
     */
    body?: TSModuleBlock;
    /**
     * Whether this is a global declaration
     * ```
     * declare global {}
     * ```
     */
    global: boolean;
    /**
     * Whether the module is `declare`d
     * ```
     * declare namespace F {}
     * ```
     */
    declare: boolean;
    /**
     * The keyword used to define this module declaration
     * ```
     * namespace Foo {}
     * ^^^^^^^^^
     *
     * module 'foo' {}
     * ^^^^^^
     *
     * declare global {}
     *         ^^^^^^
     * ```
     */
    kind: TSModuleDeclarationKind;
}
export interface TSModuleDeclarationNamespace extends TSModuleDeclarationBase {
    kind: 'namespace';
    id: Identifier | TSQualifiedName;
    body: TSModuleBlock;
}
export interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
    kind: 'global';
    body: TSModuleBlock;
    id: Identifier;
}
interface TSModuleDeclarationModuleBase extends TSModuleDeclarationBase {
    kind: 'module';
}
export type TSModuleDeclarationModule = TSModuleDeclarationModuleWithIdentifierId | TSModuleDeclarationModuleWithStringId;
export type TSModuleDeclarationModuleWithStringId = TSModuleDeclarationModuleWithStringIdDeclared | TSModuleDeclarationModuleWithStringIdNotDeclared;
export interface TSModuleDeclarationModuleWithStringIdNotDeclared extends TSModuleDeclarationModuleBase {
    kind: 'module';
    id: StringLiteral;
    declare: false;
    body: TSModuleBlock;
}
export interface TSModuleDeclarationModuleWithStringIdDeclared extends TSModuleDeclarationModuleBase {
    kind: 'module';
    id: StringLiteral;
    declare: true;
    body?: TSModuleBlock;
}
export interface TSModuleDeclarationModuleWithIdentifierId extends TSModuleDeclarationModuleBase {
    kind: 'module';
    id: Identifier;
    body: TSModuleBlock;
}
export type TSModuleDeclaration = TSModuleDeclarationGlobal | TSModuleDeclarationModule | TSModuleDeclarationNamespace;
export {};
//# sourceMappingURL=spec.d.ts.map