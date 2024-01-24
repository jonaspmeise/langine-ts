import { GrammarRule } from "../Grammar/GrammarRule";

export class ParsingError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noApplicableRuleFound = (text: string, history: string[] = []): ParsingError => {
        return new ParsingError(`
        No applicable Rule could be found to parse:
            ${text}

        ${history.length > 0 ? `History:
        ${history.join('\n\t')}`: ''}
        `);
    };

    public static infiniteSelfReference = (text: string, sourceRule: GrammarRule, history: string[]): ParsingError => {
        return new ParsingError(`
        After parsing "${text}", an infinite self-reference has been encountered due to applying the Rule "${sourceRule.getInput().text} -> ${sourceRule.getOutput().text}":

        ${history.join(`\n\t`)}
        `);
    };

    public static writebackFailed = (text: string, rule: GrammarRule): ParsingError => {
        return new ParsingError(`
        The Rule "${rule.getInput().text} -> ${rule.getOutput().text}" could not be applied to the following text in which the Input got found:

        ${text}
        `);
    };
}