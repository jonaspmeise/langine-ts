import { InvalidRuleError } from "../Exceptions/InvalidRuleError";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { Logger } from "../Logger/Logger";
import { ParsingResult } from "./ParsingResult";
import { Sentence } from "./Sentence";
import { Token } from "./Token";

interface GrammarRuleContract {
    getInput(): Sentence;
    getOutput(): Sentence;
    isApplicable(text: Sentence): boolean;
    apply(text: Sentence): ParsingResult;
}

export class GrammarRule implements GrammarRuleContract {
    constructor(private input: Sentence, private output: Sentence, logger: Logger = new DefaultLogger()) {
        logger.info('start');

        if(input.definition === output.definition) throw InvalidRuleError.inputEqualsOutput(input, output);

        if(input.isMixedSentence() && output.isMixedSentence()) {
            //Find out how the Types in the Input and Output align
            const wrongOutputReferences = [...output.tokens.entries()].filter(([key, outputReference]) => {
                const inputReference = this.input.tokens.get(key);

                //The identical Reference in Input and Output has to reference the same Name AND Type!
                if(inputReference) {
                    if(outputReference.type !== inputReference.type) throw InvalidRuleError.mismatchingReferenceTypes(inputReference, outputReference);
                }

                return !inputReference;
            });

            if(wrongOutputReferences.length > 0) throw InvalidRuleError.outputReferenceWithoutInput(input, output, wrongOutputReferences);

            const nonUsedInputReferences = [...input.tokens.entries()].filter(([key, _]) => !this.output.tokens.has(key));
            
            if(nonUsedInputReferences.length > 0) logger.warn(`
                There are referenced Types in the Input which are not used in the Output:
                Input:  ${input.definition}
                Output: ${output.definition}
                
                Referenced Types not used in the Output: ${nonUsedInputReferences.map(([key, _]) => key)}
            `);
        }
    }

    isApplicable = (sentence: Sentence): boolean => {
        return this.input.matchRegex.test(sentence.definition);
    };

    apply = (sentence: Sentence, history: string[] = []): ParsingResult => {
        //TODO: Apply the grammar rule to the game Rule!
        //if(gameRule === gameRule) throw ParsingError.writebackFailed(rule, ruleToApply);

        //...and that we will not cause an infinite loop by revisiting already past-seen states
        //if(history.includes(appliedRule.rule)) throw ParsingError.infiniteSelfReference(appliedRule.text, ruleToApply, history);
        const regex = this.input.matchRegex;
        const input = sentence.definition;
        
        const results = Array.from(input.matchAll(new RegExp(regex)));
        let text = sentence.definition;
        let types: Map<string, Token> = new Map();

        [...sentence.tokens.entries()].forEach(([key, value]) => {
            types.set(key, value);
        });

        //TODO: Test: A Grammar Rule which has two matches to a given Sentence, only applies it once though.
        results.find((result) => {
            if(sentence.isSimpleSentence() || sentence.isMixedSentence()) {
                //we don't expect capture groups here, so we just replace simple Tokens
                if(this.output.isTypeSentence()) {
                    //The Type Token which "consumes" the Tokens from the Input
                    const outputToken: Token = [...this.output.tokens.values()][0];

                    //TODO: Test: If the same Grammar Rule is applied to a sentence, the token get different IDs
                    const token: Token = new Token(outputToken.type, outputToken.name);

                    //[0] here because we only replace one match per step
                    text = text.replace(result[0], `<<${token.id}>>`);

                    //TODO: Test: What if the key already exists? Issue warning  /Error?
                    types.set(token.id, token);
                }
            }
        });

        return {sentence: new Sentence(text, types), history: history.concat(sentence.definition)};
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

    public pretty = (): string => {
        return `${this.getInput().definition} -> ${this.getOutput().definition}`;
    }
}