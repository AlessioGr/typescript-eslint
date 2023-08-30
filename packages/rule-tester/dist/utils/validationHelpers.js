"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_SCENARIOS = exports.emitMissingSchemaWarning = exports.emitLegacyRuleAPIWarning = exports.getCommentsDeprecation = exports.wrapParser = exports.sanitize = exports.FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST = exports.SUGGESTION_OBJECT_PARAMETERS = exports.FRIENDLY_ERROR_OBJECT_PARAMETER_LIST = exports.ERROR_OBJECT_PARAMETERS = exports.RULE_TESTER_PARAMETERS = void 0;
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
/*
 * List every parameters possible on a test case that are not related to eslint
 * configuration
 */
exports.RULE_TESTER_PARAMETERS = [
    'code',
    'defaultFilenames',
    'dependencyConstraints',
    'errors',
    'filename',
    'name',
    'only',
    'options',
    'output',
    'skip',
];
/*
 * All allowed property names in error objects.
 */
exports.ERROR_OBJECT_PARAMETERS = new Set([
    'column',
    'data',
    'endColumn',
    'endLine',
    'line',
    'message',
    'messageId',
    'suggestions',
    'type',
]);
exports.FRIENDLY_ERROR_OBJECT_PARAMETER_LIST = `[${[
    ...exports.ERROR_OBJECT_PARAMETERS,
]
    .map(key => `'${key}'`)
    .join(', ')}]`;
/*
 * All allowed property names in suggestion objects.
 */
exports.SUGGESTION_OBJECT_PARAMETERS = new Set([
    'data',
    'desc',
    'messageId',
    'output',
]);
exports.FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST = `[${[
    ...exports.SUGGESTION_OBJECT_PARAMETERS,
]
    .map(key => `'${key}'`)
    .join(', ')}]`;
/**
 * Replace control characters by `\u00xx` form.
 */
function sanitize(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text.replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u0009\u000b-\u001a]/gu, c => `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}`);
}
exports.sanitize = sanitize;
// this symbol is used internally by ESLint to unwrap the wrapped parser
// https://github.com/eslint/eslint/blob/129e252132c7c476d7de17f40b54a333ddb2e6bb/lib/linter/linter.js#L139-L146
const parserSymbol = Symbol.for('eslint.RuleTester.parser');
/**
 * Wraps the given parser in order to intercept and modify return values from the `parse` and `parseForESLint` methods, for test purposes.
 * In particular, to modify ast nodes, tokens and comments to throw on access to their `start` and `end` properties.
 */
function wrapParser(parser) {
    /**
     * Define `start`/`end` properties of all nodes of the given AST as throwing error.
     */
    function defineStartEndAsErrorInTree(ast, visitorKeys) {
        /**
         * Define `start`/`end` properties as throwing error.
         */
        function defineStartEndAsError(objName, node) {
            Object.defineProperties(node, {
                start: {
                    get() {
                        throw new Error(`Use ${objName}.range[0] instead of ${objName}.start`);
                    },
                    configurable: true,
                    enumerable: false,
                },
                end: {
                    get() {
                        throw new Error(`Use ${objName}.range[1] instead of ${objName}.end`);
                    },
                    configurable: true,
                    enumerable: false,
                },
            });
        }
        (0, typescript_estree_1.simpleTraverse)(ast, {
            visitorKeys: visitorKeys,
            enter: node => defineStartEndAsError('node', node),
        });
        ast.tokens?.forEach(token => defineStartEndAsError('token', token));
        ast.comments?.forEach(comment => defineStartEndAsError('token', comment));
    }
    if ('parseForESLint' in parser) {
        return {
            // @ts-expect-error -- see above
            [parserSymbol]: parser,
            parseForESLint(...args) {
                const ret = parser.parseForESLint(...args);
                defineStartEndAsErrorInTree(ret.ast, ret.visitorKeys);
                return ret;
            },
        };
    }
    return {
        // @ts-expect-error -- see above
        [parserSymbol]: parser,
        parse(...args) {
            const ast = parser.parse(...args);
            defineStartEndAsErrorInTree(ast);
            return ast;
        },
    };
}
exports.wrapParser = wrapParser;
/**
 * Function to replace `SourceCode.prototype.getComments`.
 */
function getCommentsDeprecation() {
    throw new Error('`SourceCode#getComments()` is deprecated and will be removed in a future major version. Use `getCommentsBefore()`, `getCommentsAfter()`, and `getCommentsInside()` instead.');
}
exports.getCommentsDeprecation = getCommentsDeprecation;
const EMIT_LEGACY_RULE_API_WARNING = {};
/**
 * Emit a deprecation warning if function-style format is being used.
 */
function emitLegacyRuleAPIWarning(ruleName) {
    if (!EMIT_LEGACY_RULE_API_WARNING[`warned-${ruleName}`]) {
        EMIT_LEGACY_RULE_API_WARNING[`warned-${ruleName}`] = true;
        process.emitWarning(`"${ruleName}" rule is using the deprecated function-style format and will stop working in ESLint v9. Please use object-style format: https://eslint.org/docs/latest/extend/custom-rules`, 'DeprecationWarning');
    }
}
exports.emitLegacyRuleAPIWarning = emitLegacyRuleAPIWarning;
const EMIT_MISSING_SCHEMA_WARNING = {};
/**
 * Emit a deprecation warning if rule has options but is missing the "meta.schema" property
 */
function emitMissingSchemaWarning(ruleName) {
    if (!EMIT_MISSING_SCHEMA_WARNING[`warned-${ruleName}`]) {
        EMIT_MISSING_SCHEMA_WARNING[`warned-${ruleName}`] = true;
        process.emitWarning(`"${ruleName}" rule has options but is missing the "meta.schema" property and will stop working in ESLint v9. Please add a schema: https://eslint.org/docs/latest/extend/custom-rules#options-schemas`, 'DeprecationWarning');
    }
}
exports.emitMissingSchemaWarning = emitMissingSchemaWarning;
exports.REQUIRED_SCENARIOS = ['valid', 'invalid'];
//# sourceMappingURL=validationHelpers.js.map