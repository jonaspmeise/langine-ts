import { Sentence } from "../../Sentence/Sentence";
import { GrammarRule } from "./GrammarRule";

export class ApplicableTokens {
    constructor(
        public readonly rule: GrammarRule<Sentence, Sentence>, //where do the tokens come from?
        public readonly matchedText: string, //what is the text that should be replaced in the sentence?
        public readonly referenceMatches: Map<string, string> //are tokens mapped onto each other?
    ) {}
}