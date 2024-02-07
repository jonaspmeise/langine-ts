import { Sentence } from "../Sentence/Sentence";

export class InvalidGrammarRuleError extends Error {
    constructor(message: string) {
        super(message);
    }
    
    public static nonMatchingReferences = (input: Sentence, output: Sentence): InvalidGrammarRuleError => {
        return new InvalidGrammarRuleError(`
        For the given Rule, the output sentence has References which do not appear in the input sentence:

        output: ${output.definition}
        input:  ${input.definition}

        Please make sure that all References appearing in the Output also appear in the Input.
        `);
    };
}