import { SimpleSentence } from "../Sentence/SimpleSentence";

export class GameRule {
    constructor(public readonly sentence: SimpleSentence) {}

    public static from = (text: string): GameRule => {
        return new GameRule(new SimpleSentence(text));
    };
}