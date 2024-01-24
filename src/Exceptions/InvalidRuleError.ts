import { Reference } from "../Grammar/Reference";
import { Sentence } from "../Grammar/Sentence";

export class InvalidRuleError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static outputReferenceWithoutInput = (input: Sentence, output: Sentence, wrongOutputReferences: [string, Reference][]): InvalidRuleError => {
        return new InvalidRuleError(`
        The Output "${output.text}" references Types which are not present in the Input "${input.text}":
            
            ${wrongOutputReferences.map((reference) => reference[0]).join('\n\t')}
        `);
    };

    public static mismatchingReferenceTypes = (input: Reference, output: Reference): InvalidRuleError => {
        return new InvalidRuleError(`
        The References with the Name "${input.name}" in the Input and Output have different Types:
            
        Input:  ${input.type}
        Output. ${output.type}

        Adjust the Rule so that each Reference in the Input and Output with an identical Name also references an identical Type!
        `);
    };

    public static inputEqualsOutput = (input: Sentence, output: Sentence): InvalidRuleError => {
        return new InvalidRuleError(`
        The Grammar Rule with the Input "${input.text}" has an identical Output "${output.text}".
        This would lead to an infinite self-reference, adjust the Rule so that Input and Output are different.  
        `);
    };
}