import { SimpleSentence } from "../Sentence/SimpleSentence";

export class GameRule {
    constructor(public readonly definition: SimpleSentence) {}

    public static of = (text: string): GameRule => {
        return new GameRule(new SimpleSentence(text));
    };
}