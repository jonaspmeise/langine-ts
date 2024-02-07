import { InvalidGrammarRuleError } from "../../Error/InvalidGrammarRuleError";
import { MixedSentence } from "../../Sentence/MixedSentence";
import { Sentence } from "../../Sentence/Sentence";
import { SimpleSentence } from "../../Sentence/SimpleSentence";
import { GrammarRule } from "./GrammarRule";

export class ReplacementGrammarRule<S extends Sentence = SimpleSentence | MixedSentence> extends GrammarRule<S, S> {
    constructor(input: S, output: S) {
        super(input, output);

        if(output instanceof MixedSentence && input instanceof MixedSentence) {
            Array.from(output.references.values()).filter((outputReference) => {
                const matchingReference = Array.from(input.references.values()).find((inputReference) => {
                    return outputReference.name === inputReference.name
                        && outputReference.types.every((type) => inputReference.types.includes(type))
                });

                if(matchingReference === undefined) throw InvalidGrammarRuleError.nonMatchingReferences(input, output);
            });
        }
    }
}