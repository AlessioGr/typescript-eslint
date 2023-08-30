"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
/*
TypeScript declares some bad types for certain properties.
See: https://github.com/microsoft/TypeScript/issues/24706

This rule simply warns against using them, as using them will likely introduce type safety holes.
*/
const BANNED_PROPERTIES = [
    // {
    //   type: 'Node',
    //   property: 'parent',
    //   fixWith: null,
    // },
    {
        type: 'Symbol',
        property: 'declarations',
        fixWith: 'getDeclarations()',
    },
    {
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
        type: 'Type',
        property: 'symbol',
        fixWith: 'getSymbol()',
    },
];
exports.default = (0, util_1.createRule)({
    name: 'no-poorly-typed-ts-props',
    meta: {
        type: 'problem',
        docs: {
            description: "Enforce that rules don't use TS API properties with known bad type definitions",
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        hasSuggestions: true,
        schema: [],
        messages: {
            doNotUse: 'Do not use {{type}}.{{property}} because it is poorly typed.',
            doNotUseWithFixer: 'Do not use {{type}}.{{property}} because it is poorly typed. Use {{type}}.{{fixWith}} instead.',
            suggestedFix: 'Use {{type}}.{{fixWith}} instead.',
        },
    },
    defaultOptions: [],
    create(context) {
        const services = utils_1.ESLintUtils.getParserServices(context);
        return {
            'MemberExpression[computed = false]'(node) {
                for (const banned of BANNED_PROPERTIES) {
                    if (node.property.name !== banned.property) {
                        continue;
                    }
                    // make sure the type name matches
                    const objectType = services.getTypeAtLocation(node.object);
                    const objectSymbol = objectType.getSymbol();
                    if (objectSymbol?.getName() !== banned.type) {
                        continue;
                    }
                    const symbol = services.getSymbolAtLocation(node.property);
                    const decls = symbol?.getDeclarations();
                    const isFromTs = decls?.some(decl => decl.getSourceFile().fileName.includes('/node_modules/typescript/'));
                    if (isFromTs !== true) {
                        continue;
                    }
                    return context.report({
                        node,
                        messageId: banned.fixWith ? 'doNotUseWithFixer' : 'doNotUse',
                        data: banned,
                        suggest: [
                            {
                                messageId: 'suggestedFix',
                                data: banned,
                                fix(fixer) {
                                    if (banned.fixWith == null) {
                                        return null;
                                    }
                                    return fixer.replaceText(node.property, banned.fixWith);
                                },
                            },
                        ],
                    });
                }
            },
        };
    },
});
//# sourceMappingURL=no-poorly-typed-ts-props.js.map