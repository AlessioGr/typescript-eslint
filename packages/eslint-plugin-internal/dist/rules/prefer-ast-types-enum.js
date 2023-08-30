"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_manager_1 = require("@typescript-eslint/scope-manager");
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const isStringLiteral = (node) => typeof node.value === 'string';
exports.default = (0, util_1.createRule)({
    name: __filename,
    meta: {
        type: 'problem',
        docs: {
            recommended: 'recommended',
            description: 'Enforce consistent usage of `AST_NODE_TYPES`, `AST_TOKEN_TYPES` and `DefinitionType` enums',
        },
        messages: {
            preferEnum: 'Prefer {{ enumName }}.{{ literal }} over raw literal',
        },
        fixable: 'code',
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const report = (enumName, literal) => context.report({
            data: { enumName, literal: literal.value },
            messageId: 'preferEnum',
            node: literal,
            fix: fixer => fixer.replaceText(literal, `${enumName}.${literal.value}`),
        });
        return {
            Literal(node) {
                if (node.parent?.type === utils_1.AST_NODE_TYPES.TSEnumMember &&
                    node.parent.parent?.type === utils_1.AST_NODE_TYPES.TSEnumDeclaration &&
                    ['AST_NODE_TYPES', 'AST_TOKEN_TYPES', 'DefinitionType'].includes(node.parent.parent.id.name)) {
                    return;
                }
                if (!isStringLiteral(node)) {
                    return;
                }
                const value = node.value;
                if (Object.prototype.hasOwnProperty.call(utils_1.AST_NODE_TYPES, value)) {
                    report('AST_NODE_TYPES', node);
                }
                if (Object.prototype.hasOwnProperty.call(utils_1.AST_TOKEN_TYPES, value)) {
                    report('AST_TOKEN_TYPES', node);
                }
                if (Object.prototype.hasOwnProperty.call(scope_manager_1.DefinitionType, value)) {
                    report('DefinitionType', node);
                }
            },
        };
    },
});
//# sourceMappingURL=prefer-ast-types-enum.js.map