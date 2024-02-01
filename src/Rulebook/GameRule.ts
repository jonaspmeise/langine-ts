import { Sentence } from "../Grammar/Sentence";

export class GameRule {
    public readonly text: string;

    constructor(text: string) {
        //Sanitize rule
        this.text = text
            .trim()
            .replace(new RegExp('\\n', 'g'), ' ');
    }

    public toSentence = (): Sentence => {
        return new Sentence(this.text);
    }
}