import { GrammarRule } from "../Grammar/Rules/GrammarRule";
import { Sentence } from "../Sentence/Sentence";

export class ParsingResult {
    private done: boolean = false;

    public readonly history: Sentence[] = [];

    constructor(private sentence: Sentence) {}

    public apply = (grammarRule: GrammarRule<Sentence, Sentence>): this => {
        this.history.push(this.sentence);
        
        //TODO: Implement this
        this.sentence = grammarRule.applyTo(this.sentence);
        //TODO: When is the process done?

        return this;
    };

    public getSentence = (): Sentence => {
        return this.sentence;
    };

    public isDone = (): boolean => {
        return this.done;
    }
}