"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnexpectedError = exports.NotSupportedError = void 0;
class NotSupportedError extends Error {
    constructor(thing, target) {
        super(`Generating a type for ${thing} is not currently supported:\n${JSON.stringify(target, null, 2)}`);
    }
}
exports.NotSupportedError = NotSupportedError;
class UnexpectedError extends Error {
    constructor(error, target) {
        super(`Unexpected Error: ${error}:\n${JSON.stringify(target, null, 2)}`);
    }
}
exports.UnexpectedError = UnexpectedError;
//# sourceMappingURL=errors.js.map