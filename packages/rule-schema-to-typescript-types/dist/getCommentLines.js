"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentLines = void 0;
function getCommentLines(schema) {
    const lines = [];
    if (schema.description) {
        lines.push(schema.description);
    }
    return lines;
}
exports.getCommentLines = getCommentLines;
//# sourceMappingURL=getCommentLines.js.map