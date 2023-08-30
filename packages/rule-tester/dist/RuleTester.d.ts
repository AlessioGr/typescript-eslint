import type { AnyRuleCreateFunction, AnyRuleModule, RuleModule } from '@typescript-eslint/utils/ts-eslint';
import { TestFramework } from './TestFramework';
import type { InvalidTestCase, RuleTesterConfig, RunTests, ValidTestCase } from './types';
export declare class RuleTester extends TestFramework {
    #private;
    /**
     * Creates a new instance of RuleTester.
     */
    constructor(testerConfig?: RuleTesterConfig);
    /**
     * Set the configuration to use for all future tests
     */
    static setDefaultConfig(config: RuleTesterConfig): void;
    /**
     * Get the current configuration used for all tests
     */
    static getDefaultConfig(): Readonly<RuleTesterConfig>;
    /**
     * Reset the configuration to the initial configuration of the tester removing
     * any changes made until now.
     */
    static resetDefaultConfig(): void;
    /**
     * Adds the `only` property to a test to run it in isolation.
     */
    static only<TOptions extends Readonly<unknown[]>>(item: ValidTestCase<TOptions> | string): ValidTestCase<TOptions>;
    /**
     * Adds the `only` property to a test to run it in isolation.
     */
    static only<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(item: InvalidTestCase<TMessageIds, TOptions>): InvalidTestCase<TMessageIds, TOptions>;
    /**
     * Define a rule for one particular run of tests.
     */
    defineRule(name: string, rule: AnyRuleCreateFunction | AnyRuleModule): void;
    /**
     * Adds a new rule test to execute.
     */
    run<TMessageIds extends string, TOptions extends readonly unknown[]>(ruleName: string, rule: RuleModule<TMessageIds, TOptions>, test: RunTests<TMessageIds, TOptions>): void;
    /**
     * Run the rule for the given item
     * @throws {Error} If an invalid schema.
     * Use @private instead of #private to expose it for testing purposes
     */
    private runRuleForItem;
}
//# sourceMappingURL=RuleTester.d.ts.map