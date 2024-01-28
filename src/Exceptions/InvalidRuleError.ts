import { Sentence } from "../Grammar/Sentence";
import { Token } from "../Grammar/Token";

export class InvalidRuleError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static outputReferenceWithoutInput = (input: Sentence, output: Sentence, wrongOutputReferences: [string, Token][]): InvalidRuleError => {
        return new InvalidRuleError(`
        The Output "${output.definition}" references Types which are not present in the Input "${input.definition}":
            
            ${wrongOutputReferences.map((reference) => reference[0]).join('\n\t')}
        `);
    };

    public static mismatchingReferenceTypes = (input: Token, output: Token): InvalidRuleError => {
        return new InvalidRuleError(`
        The References with the Name "${input.name}" in the Input and Output have different Types:
            
        Input:  ${input.type}
        Output. ${output.type}

        Adjust the Rule so that each Reference in the Input and Output with an identical Name also references an identical Type!
        `);
    };

    public static inputEqualsOutput = (input: Sentence, output: Sentence): InvalidRuleError => {
        return new InvalidRuleError(`
        The Grammar Rule with the Input "${input.definition}" has an identical Output "${output.definition}".
        This would lead to an infinite self-reference, adjust the Rule so that Input and Output are different.  
        `);
    };
}