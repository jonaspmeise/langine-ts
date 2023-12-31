export class GameRule {
    // @ts-ignore //TODO: This should disappear some point...
    private rule: string;

    constructor(rule: string) {
        //Sanitize rule
        this.rule = rule
            .trim()
            .replace(new RegExp('\\n', 'g'), ' ');
    }
}