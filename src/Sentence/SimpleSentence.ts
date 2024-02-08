import { SentenceError } from "../Error/SentenceError";
import { Sentence } from "./Sentence";

export class SimpleSentence extends Sentence {
    constructor(definition: string) {
        super(definition);
        
        if(Sentence.hasReferences(definition)) throw SentenceError.simpleSentenceWithReferences(definition);
    }
}