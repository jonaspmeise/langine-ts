import { InvalidRuleError } from "../Exceptions/InvalidRuleError";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { Logger } from "../Logger/Logger";
import { GrammarFunction } from "./GrammarFunction";
import { Token } from "./Tokens";

interface GrammarRuleContract {
    getInput(): Token;
    getOutput(): Token;
    getFunction(): GrammarFunction;
}

export class GrammarRule implements GrammarRuleContract {
    constructor(private input: Token, private output: Token, logger: Logger = new DefaultLogger()) {
        logger.info('start');

        if(input.text === output.text) throw InvalidRuleError.inputEqualsOutput(input, output);

        if(input.isMixedToken() && output.isMixedToken()) {
            //Find out how the Types in the Input and Output align
            const wrongOutputReferences = [...output.references.entries()].filter(([key, outputReference]) => {
                const inputReference = this.input.references.get(key);

                //The identical Reference in Input and Output has to reference the same Name AND Type!
                if(inputReference) {
                    if(outputReference.type !== inputReference.type) throw InvalidRuleError.mismatchingReferenceTypes(inputReference, outputReference);
                }

                return !inputReference;
            });

            if(wrongOutputReferences.length > 0) throw InvalidRuleError.outputReferenceWithoutInput(input, output, wrongOutputReferences);

            const nonUsedInputReferences = [...input.references.entries()].filter(([key, _]) => !this.output.references.has(key));
            
            if(nonUsedInputReferences.length > 0) logger.warn(`
                There are referenced Types in the Input which are not used in the Output:
                Input:  ${input.text}
                Output: ${output.text}
                
                Referenced Types not used in the Output: ${nonUsedInputReferences.map(([key, _]) => key)}
            `);
        }
    }

    public getInput = (): Token => {
        return this.input;
    };

    public getOutput = (): Token => {
        return this.output;
    };

    public getFunction = (): GrammarFunction => {
        return () => undefined;
    };

    public static create = (input: string, output: string, logger: Logger = new DefaultLogger()) => {
        return new GrammarRule(new Token(input), new Token(output), logger);
    };
}