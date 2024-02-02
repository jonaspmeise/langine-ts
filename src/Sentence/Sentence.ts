import { Reference } from "../Reference/Reference";
import { MixedSentence } from "./MixedSentence";
import { SimpleSentence } from "./SimpleSentence";
import { TypeSentence } from "./TypeSentence";

export abstract class Sentence {
    constructor(public readonly definition: string) {};

    static parse = (text: string): Sentence => {
        //TODO: If the Text only has norrmal Tokens, make it a SimpleSentence

        if(!this.hasReferences(text)) return new SimpleSentence(text);

        const references = Reference.parseReferences(text);

        //Not a Simple Sentence, but has no References either? Impossible Case!
        if(references.size === 0) throw Error();

        if(!this.hasNormalTokens(text)) return new TypeSentence(Array.from(references.values())[0]);

        return new MixedSentence(text, references);
    }

    //TODO: Test: Unit-Tests for this
    protected static hasReferences = (text: string): boolean => {
        return false;
    };

    //TODO: Test: Unit-Tests for this
    protected static hasNormalTokens = (text: string): boolean => {
        return false;
    };
}