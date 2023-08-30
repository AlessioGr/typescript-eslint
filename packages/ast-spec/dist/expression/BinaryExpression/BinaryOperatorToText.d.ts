import type { SyntaxKind } from 'typescript';
export interface BinaryOperatorToText {
    [SyntaxKind.InstanceOfKeyword]: 'instanceof';
    [SyntaxKind.InKeyword]: 'in';
    [SyntaxKind.AsteriskAsteriskToken]: '**';
    [SyntaxKind.AsteriskToken]: '*';
    [SyntaxKind.SlashToken]: '/';
    [SyntaxKind.PercentToken]: '%';
    [SyntaxKind.PlusToken]: '+';
    [SyntaxKind.MinusToken]: '-';
    [SyntaxKind.AmpersandToken]: '&';
    [SyntaxKind.BarToken]: '|';
    [SyntaxKind.CaretToken]: '^';
    [SyntaxKind.LessThanLessThanToken]: '<<';
    [SyntaxKind.GreaterThanGreaterThanToken]: '>>';
    [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>';
    [SyntaxKind.AmpersandAmpersandToken]: '&&';
    [SyntaxKind.BarBarToken]: '||';
    [SyntaxKind.LessThanToken]: '<';
    [SyntaxKind.LessThanEqualsToken]: '<=';
    [SyntaxKind.GreaterThanToken]: '>';
    [SyntaxKind.GreaterThanEqualsToken]: '>=';
    [SyntaxKind.EqualsEqualsToken]: '==';
    [SyntaxKind.EqualsEqualsEqualsToken]: '===';
    [SyntaxKind.ExclamationEqualsEqualsToken]: '!==';
    [SyntaxKind.ExclamationEqualsToken]: '!=';
}
//# sourceMappingURL=BinaryOperatorToText.d.ts.map