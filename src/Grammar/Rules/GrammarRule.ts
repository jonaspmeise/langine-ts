import { Sentence } from "../../Sentence/Sentence";

export abstract class GrammarRule<I extends Sentence, O extends Sentence> {
    constructor(
        public readonly input: I,
        public readonly output: O
    ) {}
}