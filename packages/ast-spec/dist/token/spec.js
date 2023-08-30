"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./BlockComment/spec"), exports);
__exportStar(require("./BooleanToken/spec"), exports);
__exportStar(require("./IdentifierToken/spec"), exports);
__exportStar(require("./JSXIdentifierToken/spec"), exports);
__exportStar(require("./JSXTextToken/spec"), exports);
__exportStar(require("./KeywordToken/spec"), exports);
__exportStar(require("./LineComment/spec"), exports);
__exportStar(require("./NullToken/spec"), exports);
__exportStar(require("./NumericToken/spec"), exports);
__exportStar(require("./PunctuatorToken/spec"), exports);
__exportStar(require("./RegularExpressionToken/spec"), exports);
__exportStar(require("./StringToken/spec"), exports);
__exportStar(require("./TemplateToken/spec"), exports);
//# sourceMappingURL=spec.js.map