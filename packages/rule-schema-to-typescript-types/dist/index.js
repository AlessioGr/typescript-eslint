"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const utils_1 = require("@typescript-eslint/utils");
const path_1 = __importDefault(require("path"));
const prettier_1 = require("prettier");
const generateType_1 = require("./generateType");
const optimizeAST_1 = require("./optimizeAST");
const printAST_1 = require("./printAST");
const prettierConfig = {
    ...(prettier_1.resolveConfig.sync(__filename) ?? {}),
    filepath: path_1.default.join(__dirname, 'schema.ts'),
};
function compile(schemaIn) {
    const { schema, isArraySchema } = (() => {
        if (utils_1.TSUtils.isArray(schemaIn)) {
            return {
                schema: schemaIn,
                isArraySchema: true,
            };
        }
        return {
            schema: [schemaIn],
            isArraySchema: false,
        };
    })();
    if (schema.length === 0) {
        return ['/** No options declared */', 'type Options = [];'].join('\n');
    }
    const refTypes = [];
    const types = [];
    for (let i = 0; i < schema.length; i += 1) {
        const result = compileSchema(schema[i], i);
        refTypes.push(...result.refTypes);
        types.push(result.type);
    }
    const optionsType = isArraySchema
        ? (0, printAST_1.printTypeAlias)('Options', {
            type: 'tuple',
            elements: types,
            spreadType: null,
            commentLines: [],
        })
        : (0, printAST_1.printTypeAlias)('Options', types[0]);
    const unformattedCode = [...refTypes, optionsType].join('\n\n');
    try {
        return (0, prettier_1.format)(unformattedCode, prettierConfig);
    }
    catch (e) {
        if (e instanceof Error) {
            e.message = e.message + `\n\nUnformatted Code:\n${unformattedCode}`;
        }
        throw e;
    }
}
exports.compile = compile;
function compileSchema(schema, index) {
    const refTypes = [];
    const refMap = new Map();
    // we only support defs at the top level for simplicity
    const defs = schema.$defs ?? schema.definitions;
    if (defs) {
        for (const [defKey, defSchema] of Object.entries(defs)) {
            const typeName = toPascalCase(defKey);
            refMap.set(`#/$defs/${defKey}`, typeName);
            refMap.set(`#/items/${index}/$defs/${defKey}`, typeName);
            const type = (0, generateType_1.generateType)(defSchema, refMap);
            (0, optimizeAST_1.optimizeAST)(type);
            refTypes.push((0, printAST_1.printTypeAlias)(typeName, type));
        }
    }
    const type = (0, generateType_1.generateType)(schema, refMap);
    (0, optimizeAST_1.optimizeAST)(type);
    return {
        type,
        refTypes,
    };
}
function toPascalCase(key) {
    return key[0].toUpperCase() + key.substring(1);
}
//# sourceMappingURL=index.js.map