"use strict";
// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/rule-tester/rule-tester.js
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _RuleTester_instances, _RuleTester_testerConfig, _RuleTester_rules, _RuleTester_linter, _RuleTester_normalizeTests, _RuleTester_testValidTemplate, _RuleTester_testInvalidTemplate;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleTester = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = __importDefault(require("node:util"));
const eslint_utils_1 = require("@typescript-eslint/utils/eslint-utils");
const ts_eslint_1 = require("@typescript-eslint/utils/ts-eslint");
// we intentionally import from eslint here because we need to use the same class
// that ESLint uses, not our custom override typed version
const eslint_1 = require("eslint");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const TestFramework_1 = require("./TestFramework");
const ajv_1 = require("./utils/ajv");
const cloneDeeplyExcludesParent_1 = require("./utils/cloneDeeplyExcludesParent");
const config_validator_1 = require("./utils/config-validator");
const dependencyConstraints_1 = require("./utils/dependencyConstraints");
const freezeDeeply_1 = require("./utils/freezeDeeply");
const getRuleOptionsSchema_1 = require("./utils/getRuleOptionsSchema");
const hasOwnProperty_1 = require("./utils/hasOwnProperty");
const interpolate_1 = require("./utils/interpolate");
const isReadonlyArray_1 = require("./utils/isReadonlyArray");
const SourceCodeFixer = __importStar(require("./utils/SourceCodeFixer"));
const validationHelpers_1 = require("./utils/validationHelpers");
const ajv = (0, ajv_1.ajvBuilder)({ strictDefaults: true });
const TYPESCRIPT_ESLINT_PARSER = '@typescript-eslint/parser';
const DUPLICATE_PARSER_ERROR_MESSAGE = `Do not set the parser at the test level unless you want to use a parser other than "${TYPESCRIPT_ESLINT_PARSER}"`;
/*
 * testerDefaultConfig must not be modified as it allows to reset the tester to
 * the initial default configuration
 */
