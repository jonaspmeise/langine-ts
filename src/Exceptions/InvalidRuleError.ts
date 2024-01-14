import { Reference } from "../Grammar/Reference";
import { Token } from "../Grammar/Tokens";

export class InvalidRuleError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static outputReferenceWithoutInput = (input: Token, output: Token, wrongOutputReferences: [string, Reference][]): InvalidRuleError => {
        return new InvalidRuleError(`
        The Output Token "${output.text}" references Types which are not present in the Input Token "${input.text}":
            
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
}