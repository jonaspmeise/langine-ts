import { InvalidSentenceError } from "../Error/InvalidSentenceError";
import { Sentence } from "./Sentence";

export class SimpleSentence extends Sentence {
    constructor(definition: string) {
        super(definition);
        
        if(Sentence.hasReferences(definition)) throw InvalidSentenceError.simpleSentenceWithReferences(definition);
    }
}