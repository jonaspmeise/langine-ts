import { InvalidSentenceError } from "../Error/InvalidSentenceError";
import { Reference } from "../Reference/Reference";
import { MixedSentence } from "./MixedSentence";
import { Sentence } from "./Sentence";
import { SimpleSentence } from "./SimpleSentence";
import { TypeSentence } from "./TypeSentence";

export class SentenceFactory {
    static parse = (text: string): Sentence => {
        //TODO: If the Text only has normal Tokens, make it a SimpleSentence

        if(!Sentence.hasReferences(text)) return new SimpleSentence(text);

        const references = Reference.parseReferences(text);

        //Not a Simple Sentence, but has no References either? Impossible Case!
        if(references === undefined || references.size === 0) throw InvalidSentenceError.wrongFormat(text);

        if(!Sentence.hasNormalTokens(text)) return new TypeSentence(Array.from(references.values())[0]);

        return new MixedSentence(text);
    }
}