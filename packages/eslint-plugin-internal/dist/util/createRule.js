"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
const utils_1 = require("@typescript-eslint/utils");
// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version } = require('../../package.json');
const createRule = utils_1.ESLintUtils.RuleCreator(name => `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin-internal/src/rules/${name}.ts`);
exports.createRule = createRule;
//# sourceMappingURL=createRule.js.map