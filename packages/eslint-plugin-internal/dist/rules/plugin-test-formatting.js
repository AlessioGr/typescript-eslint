"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_utils_1 = require("@typescript-eslint/type-utils");
const utils_1 = require("@typescript-eslint/utils");
const prettier_1 = require("prettier");
const util_1 = require("../util");
/*
The strings that are used for eslint plugins will not be checked for formatting.
This can lead to diff noise as one contributor adjusts formatting, uses different quotes, etc.

This rule just enforces the following:
- all code samples are formatted with prettier
- all single line tests do not use backticks
- all multiline tests have:
  - no code on the first line
  - no code on the last line
  - the closing backtick indentation === property indentation
  - one of the following indentations:
    - no indentation at all
    - indentation of 1 + object indent

eg:
[
  'const a = 1;',
  `
const a = 1;
  `,
  `
    const a = 1;
  `,
  {
    code: 'const a = 1',
  }
  {
    code: `
const a = 1;
    `,
  }
  {
    code: `
      const a = 1;
    `,
  }
]
*/
const prettierConfig = prettier_1.resolveConfig.sync(__dirname) ?? {};
const START_OF_LINE_WHITESPACE_MATCHER = /^([ ]*)/;
const BACKTICK_REGEX = /`/g;
const TEMPLATE_EXPR_OPENER = /\$\{/g;
function getExpectedIndentForNode(node, sourceCodeLines) {
    const lineIdx = node.loc.start.line - 1;
    const indent = START_OF_LINE_WHITESPACE_MATCHER.exec(sourceCodeLines[lineIdx])[1];
    return indent.length;
}
function doIndent(line, indent) {
    for (let i = 0; i < indent; i += 1) {
        line = ' ' + line;
    }
    return line;
}
function getQuote(code) {
    const hasSingleQuote = code.includes("'");
    const hasDoubleQuote = code.includes('"');
    if (hasSingleQuote && hasDoubleQuote) {
        // be lazy and make them fix and escape the quotes manually
        return null;
    }
    return hasSingleQuote ? '"' : "'";
}
function escapeTemplateString(code) {
    let fixed = code;
    fixed = fixed.replace(BACKTICK_REGEX, '\\`');
    fixed = fixed.replace(TEMPLATE_EXPR_OPENER, '\\${');
    return fixed;
}
exports.default = (0, util_1.createRule)({
    name: 'plugin-test-formatting',
    meta: {
        type: 'problem',
        docs: {
            description: `Enforce that eslint-plugin test snippets are correctly formatted`,
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    formatWithPrettier: {
                        type: 'boolean',
                    },
                },
            },
        ],
        messages: {
            invalidFormatting: 'This snippet should be formatted correctly. Use the fixer to format the code.',
            invalidFormattingErrorTest: 'This snippet should be formatted correctly. Use the fixer to format the code. Note that the automated fixer may break your test locations.',
            singleLineQuotes: 'Use quotes (\' or ") for single line tests.',
            templateLiteralEmptyEnds: 'Template literals must start and end with an empty line.',
            templateLiteralLastLineIndent: 'The closing line of the template literal must be indented to align with its parent.',
            templateStringRequiresIndent: 'Test code should either have no indent, or be indented {{indent}} spaces.',
            templateStringMinimumIndent: 'Test code should be indented at least {{indent}} spaces.',
            prettierException: 'Prettier was unable to format this snippet: {{message}}',
        },
    },
    defaultOptions: [
        {
            formatWithPrettier: true,
        },
    ],
    create(context, [{ formatWithPrettier }]) {
        const sourceCode = context.getSourceCode();
        const services = utils_1.ESLintUtils.getParserServices(context);
        const checker = services.program.getTypeChecker();
        const checkedObjects = new Set();
        function prettierFormat(code, location) {
            if (formatWithPrettier === false) {
                return null;
            }
            try {
                return (0, prettier_1.format)(code, {
                    ...prettierConfig,
                    parser: 'typescript',
                }).trimEnd(); // prettier will insert a new line at the end of the code
            }
            catch (ex) {
                // adapted from https://github.com/prettier/eslint-plugin-prettier/blob/185b1064d3dd674538456fb2fad97fbfcde49e0d/eslint-plugin-prettier.js#L242-L257
                if (!(ex instanceof SyntaxError)) {
                    throw ex;
                }
                const err = ex;
                let message = err.message;
                if (err.codeFrame) {
                    message = message.replace(`\n${err.codeFrame}`, '');
                }
                if (err.loc) {
                    message = message.replace(/ \(\d+:\d+\)$/, '');
                }
                context.report({
                    node: location,
                    messageId: 'prettierException',
                    data: {
                        message,
                    },
                });
                return null;
            }
        }
        function checkExpression(node, isErrorTest) {
            switch (node?.type) {
                case utils_1.AST_NODE_TYPES.Literal:
                    checkLiteral(node, isErrorTest);
                    break;
                case utils_1.AST_NODE_TYPES.TemplateLiteral:
                    checkTemplateLiteral(node, isErrorTest);
                    break;
                case utils_1.AST_NODE_TYPES.TaggedTemplateExpression:
                    checkTaggedTemplateExpression(node, isErrorTest);
                    break;
                case utils_1.AST_NODE_TYPES.CallExpression:
                    checkCallExpression(node, isErrorTest);
                    break;
            }
        }
        function checkLiteral(literal, isErrorTest, quoteIn) {
            if (typeof literal.value === 'string') {
                const output = prettierFormat(literal.value, literal);
                if (output && output !== literal.value) {
                    context.report({
                        node: literal,
                        messageId: isErrorTest
                            ? 'invalidFormattingErrorTest'
                            : 'invalidFormatting',
                        fix(fixer) {
                            if (output.includes('\n')) {
                                // formatted string is multiline, then have to use backticks
                                return fixer.replaceText(literal, `\`${escapeTemplateString(output)}\``);
                            }
                            const quote = quoteIn ?? getQuote(output);
                            if (quote == null) {
                                return null;
                            }
                            return fixer.replaceText(literal, `${quote}${output}${quote}`);
                        },
                    });
                }
            }
        }
        function checkTemplateLiteral(literal, isErrorTest, isNoFormatTagged = false) {
            if (literal.quasis.length > 1) {
                // ignore template literals with ${expressions} for simplicity
                return;
            }
            const text = literal.quasis[0].value.cooked;
            if (literal.loc.end.line === literal.loc.start.line) {
                // don't use template strings for single line tests
                return context.report({
                    node: literal,
                    messageId: 'singleLineQuotes',
                    fix(fixer) {
                        const quote = getQuote(text);
                        if (quote == null) {
                            return null;
                        }
                        return [
                            fixer.replaceTextRange([literal.range[0], literal.range[0] + 1], quote),
                            fixer.replaceTextRange([literal.range[1] - 1, literal.range[1]], quote),
                        ];
                    },
                });
            }
            const lines = text.split('\n');
            const lastLine = lines[lines.length - 1];
            // prettier will trim out the end of line on save, but eslint will check before then
            const isStartEmpty = lines[0].trimEnd() === '';
            // last line can be indented
            const isEndEmpty = lastLine.trimStart() === '';
            if (!isStartEmpty || !isEndEmpty) {
                // multiline template strings must have an empty first/last line
                return context.report({
                    node: literal,
                    messageId: 'templateLiteralEmptyEnds',
                    *fix(fixer) {
                        if (!isStartEmpty) {
                            yield fixer.replaceTextRange([literal.range[0], literal.range[0] + 1], '`\n');
                        }
                        if (!isEndEmpty) {
                            yield fixer.replaceTextRange([literal.range[1] - 1, literal.range[1]], '\n`');
                        }
                    },
                });
            }
            const parentIndent = getExpectedIndentForNode(literal, sourceCode.lines);
            if (lastLine.length !== parentIndent) {
                return context.report({
                    node: literal,
                    messageId: 'templateLiteralLastLineIndent',
                    fix(fixer) {
                        return fixer.replaceTextRange([literal.range[1] - lastLine.length - 1, literal.range[1]], doIndent('`', parentIndent));
                    },
                });
            }
            // remove the empty lines
            lines.pop();
            lines.shift();
            // +2 because we expect the string contents are indented one level
            const expectedIndent = parentIndent + 2;
            const firstLineIndent = START_OF_LINE_WHITESPACE_MATCHER.exec(lines[0])[1];
            const requiresIndent = firstLineIndent.length > 0;
            if (requiresIndent) {
                if (firstLineIndent.length !== expectedIndent) {
                    return context.report({
                        node: literal,
                        messageId: 'templateStringRequiresIndent',
                        data: {
                            indent: expectedIndent,
                        },
                    });
                }
                // quick-and-dirty validation that lines are roughly indented correctly
                for (const line of lines) {
                    if (line.length === 0) {
                        // empty lines are valid
                        continue;
                    }
                    const matches = START_OF_LINE_WHITESPACE_MATCHER.exec(line);
                    const indent = matches[1];
                    if (indent.length < expectedIndent) {
                        return context.report({
                            node: literal,
                            messageId: 'templateStringMinimumIndent',
                            data: {
                                indent: expectedIndent,
                            },
                        });
                    }
                }
                // trim the lines to remove expectedIndent characters from the start
                // this makes it easier to check formatting
                for (let i = 0; i < lines.length; i += 1) {
                    lines[i] = lines[i].substring(expectedIndent);
                }
            }
            if (isNoFormatTagged) {
                return;
            }
            const code = lines.join('\n');
            const formatted = prettierFormat(code, literal);
            if (formatted && formatted !== code) {
                const formattedIndented = requiresIndent
                    ? formatted
                        .split('\n')
                        .map(l => doIndent(l, expectedIndent))
                        .join('\n')
                    : formatted;
                return context.report({
                    node: literal,
                    messageId: isErrorTest
                        ? 'invalidFormattingErrorTest'
                        : 'invalidFormatting',
                    fix(fixer) {
                        return fixer.replaceText(literal, `\`\n${escapeTemplateString(formattedIndented)}\n${doIndent('', parentIndent)}\``);
                    },
                });
            }
        }
        function isNoFormatTemplateTag(tag) {
            return tag.type === utils_1.AST_NODE_TYPES.Identifier && tag.name === 'noFormat';
        }
        function checkTaggedTemplateExpression(expr, isErrorTest) {
            if (!isNoFormatTemplateTag(expr.tag)) {
                return;
            }
            if (expr.loc.start.line === expr.loc.end.line) {
                // all we do on single line test cases is check format, but there's no formatting to do
                return;
            }
            checkTemplateLiteral(expr.quasi, isErrorTest, isNoFormatTemplateTag(expr.tag));
        }
        function checkCallExpression(callExpr, isErrorTest) {
            if (callExpr.callee.type !== utils_1.AST_NODE_TYPES.MemberExpression) {
                return;
            }
            const memberExpr = callExpr.callee;
            // handle cases like 'aa'.trimRight and `aa`.trimRight()
            checkExpression(memberExpr.object, isErrorTest);
        }
        function checkInvalidTest(test, isErrorTest = true) {
            if (checkedObjects.has(test)) {
                return;
            }
            checkedObjects.add(test);
            for (const prop of test.properties) {
                if (prop.type !== utils_1.AST_NODE_TYPES.Property ||
                    prop.computed ||
                    prop.key.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    continue;
                }
                if (prop.key.name === 'code') {
                    checkExpression(prop.value, isErrorTest);
                }
            }
        }
        function checkValidTest(tests) {
            for (const test of tests.elements) {
                switch (test?.type) {
                    case utils_1.AST_NODE_TYPES.ObjectExpression:
                        // delegate object-style tests to the invalid checker
                        checkInvalidTest(test, false);
                        break;
                    default:
                        checkExpression(test, false);
                        break;
                }
            }
        }
        return {
            // valid
            'CallExpression > ObjectExpression > Property[key.name = "valid"] > ArrayExpression': checkValidTest,
            // invalid - errors
            [[
                utils_1.AST_NODE_TYPES.CallExpression,
                utils_1.AST_NODE_TYPES.ObjectExpression,
                'Property[key.name = "invalid"]',
                utils_1.AST_NODE_TYPES.ArrayExpression,
                utils_1.AST_NODE_TYPES.ObjectExpression,
            ].join(' > ')]: checkInvalidTest,
            // special case for our batchedSingleLineTests utility
            'CallExpression[callee.name = "batchedSingleLineTests"] > ObjectExpression': checkInvalidTest,
            /**
             * generic, type-aware handling for any old object
             * this is a fallback to handle random variables people declare or object
             * literals that are passed via array maps, etc
             */
            ObjectExpression(node) {
                if (checkedObjects.has(node)) {
                    return;
                }
                const type = (0, type_utils_1.getContextualType)(checker, services.esTreeNodeToTSNodeMap.get(node));
                if (!type) {
                    return;
                }
                const typeString = checker.typeToString(type);
                if (/^(TSESLint\.)?RunTests\b/.test(typeString)) {
                    checkedObjects.add(node);
                    for (const prop of node.properties) {
                        if (prop.type === utils_1.AST_NODE_TYPES.SpreadElement ||
                            prop.computed ||
                            prop.key.type !== utils_1.AST_NODE_TYPES.Identifier ||
                            prop.value.type !== utils_1.AST_NODE_TYPES.ArrayExpression) {
                            continue;
                        }
                        switch (prop.key.name) {
                            case 'valid':
                                checkValidTest(prop.value);
                                break;
                            case 'invalid':
                                for (const element of prop.value.elements) {
                                    if (element?.type === utils_1.AST_NODE_TYPES.ObjectExpression) {
                                        checkInvalidTest(element);
                                    }
                                }
                                break;
                        }
                    }
                    return;
                }
                if (/^(TSESLint\.)?ValidTestCase\b/.test(typeString)) {
                    checkInvalidTest(node);
                    return;
                }
                if (/^(TSESLint\.)?InvalidTestCase\b/.test(typeString)) {
                    checkInvalidTest(node);
                    for (const testProp of node.properties) {
                        if (testProp.type === utils_1.AST_NODE_TYPES.SpreadElement ||
                            testProp.computed ||
                            testProp.key.type !== utils_1.AST_NODE_TYPES.Identifier ||
                            testProp.key.name !== 'errors' ||
                            testProp.value.type !== utils_1.AST_NODE_TYPES.ArrayExpression) {
                            continue;
                        }
                        for (const errorElement of testProp.value.elements) {
                            if (errorElement?.type !== utils_1.AST_NODE_TYPES.ObjectExpression) {
                                continue;
                            }
                            checkInvalidTest(errorElement);
                        }
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=plugin-test-formatting.js.map