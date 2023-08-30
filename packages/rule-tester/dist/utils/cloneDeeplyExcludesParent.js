"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeeplyExcludesParent = void 0;
/**
 * Clones a given value deeply.
 * Note: This ignores `parent` property.
 */
function cloneDeeplyExcludesParent(x) {
    if (typeof x === 'object' && x != null) {
        if (Array.isArray(x)) {
            return x.map(cloneDeeplyExcludesParent);
        }
        const retv = {};
        for (const key in x) {
            if (key !== 'parent' && Object.prototype.hasOwnProperty.call(x, key)) {
                retv[key] = cloneDeeplyExcludesParent(x[key]);
            }
        }
        return retv;
    }
    return x;
}
exports.cloneDeeplyExcludesParent = cloneDeeplyExcludesParent;
//# sourceMappingURL=cloneDeeplyExcludesParent.js.map