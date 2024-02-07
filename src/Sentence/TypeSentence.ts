import { Reference } from "../Reference/Reference";
import { Sentence } from "./Sentence";

export class TypeSentence extends Sentence {
    constructor(reference: Reference) {
        //We only expect a single reference, but a general sentence (can) hold multiple ones
        super(reference.toRenderString(), new Map([[reference.id, reference]]));
    }
}