const testerDefaultConfig = {
    parser: TYPESCRIPT_ESLINT_PARSER,
    rules: {},
    defaultFilenames: { ts: 'file.ts', tsx: 'react.tsx' },
};
let defaultConfig = (0, eslint_utils_1.deepMerge)({}, testerDefaultConfig);
class RuleTester extends TestFramework_1.TestFramework {
    /**
     * Creates a new instance of RuleTester.
     */
    constructor(testerConfig) {
        super();
        _RuleTester_instances.add(this);
        _RuleTester_testerConfig.set(this, void 0);
        _RuleTester_rules.set(this, {});
        _RuleTester_linter.set(this, new ts_eslint_1.Linter());
        /**
         * The configuration to use for this tester. Combination of the tester
         * configuration and the default configuration.
         */
        __classPrivateFieldSet(this, _RuleTester_testerConfig, (0, lodash_merge_1.default)({}, defaultConfig, testerConfig, {
            rules: { 'rule-tester/validate-ast': 'error' },
            // as of eslint 6 you have to provide an absolute path to the parser
            // but that's not as clean to type, this saves us trying to manually enforce
            // that contributors require.resolve everything
            parser: require.resolve((testerConfig ?? defaultConfig).parser),
        }), "f");
        // make sure that the parser doesn't hold onto file handles between tests
        // on linux (i.e. our CI env), there can be very a limited number of watch handles available
        const constructor = this.constructor;
        constructor.afterAll(() => {
            try {
                // instead of creating a hard dependency, just use a soft require
                // a bit weird, but if they're using this tooling, it'll be installed
                const parser = require(TYPESCRIPT_ESLINT_PARSER);
                parser.clearCaches();
            }
            catch {
                // ignored on purpose
            }
        });
    }
    /**
     * Set the configuration to use for all future tests
     */
    static setDefaultConfig(config) {
        if (typeof config !== 'object' || config == null) {
            throw new TypeError('RuleTester.setDefaultConfig: config must be an object');
        }
        // Make sure the rules object exists since it is assumed to exist later
        defaultConfig = (0, eslint_utils_1.deepMerge)(defaultConfig, 
        // @ts-expect-error -- no index signature
        config);
    }
    /**
     * Get the current configuration used for all tests
     */
    static getDefaultConfig() {
        return defaultConfig;
    }
    /**
     * Reset the configuration to the initial configuration of the tester removing
     * any changes made until now.
     */
    static resetDefaultConfig() {
        defaultConfig = (0, lodash_merge_1.default)({}, testerDefaultConfig);
    }
    static only(item) {
        if (typeof item === 'string') {
            return { code: item, only: true };
        }
        return { ...item, only: true };
    }
    /**
     * Define a rule for one particular run of tests.
     */
    defineRule(name, rule) {
        __classPrivateFieldGet(this, _RuleTester_rules, "f")[name] = rule;
    }
    /**
     * Adds a new rule test to execute.
     */
    run(ruleName, rule, test) {
        const constructor = this.constructor;
        if (__classPrivateFieldGet(this, _RuleTester_testerConfig, "f").dependencyConstraints &&
            !(0, dependencyConstraints_1.satisfiesAllDependencyConstraints)(__classPrivateFieldGet(this, _RuleTester_testerConfig, "f").dependencyConstraints)) {
            // for frameworks like mocha or jest that have a "skip" version of their function
            // we can provide a nice skipped test!
            constructor.describeSkip(ruleName, () => {
                constructor.it('All tests skipped due to unsatisfied constructor dependency constraints', () => {
                    // some frameworks error if there are no assertions
                    node_assert_1.default.equal(true, true);
                });
            });
            // don't run any tests because we don't match the base constraint
            return;
        }
        if (!test || typeof test !== 'object') {
            throw new TypeError(`Test Scenarios for rule ${ruleName} : Could not find test scenario object`);
        }
        const scenarioErrors = [];
        validationHelpers_1.REQUIRED_SCENARIOS.forEach(scenarioType => {
            if (!test[scenarioType]) {
                scenarioErrors.push(`Could not find any ${scenarioType} test scenarios`);
            }
        });
        if (scenarioErrors.length > 0) {
            throw new Error([
                `Test Scenarios for rule ${ruleName} is invalid:`,
                ...scenarioErrors,
            ].join('\n'));
        }
        if (typeof rule === 'function') {
            (0, validationHelpers_1.emitLegacyRuleAPIWarning)(ruleName);
        }
        __classPrivateFieldGet(this, _RuleTester_linter, "f").defineRule(ruleName, Object.assign({}, rule, {
            // Create a wrapper rule that freezes the `context` properties.
            create(context) {
                (0, freezeDeeply_1.freezeDeeply)(context.options);
                (0, freezeDeeply_1.freezeDeeply)(context.settings);
                (0, freezeDeeply_1.freezeDeeply)(context.parserOptions);
                return (typeof rule === 'function' ? rule : rule.create)(context);
            },
        }));
        __classPrivateFieldGet(this, _RuleTester_linter, "f").defineRules(__classPrivateFieldGet(this, _RuleTester_rules, "f"));
        const normalizedTests = __classPrivateFieldGet(this, _RuleTester_instances, "m", _RuleTester_normalizeTests).call(this, test);
        function getTestMethod(test) {
            if (test.skip) {
                return 'itSkip';
            }
            if (test.only) {
                return 'itOnly';
            }
            return 'it';
        }
        /*
         * This creates a test suite and pipes all supplied info through
         * one of the templates above.
         */
        constructor.describe(ruleName, () => {
            constructor.describe('valid', () => {
                normalizedTests.valid.forEach(valid => {
                    const testName = (() => {
                        if (valid.name == null || valid.name.length === 0) {
                            return valid.code;
                        }
                        return valid.name;
                    })();
                    constructor[getTestMethod(valid)]((0, validationHelpers_1.sanitize)(testName), () => {
                        __classPrivateFieldGet(this, _RuleTester_instances, "m", _RuleTester_testValidTemplate).call(this, ruleName, rule, valid);
                    });
                });
            });
            constructor.describe('invalid', () => {
                normalizedTests.invalid.forEach(invalid => {
                    const name = (() => {
                        if (invalid.name == null || invalid.name.length === 0) {
                            return invalid.code;
                        }
                        return invalid.name;
                    })();
                    constructor[getTestMethod(invalid)]((0, validationHelpers_1.sanitize)(name), () => {
                        __classPrivateFieldGet(this, _RuleTester_instances, "m", _RuleTester_testInvalidTemplate).call(this, ruleName, rule, invalid);
                    });
                });
            });
        });
    }
    /**
     * Run the rule for the given item
     * @throws {Error} If an invalid schema.
     * Use @private instead of #private to expose it for testing purposes
     */
    runRuleForItem(ruleName, rule, item) {
        let config = (0, lodash_merge_1.default)({}, __classPrivateFieldGet(this, _RuleTester_testerConfig, "f"));
        let code;
        let filename;
        let output;
        let beforeAST;
        let afterAST;
        if (typeof item === 'string') {
            code = item;
        }
        else {
            code = item.code;
            /*
             * Assumes everything on the item is a config except for the
             * parameters used by this tester
             */
            const itemConfig = { ...item };
            for (const parameter of validationHelpers_1.RULE_TESTER_PARAMETERS) {
                delete itemConfig[parameter];
            }
            /*
             * Create the config object from the tester config and this item
             * specific configurations.
             */
            config = (0, lodash_merge_1.default)(config, itemConfig);
        }
        if (item.filename) {
            filename = item.filename;
        }
        if ((0, hasOwnProperty_1.hasOwnProperty)(item, 'options')) {
            (0, node_assert_1.default)(Array.isArray(item.options), 'options must be an array');
            if (item.options.length > 0 &&
                typeof rule === 'object' &&
                (!rule.meta || (rule.meta && rule.meta.schema == null))) {
                (0, validationHelpers_1.emitMissingSchemaWarning)(ruleName);
            }
            config.rules[ruleName] = ['error', ...item.options];
        }
        else {
            config.rules[ruleName] = 'error';
        }
        const schema = (0, getRuleOptionsSchema_1.getRuleOptionsSchema)(rule);
        /*
         * Setup AST getters.
         * The goal is to check whether or not AST was modified when
         * running the rule under test.
         */
        __classPrivateFieldGet(this, _RuleTester_linter, "f").defineRule('rule-tester/validate-ast', {
            create() {
                return {
                    Program(node) {
                        beforeAST = (0, cloneDeeplyExcludesParent_1.cloneDeeplyExcludesParent)(node);
                    },
                    'Program:exit'(node) {
                        afterAST = node;
                    },
                };
            },
        });
        if (typeof config.parser === 'string') {
            (0, node_assert_1.default)(node_path_1.default.isAbsolute(config.parser), 'Parsers provided as strings to RuleTester must be absolute paths');
        }
        else {
            config.parser = require.resolve(TYPESCRIPT_ESLINT_PARSER);
        }
        __classPrivateFieldGet(this, _RuleTester_linter, "f").defineParser(config.parser, (0, validationHelpers_1.wrapParser)(require(config.parser)));
        if (schema) {
            ajv.validateSchema(schema);
            if (ajv.errors) {
                const errors = ajv.errors
                    .map(error => {
                    const field = error.dataPath[0] === '.'
                        ? error.dataPath.slice(1)
                        : error.dataPath;
                    return `\t${field}: ${error.message}`;
                })
                    .join('\n');
                throw new Error([`Schema for rule ${ruleName} is invalid:`, errors].join(
                // no space after comma to match eslint core
                ','));
            }
            /*
             * `ajv.validateSchema` checks for errors in the structure of the schema (by comparing the schema against a "meta-schema"),
             * and it reports those errors individually. However, there are other types of schema errors that only occur when compiling
             * the schema (e.g. using invalid defaults in a schema), and only one of these errors can be reported at a time. As a result,
             * the schema is compiled here separately from checking for `validateSchema` errors.
             */
            try {
                ajv.compile(schema);
            }
            catch (err) {
                throw new Error(`Schema for rule ${ruleName} is invalid: ${err.message}`);
            }
        }
        (0, config_validator_1.validate)(config, 'rule-tester', id => (id === ruleName ? rule : null));
        // Verify the code.
        // @ts-expect-error -- we don't define deprecated members on our types
        const { getComments } = eslint_1.SourceCode.prototype;
        let messages;
        try {
            // @ts-expect-error -- we don't define deprecated members on our types
            eslint_1.SourceCode.prototype.getComments = validationHelpers_1.getCommentsDeprecation;
            messages = __classPrivateFieldGet(this, _RuleTester_linter, "f").verify(code, config, filename);
        }
        finally {
            // @ts-expect-error -- we don't define deprecated members on our types
            eslint_1.SourceCode.prototype.getComments = getComments;
        }
        const fatalErrorMessage = messages.find(m => m.fatal);
        (0, node_assert_1.default)(!fatalErrorMessage, `A fatal parsing error occurred: ${fatalErrorMessage?.message}`);
        // Verify if autofix makes a syntax error or not.
        if (messages.some(m => m.fix)) {
            output = SourceCodeFixer.applyFixes(code, messages).output;
            const errorMessageInFix = __classPrivateFieldGet(this, _RuleTester_linter, "f")
                .verify(output, config, filename)
                .find(m => m.fatal);
            (0, node_assert_1.default)(!errorMessageInFix, [
                'A fatal parsing error occurred in autofix.',
                `Error: ${errorMessageInFix?.message}`,
                'Autofix output:',
                output,
            ].join('\n'));
        }
        else {
            output = code;
        }
        return {
            messages,
            output,
            // is definitely assigned within the `rule-tester/validate-ast` rule
            beforeAST: beforeAST,
            // is definitely assigned within the `rule-tester/validate-ast` rule
            afterAST: (0, cloneDeeplyExcludesParent_1.cloneDeeplyExcludesParent)(afterAST),
        };
    }
}
exports.RuleTester = RuleTester;
_RuleTester_testerConfig = new WeakMap(), _RuleTester_rules = new WeakMap(), _RuleTester_linter = new WeakMap(), _RuleTester_instances = new WeakSet(), _RuleTester_normalizeTests = function _RuleTester_normalizeTests(rawTests) {
    /*
    Automatically add a filename to the tests to enable type-aware tests to "just work".
    This saves users having to verbosely and manually add the filename to every
    single test case.
    Hugely helps with the string-based valid test cases as it means they don't
    need to be made objects!
    */
    const getFilename = (testOptions) => {
        const resolvedOptions = (0, eslint_utils_1.deepMerge)(__classPrivateFieldGet(this, _RuleTester_testerConfig, "f").parserOptions, testOptions);
        const filename = resolvedOptions.ecmaFeatures?.jsx
            ? __classPrivateFieldGet(this, _RuleTester_testerConfig, "f").defaultFilenames.tsx
            : __classPrivateFieldGet(this, _RuleTester_testerConfig, "f").defaultFilenames.ts;
        if (resolvedOptions.project) {
            return node_path_1.default.join(resolvedOptions.tsconfigRootDir ?? process.cwd(), filename);
        }
        return filename;
    };
    const normalizeTest = (test) => {
        if (test.parser === TYPESCRIPT_ESLINT_PARSER) {
            throw new Error(DUPLICATE_PARSER_ERROR_MESSAGE);
        }
        if (!test.filename) {
            return {
                ...test,
                filename: getFilename(test.parserOptions),
            };
        }
        return test;
    };
    const normalizedTests = {
        valid: rawTests.valid
            .map(test => {
            if (typeof test === 'string') {
                return { code: test };
            }
            return test;
        })
            .map(normalizeTest),
        invalid: rawTests.invalid.map(normalizeTest),
    };
    // convenience iterator to make it easy to loop all tests without a concat
    const allTestsIterator = {
        *[Symbol.iterator]() {
            for (const testCase of normalizedTests.valid) {
                yield testCase;
            }
            for (const testCase of normalizedTests.invalid) {
                yield testCase;
            }
        },
    };
    const hasOnly = (() => {
        for (const test of allTestsIterator) {
            if (test.only) {
                return true;
            }
        }
        return false;
    })();
    if (hasOnly) {
        // if there is an `only: true` - don't try apply constraints - assume that
        // we are in "local development" mode rather than "CI validation" mode
        return normalizedTests;
    }
    const hasConstraints = (() => {
        for (const test of allTestsIterator) {
            if (test.dependencyConstraints &&
                Object.keys(test.dependencyConstraints).length > 0) {
                return true;
            }
        }
        return false;
    })();
    if (!hasConstraints) {
        return normalizedTests;
    }
    /*
    Mark all unsatisfactory tests as `skip: true`.
    We do this instead of just omitting the tests entirely because it gives the
    test framework the opportunity to log the test as skipped rather than the test
    just disappearing without a trace.
    */
    const maybeMarkAsOnly = (test) => {
        return {
            ...test,
            skip: !(0, dependencyConstraints_1.satisfiesAllDependencyConstraints)(test.dependencyConstraints),
        };
    };
    normalizedTests.valid = normalizedTests.valid.map(maybeMarkAsOnly);
    normalizedTests.invalid = normalizedTests.invalid.map(maybeMarkAsOnly);
    return normalizedTests;
}, _RuleTester_testValidTemplate = function _RuleTester_testValidTemplate(ruleName, rule, itemIn) {
    const item = typeof itemIn === 'object' ? itemIn : { code: itemIn };
    node_assert_1.default.ok(typeof item.code === 'string', "Test case must specify a string value for 'code'");
    if (item.name) {
        node_assert_1.default.ok(typeof item.name === 'string', "Optional test case property 'name' must be a string");
    }
    const result = this.runRuleForItem(ruleName, rule, item);
    const messages = result.messages;
    node_assert_1.default.strictEqual(messages.length, 0, node_util_1.default.format('Should have no errors but had %d: %s', messages.length, node_util_1.default.inspect(messages)));
    assertASTDidntChange(result.beforeAST, result.afterAST);
}, _RuleTester_testInvalidTemplate = function _RuleTester_testInvalidTemplate(ruleName, rule, item) {
    node_assert_1.default.ok(typeof item.code === 'string', "Test case must specify a string value for 'code'");
    if (item.name) {
        node_assert_1.default.ok(typeof item.name === 'string', "Optional test case property 'name' must be a string");
    }
    node_assert_1.default.ok(item.errors || item.errors === 0, `Did not specify errors for an invalid test of ${ruleName}`);
    if (Array.isArray(item.errors) && item.errors.length === 0) {
        node_assert_1.default.fail('Invalid cases must have at least one error');
    }
    const ruleHasMetaMessages = (0, hasOwnProperty_1.hasOwnProperty)(rule, 'meta') && (0, hasOwnProperty_1.hasOwnProperty)(rule.meta, 'messages');
    const friendlyIDList = ruleHasMetaMessages
        ? `[${Object.keys(rule.meta.messages)
            .map(key => `'${key}'`)
            .join(', ')}]`
        : null;
    const result = this.runRuleForItem(ruleName, rule, item);
    const messages = result.messages;
    if (typeof item.errors === 'number') {
        if (item.errors === 0) {
            node_assert_1.default.fail("Invalid cases must have 'error' value greater than 0");
        }
        node_assert_1.default.strictEqual(messages.length, item.errors, node_util_1.default.format('Should have %d error%s but had %d: %s', item.errors, item.errors === 1 ? '' : 's', messages.length, node_util_1.default.inspect(messages)));
    }
    else {
        node_assert_1.default.strictEqual(messages.length, item.errors.length, node_util_1.default.format('Should have %d error%s but had %d: %s', item.errors.length, item.errors.length === 1 ? '' : 's', messages.length, node_util_1.default.inspect(messages)));
        const hasMessageOfThisRule = messages.some(m => m.ruleId === ruleName);
        for (let i = 0, l = item.errors.length; i < l; i++) {
            const error = item.errors[i];
            const message = messages[i];
            (0, node_assert_1.default)(hasMessageOfThisRule, 'Error rule name should be the same as the name of the rule being tested');
            if (typeof error === 'string' || error instanceof RegExp) {
                // Just an error message.
                assertMessageMatches(message.message, error);
            }
            else if (typeof error === 'object' && error != null) {
                /*
                 * Error object.
                 * This may have a message, messageId, data, node type, line, and/or
                 * column.
                 */
                Object.keys(error).forEach(propertyName => {
                    node_assert_1.default.ok(validationHelpers_1.ERROR_OBJECT_PARAMETERS.has(propertyName), `Invalid error property name '${propertyName}'. Expected one of ${validationHelpers_1.FRIENDLY_ERROR_OBJECT_PARAMETER_LIST}.`);
                });
                // @ts-expect-error -- we purposely don't define `message` on our types as the current standard is `messageId`
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'message')) {
                    node_assert_1.default.ok(!(0, hasOwnProperty_1.hasOwnProperty)(error, 'messageId'), "Error should not specify both 'message' and a 'messageId'.");
                    node_assert_1.default.ok(!(0, hasOwnProperty_1.hasOwnProperty)(error, 'data'), "Error should not specify both 'data' and 'message'.");
                    assertMessageMatches(message.message, 
                    // @ts-expect-error -- we purposely don't define `message` on our types as the current standard is `messageId`
                    error.message);
                }
                else if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'messageId')) {
                    node_assert_1.default.ok(ruleHasMetaMessages, "Error can not use 'messageId' if rule under test doesn't define 'meta.messages'.");
                    if (!(0, hasOwnProperty_1.hasOwnProperty)(rule.meta.messages, error.messageId)) {
                        (0, node_assert_1.default)(false, `Invalid messageId '${error.messageId}'. Expected one of ${friendlyIDList}.`);
                    }
                    node_assert_1.default.strictEqual(message.messageId, error.messageId, `messageId '${message.messageId}' does not match expected messageId '${error.messageId}'.`);
                    if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'data')) {
                        /*
                         *  if data was provided, then directly compare the returned message to a synthetic
                         *  interpolated message using the same message ID and data provided in the test.
                         *  See https://github.com/eslint/eslint/issues/9890 for context.
                         */
                        const unformattedOriginalMessage = rule.meta.messages[error.messageId];
                        const rehydratedMessage = (0, interpolate_1.interpolate)(unformattedOriginalMessage, error.data);
                        node_assert_1.default.strictEqual(message.message, rehydratedMessage, `Hydrated message "${rehydratedMessage}" does not match "${message.message}"`);
                    }
                }
                node_assert_1.default.ok((0, hasOwnProperty_1.hasOwnProperty)(error, 'data')
                    ? (0, hasOwnProperty_1.hasOwnProperty)(error, 'messageId')
                    : true, "Error must specify 'messageId' if 'data' is used.");
                if (error.type) {
                    node_assert_1.default.strictEqual(message.nodeType, error.type, `Error type should be ${error.type}, found ${message.nodeType}`);
                }
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'line')) {
                    node_assert_1.default.strictEqual(message.line, error.line, `Error line should be ${error.line}`);
                }
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'column')) {
                    node_assert_1.default.strictEqual(message.column, error.column, `Error column should be ${error.column}`);
                }
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'endLine')) {
                    node_assert_1.default.strictEqual(message.endLine, error.endLine, `Error endLine should be ${error.endLine}`);
                }
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'endColumn')) {
                    node_assert_1.default.strictEqual(message.endColumn, error.endColumn, `Error endColumn should be ${error.endColumn}`);
                }
                if ((0, hasOwnProperty_1.hasOwnProperty)(error, 'suggestions')) {
                    // Support asserting there are no suggestions
                    if (!error.suggestions ||
                        ((0, isReadonlyArray_1.isReadonlyArray)(error.suggestions) &&
                            error.suggestions.length === 0)) {
                        if (Array.isArray(message.suggestions) &&
                            message.suggestions.length > 0) {
                            node_assert_1.default.fail(`Error should have no suggestions on error with message: "${message.message}"`);
                        }
                    }
                    else {
                        (0, node_assert_1.default)(Array.isArray(message.suggestions), `Error should have an array of suggestions. Instead received "${String(message.suggestions)}" on error with message: "${message.message}"`);
                        const messageSuggestions = message.suggestions;
                        node_assert_1.default.strictEqual(messageSuggestions.length, error.suggestions.length, `Error should have ${error.suggestions.length} suggestions. Instead found ${messageSuggestions.length} suggestions`);
                        error.suggestions.forEach((expectedSuggestion, index) => {
                            node_assert_1.default.ok(typeof expectedSuggestion === 'object' &&
                                expectedSuggestion != null, "Test suggestion in 'suggestions' array must be an object.");
                            Object.keys(expectedSuggestion).forEach(propertyName => {
                                node_assert_1.default.ok(validationHelpers_1.SUGGESTION_OBJECT_PARAMETERS.has(propertyName), `Invalid suggestion property name '${propertyName}'. Expected one of ${validationHelpers_1.FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST}.`);
                            });
                            const actualSuggestion = messageSuggestions[index];
                            const suggestionPrefix = `Error Suggestion at index ${index} :`;
                            // @ts-expect-error -- we purposely don't define `desc` on our types as the current standard is `messageId`
                            if ((0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'desc')) {
                                node_assert_1.default.ok(!(0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'data'), `${suggestionPrefix} Test should not specify both 'desc' and 'data'.`);
                                // @ts-expect-error -- we purposely don't define `desc` on our types as the current standard is `messageId`
                                const expectedDesc = expectedSuggestion.desc;
                                node_assert_1.default.strictEqual(actualSuggestion.desc, expectedDesc, `${suggestionPrefix} desc should be "${expectedDesc}" but got "${actualSuggestion.desc}" instead.`);
                            }
                            if ((0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'messageId')) {
                                node_assert_1.default.ok(ruleHasMetaMessages, `${suggestionPrefix} Test can not use 'messageId' if rule under test doesn't define 'meta.messages'.`);
                                node_assert_1.default.ok((0, hasOwnProperty_1.hasOwnProperty)(rule.meta.messages, expectedSuggestion.messageId), `${suggestionPrefix} Test has invalid messageId '${expectedSuggestion.messageId}', the rule under test allows only one of ${friendlyIDList}.`);
                                node_assert_1.default.strictEqual(actualSuggestion.messageId, expectedSuggestion.messageId, `${suggestionPrefix} messageId should be '${expectedSuggestion.messageId}' but got '${actualSuggestion.messageId}' instead.`);
                                if ((0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'data')) {
                                    const unformattedMetaMessage = rule.meta.messages[expectedSuggestion.messageId];
                                    const rehydratedDesc = (0, interpolate_1.interpolate)(unformattedMetaMessage, expectedSuggestion.data);
                                    node_assert_1.default.strictEqual(actualSuggestion.desc, rehydratedDesc, `${suggestionPrefix} Hydrated test desc "${rehydratedDesc}" does not match received desc "${actualSuggestion.desc}".`);
                                }
                            }
                            else {
                                node_assert_1.default.ok(!(0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'data'), `${suggestionPrefix} Test must specify 'messageId' if 'data' is used.`);
                            }
                            if ((0, hasOwnProperty_1.hasOwnProperty)(expectedSuggestion, 'output')) {
                                const codeWithAppliedSuggestion = SourceCodeFixer.applyFixes(item.code, [actualSuggestion]).output;
                                node_assert_1.default.strictEqual(codeWithAppliedSuggestion, expectedSuggestion.output, `Expected the applied suggestion fix to match the test suggestion output for suggestion at index: ${index} on error with message: "${message.message}"`);
                            }
                        });
                    }
                }
            }
            else {
                // Message was an unexpected type
                node_assert_1.default.fail(`Error should be a string, object, or RegExp, but found (${node_util_1.default.inspect(message)})`);
            }
        }
    }
    if ((0, hasOwnProperty_1.hasOwnProperty)(item, 'output')) {
        if (item.output == null) {
            node_assert_1.default.strictEqual(result.output, item.code, 'Expected no autofixes to be suggested');
        }
        else {
            node_assert_1.default.strictEqual(result.output, item.output, 'Output is incorrect.');
        }
    }
    else {
        node_assert_1.default.strictEqual(result.output, item.code, "The rule fixed the code. Please add 'output' property.");
    }
    assertASTDidntChange(result.beforeAST, result.afterAST);
};
/**
 * Check if the AST was changed
 */
function assertASTDidntChange(beforeAST, afterAST) {
    node_assert_1.default.deepStrictEqual(beforeAST, afterAST, 'Rule should not modify AST.');
}
/**
 * Asserts that the message matches its expected value. If the expected
 * value is a regular expression, it is checked against the actual
 * value.
 */
function assertMessageMatches(actual, expected) {
    if (expected instanceof RegExp) {
        // assert.js doesn't have a built-in RegExp match function
        node_assert_1.default.ok(expected.test(actual), `Expected '${actual}' to match ${expected}`);
    }
    else {
        node_assert_1.default.strictEqual(actual, expected);
    }
}
//# sourceMappingURL=RuleTester.js.map