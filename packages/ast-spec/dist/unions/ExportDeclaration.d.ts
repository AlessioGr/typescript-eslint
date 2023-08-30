import type { ClassDeclarationWithName, ClassDeclarationWithOptionalName } from '../declaration/ClassDeclaration/spec';
import type { FunctionDeclarationWithName, FunctionDeclarationWithOptionalName } from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { TSEnumDeclaration } from '../declaration/TSEnumDeclaration/spec';
import type { TSImportEqualsDeclaration } from '../declaration/TSImportEqualsDeclaration/spec';
import type { TSInterfaceDeclaration } from '../declaration/TSInterfaceDeclaration/spec';
import type { TSModuleDeclaration } from '../declaration/TSModuleDeclaration/spec';
import type { TSTypeAliasDeclaration } from '../declaration/TSTypeAliasDeclaration/spec';
import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { Expression } from './Expression';
export type DefaultExportDeclarations = ClassDeclarationWithOptionalName | Expression | FunctionDeclarationWithName | FunctionDeclarationWithOptionalName | TSDeclareFunction | TSEnumDeclaration | TSInterfaceDeclaration | TSModuleDeclaration | TSTypeAliasDeclaration | VariableDeclaration;
export type NamedExportDeclarations = ClassDeclarationWithName | ClassDeclarationWithOptionalName | FunctionDeclarationWithName | FunctionDeclarationWithOptionalName | TSDeclareFunction | TSEnumDeclaration | TSImportEqualsDeclaration | TSInterfaceDeclaration | TSModuleDeclaration | TSTypeAliasDeclaration | VariableDeclaration;
export type ExportDeclaration = DefaultExportDeclarations | NamedExportDeclarations;
//# sourceMappingURL=ExportDeclaration.d.ts.map