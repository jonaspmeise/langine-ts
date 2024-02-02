import { Sentence } from "../Sentence/Sentence";
import { GrammarRule } from "./Rules/GrammarRule";

export class Grammar {
    constructor(public readonly rules: GrammarRule<Sentence, Sentence>[]) {}
}