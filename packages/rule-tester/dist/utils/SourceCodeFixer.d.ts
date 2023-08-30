import type { Linter } from '@typescript-eslint/utils/ts-eslint';
type LintMessage = Linter.LintMessage | Linter.LintSuggestion;
/**
 * Applies the fixes specified by the messages to the given text. Tries to be
 * smart about the fixes and won't apply fixes over the same area in the text.
 * @param sourceText The text to apply the changes to.
 * @param  messages The array of messages reported by ESLint.
 * @returns {Object} An object containing the fixed text and any unfixed messages.
 */
export declare function applyFixes(sourceText: string, messages: readonly LintMessage[]): {
    fixed: boolean;
    messages: readonly LintMessage[];
    output: string;
};
export {};
//# sourceMappingURL=SourceCodeFixer.d.ts.map