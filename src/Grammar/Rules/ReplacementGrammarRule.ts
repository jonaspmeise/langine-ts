import { GrammarRuleError } from "../../Error/GrammarRuleError";
import { MixedSentence } from "../../Sentence/MixedSentence";
import { Sentence } from "../../Sentence/Sentence";
import { SimpleSentence } from "../../Sentence/SimpleSentence";
import { GrammarRule } from "./GrammarRule";

export class ReplacementGrammarRule<S extends Sentence = SimpleSentence | MixedSentence> extends GrammarRule<S, S> {
    constructor(input: S, output: S) {
        super(input, output);

        if(output instanceof MixedSentence && input instanceof MixedSentence) {
            Array.from(output.references.values()).forEach((outputReference) => {
                const matchingReference = Array.from(input.references.values()).find((inputReference) => {
                    return outputReference.name === inputReference.name
                        && Array.from(outputReference.types).every((type) => Array.from(inputReference.types).includes(type)); //TODO: FIXME: Use better set comparison operators here!
                });

                if(matchingReference === undefined) throw GrammarRuleError.nonMatchingReferences(input, output);
                
                //TODO: Super Hacky!!!
                //We need to also update the References in the Output with the IDs of the Input, to make future matching easier
                output.references.delete(outputReference.id);
                output.references.set(matchingReference.id, matchingReference);

                //Also replace the text
                this.output.setDefinition(this.output.getDefinition().replace(outputReference.id, matchingReference.id));
            });
        }
    }
}