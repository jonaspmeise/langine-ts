import { GrammarRule } from "../Grammar/GrammarRule";
import { Sentence } from "../Grammar/Sentence";

export class ParsingError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noApplicableRuleFound = (text: Sentence, history: string[] = []): ParsingError => {
        return new ParsingError(`
        No applicable Grammar Rule could be found to parse:
            ${text.definition}

        ${history.length > 0 ? `History:
        ${history.join('\n\t')}`: ''}
        `);
    };

    public static infiniteSelfReference = (text: string, sourceRule: GrammarRule, history: string[]): ParsingError => {
        return new ParsingError(`
        After parsing "${text}", an infinite self-reference has been encountered due to applying the Rule "${sourceRule.getInput().definition} -> ${sourceRule.getOutput().definition}":

        ${history.join(`\n\t`)}
        `);
    };

    public static writebackFailed = (sentence: Sentence, grammarRule: GrammarRule): ParsingError => {
        return new ParsingError(`
        The Rule "${grammarRule.pretty()}" could not be applied to the following text in which the Input got found:

        ${sentence.definition}
        `);
    };
}