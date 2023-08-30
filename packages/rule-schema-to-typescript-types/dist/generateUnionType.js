"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUnionType = void 0;
const errors_1 = require("./errors");
const generateType_1 = require("./generateType");
function generateUnionType(members, refMap) {
    const elements = [];
    for (const memberSchema of members) {
        elements.push((() => {
            switch (typeof memberSchema) {
                case 'string':
                    return {
                        type: 'literal',
                        code: `'${memberSchema.replace(/'/g, "\\'")}'`,
                        commentLines: [],
                    };
                case 'number':
                case 'boolean':
                    return {
                        type: 'literal',
                        code: `${memberSchema}`,
                        commentLines: [],
                    };
                case 'object':
                    if (memberSchema == null) {
                        throw new errors_1.NotSupportedError('null in an enum', memberSchema);
                    }
                    if (Array.isArray(memberSchema)) {
                        throw new errors_1.NotSupportedError('array in an enum', memberSchema);
                    }
                    return (0, generateType_1.generateType)(memberSchema, refMap);
            }
        })());
    }
    return {
        type: 'union',
        elements,
        commentLines: [],
    };
}
exports.generateUnionType = generateUnionType;
//# sourceMappingURL=generateUnionType.js.map