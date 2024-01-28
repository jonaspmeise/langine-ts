export class GameRule {
    public readonly text: string;

    constructor(text: string) {
        //Sanitize rule
        this.text = text
            .trim()
            .replace(new RegExp('\\n', 'g'), ' ');
    }
}