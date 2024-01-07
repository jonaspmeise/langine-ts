export class GameRule {
    public readonly rule: string;

    constructor(rule: string) {
        //Sanitize rule
        this.rule = rule
            .trim()
            .replace(new RegExp('\\n', 'g'), ' ');
    }
}