import { MixedSentence } from "../../Sentence/MixedSentence";
import { Sentence } from "../../Sentence/Sentence";
import { SimpleSentence } from "../../Sentence/SimpleSentence";
import { TypeSentence } from "../../Sentence/TypeSentence";
import { ReplacementGrammarRule } from "./ReplacementGrammarRule";
import { TypeGrammarRule } from "./TypeGrammarRule";

export abstract class GrammarRule<I extends Sentence, O extends Sentence> {
    constructor(
        public readonly input: I,
        public readonly output: O
    ) {}

    public static build = (input: Sentence, output: Sentence) => {
        //Discard non-plausible combinations.

        //Type as Input only works if the Output is a Type, too.
        if(input instanceof TypeSentence && !(output instanceof TypeSentence)) throw new Error();
        
        //If the Input is mixed, the Output would lose Token information if it had only normal Tokens.
        if(input instanceof MixedSentence && output instanceof SimpleSentence) throw new Error();

        //If the Output is a Type, all the Input is consumed into the new Token and the Consumer Function called.
        if(output instanceof TypeSentence) return new TypeGrammarRule(input, output);
        
        //Otherwise: Shuffle around Tokens
        return new ReplacementGrammarRule(input, output);
    }
}