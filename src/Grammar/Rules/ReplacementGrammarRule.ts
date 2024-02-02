import { MixedSentence } from "../../Sentence/MixedSentence";
import { Sentence } from "../../Sentence/Sentence";
import { SimpleSentence } from "../../Sentence/SimpleSentence";
import { GrammarRule } from "./GrammarRule";

export class ReplacementGrammarRule<S extends Sentence = SimpleSentence | MixedSentence> extends GrammarRule<S, S> {
    constructor(input: S, output: S) {
        super(input, output);
        //TODO: Test: See that if there are Tokens in the Input/Output, that the Output Tokens are a subset of the Input Tokens.
    }
}