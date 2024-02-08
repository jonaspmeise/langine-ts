import { GrammarRule } from "../Grammar/Rules/GrammarRule";
import { Sentence } from "../Sentence/Sentence";

export class GrammarRuleError extends Error {
    constructor(message: string) {
        super(message);
    }
    
    public static nonMatchingReferences = (input: Sentence, output: Sentence): GrammarRuleError => {
        return new GrammarRuleError(`
        For the given Rule, the output sentence has References which do not appear in the input sentence:

        output: ${output.getDefinition()}
        input:  ${input.getDefinition()}

        Please make sure that all References appearing in the Output also appear in the Input.
        `);
    };

    public static cantBeApplied = (rule: GrammarRule<Sentence, Sentence>, sentence: Sentence) => {
        return new GrammarRuleError(`
        The Grammar Rule
        
        ${rule.pretty()}
        
        can not be applied to the following sentence:

        ${sentence.getDefinition()}
        `);
    };
}