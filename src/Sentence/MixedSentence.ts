import { References } from "../Reference/Reference";
import { Sentence } from "./Sentence";

export class MixedSentence extends Sentence {
    constructor(definition: string, public readonly references: References) {
        super(definition);
        //TODO: Test: Check whether the References provided actually show up in the Definition.
    }
}