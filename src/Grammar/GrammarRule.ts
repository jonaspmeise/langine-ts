import { InvalidRuleError } from "../Exceptions/InvalidRuleError";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { Logger } from "../Logger/Logger";
import { ParsingResult } from "./ParsingResult";
import { Sentence } from "./Sentence";

interface GrammarRuleContract {
    getInput(): Sentence;
    getOutput(): Sentence;
    isApplicable(text: string): boolean;
    apply(text: string): ParsingResult;
}

export class GrammarRule implements GrammarRuleContract {
    constructor(private input: Sentence, private output: Sentence, logger: Logger = new DefaultLogger()) {
        logger.info('start');

        if(input.text === output.text) throw InvalidRuleError.inputEqualsOutput(input, output);

        if(input.isMixedSentence() && output.isMixedSentence()) {
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

    isApplicable = (text: string): boolean => {
        return this.input.matchRegex.test(text);
    };

    apply = (text: string): ParsingResult => {
        return {text: text.replace(this.input.textWithoutTypes, this.output.textWithoutTypes), history: []};
    };

    public getInput = (): Sentence => {
        return this.input;
    };

    public getOutput = (): Sentence => {
        return this.output;
    };

    public static create = (input: string, output: string, logger: Logger = new DefaultLogger()) => {
        return new GrammarRule(new Sentence(input), new Sentence(output), logger);
    };
}