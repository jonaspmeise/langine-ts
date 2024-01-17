import { GrammarRule } from "../Grammar/GrammarRule";

export class ParsingError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noApplicableRuleFound = (text: string): ParsingError => {
        return new ParsingError(`
        No applicable Rule could be found to parse:
            ${text}
        `);
    };

    public static infiniteSelfReference = (text: string, sourceRule: GrammarRule, history: string[]): ParsingError => {
        return new ParsingError(`
        While parsing "${text}", an infinite self-reference happened when applying the Rule "${sourceRule.getInput().text} -> ${sourceRule.getOutput().text}":

        ${history.join(`\n\t`)}
        `);
    };
}