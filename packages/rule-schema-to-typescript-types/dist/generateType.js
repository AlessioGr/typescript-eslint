"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateType = void 0;
const utils_1 = require("@typescript-eslint/utils");
const errors_1 = require("./errors");
const generateArrayType_1 = require("./generateArrayType");
const generateObjectType_1 = require("./generateObjectType");
const generateUnionType_1 = require("./generateUnionType");
const getCommentLines_1 = require("./getCommentLines");
// keywords we probably should support but currently do not support
const UNSUPPORTED_KEYWORDS = new Set([
    'allOf',
    'dependencies',
    'extends',
    'maxProperties',
    'minProperties',
    'multipleOf',
    'not',
    'patternProperties',
]);
function generateType(schema, refMap) {
    const unsupportedProps = Object.keys(schema).filter(key => UNSUPPORTED_KEYWORDS.has(key));
    if (unsupportedProps.length > 0) {
        throw new errors_1.NotSupportedError(unsupportedProps.join(','), schema);
    }
    const commentLines = (0, getCommentLines_1.getCommentLines)(schema);
    if (schema.$ref) {
        const refName = refMap.get(schema.$ref);
        if (refName == null) {
            throw new errors_1.UnexpectedError(`Could not find definition for $ref ${schema.$ref}.\nAvailable refs:\n${Array.from(refMap.keys()).join('\n')})`, schema);
        }
        return {
            type: 'type-reference',
            typeName: refName,
            commentLines,
        };
    }
    if ('enum' in schema && schema.enum) {
        return {
            ...(0, generateUnionType_1.generateUnionType)(schema.enum, refMap),
            commentLines,
        };
    }
    if ('anyOf' in schema && schema.anyOf) {
        return {
            // a union isn't *TECHNICALLY* correct - technically anyOf is actually
            // anyOf: [T, U, V] -> T | U | V | T & U | T & V | U & V
            // in practice though it is most used to emulate a oneOf
            ...(0, generateUnionType_1.generateUnionType)(schema.anyOf, refMap),
            commentLines,
        };
    }
    if ('oneOf' in schema && schema.oneOf) {
        return {
            ...(0, generateUnionType_1.generateUnionType)(schema.oneOf, refMap),
            commentLines,
        };
    }
    if (!('type' in schema) || schema.type == null) {
        throw new errors_1.NotSupportedError('untyped schemas without one of [$ref, enum, oneOf]', schema);
    }
    if (utils_1.TSUtils.isArray(schema.type)) {
        throw new errors_1.NotSupportedError('schemas with multiple types', schema);
    }
    switch (schema.type) {
        case 'any':
            return {
                type: 'type-reference',
                typeName: 'unknown',
                commentLines,
            };
        case 'null':
            return {
                type: 'type-reference',
                typeName: 'null',
                commentLines,
            };
        case 'number':
        case 'string':
            return {
                type: 'literal',
                code: schema.type,
                commentLines,
            };
        case 'array':
            return (0, generateArrayType_1.generateArrayType)(schema, refMap);
        case 'boolean':
            return {
                type: 'type-reference',
                typeName: 'boolean',
                commentLines,
            };
        case 'integer':
            return {
                type: 'type-reference',
                typeName: 'number',
                commentLines,
            };
        case 'object':
            return (0, generateObjectType_1.generateObjectType)(schema, refMap);
    }
}
exports.generateType = generateType;
//# sourceMappingURL=generateType.js.map