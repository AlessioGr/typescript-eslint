"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateObjectType = void 0;
const type_utils_1 = require("@typescript-eslint/type-utils");
const utils_1 = require("@typescript-eslint/utils");
const generateType_1 = require("./generateType");
const getCommentLines_1 = require("./getCommentLines");
function generateObjectType(schema, refMap) {
    const commentLines = (0, getCommentLines_1.getCommentLines)(schema);
    let indexSignature = null;
    if (schema.additionalProperties === true ||
        schema.additionalProperties === undefined) {
        indexSignature = {
            type: 'type-reference',
            typeName: 'unknown',
            commentLines: [],
        };
    }
    else if (typeof schema.additionalProperties === 'object') {
        const indexSigType = (0, generateType_1.generateType)(schema.additionalProperties, refMap);
        indexSignature = indexSigType;
    }
    const properties = [];
    const required = new Set(utils_1.TSUtils.isArray(schema.required) ? schema.required : []);
    if (schema.properties) {
        const propertyDefs = Object.entries(schema.properties);
        for (const [propName, propSchema] of propertyDefs) {
            const propType = (0, generateType_1.generateType)(propSchema, refMap);
            const sanitisedPropName = (0, type_utils_1.requiresQuoting)(propName)
                ? `'${propName}'`
                : propName;
            properties.push({
                name: sanitisedPropName,
                optional: !required.has(propName),
                type: propType,
            });
        }
    }
    return {
        type: 'object',
        properties,
        indexSignature,
        commentLines,
    };
}
exports.generateObjectType = generateObjectType;
//# sourceMappingURL=generateObjectType.js.map