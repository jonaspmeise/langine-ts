import { Reference } from "../Reference/Reference";
import { Sentence } from "./Sentence";

export class TypeSentence extends Sentence {
    constructor(public readonly reference: Reference) {
        super(reference.toRenderString());
    }
}